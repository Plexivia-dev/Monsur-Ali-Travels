import mongoose from "mongoose";
import TaskModel from "../../models/task.model.js";
import CaseFile from "../../models/caseFile.model.js";
import MoneyReceiptModel, { generateReceiptTokenNo } from "../../models/moneyReceipt.model.js";
import { NotificationModel } from "../../models/notification.model.js";
import { generateDid } from "../../utils/generateDid.js";
import { sendTaskCompletedEmailToOwners } from "../../services/emailNotification.service.js";

/**
 * 1. Get My Tasks (Staff Scope)
 * Returns tasks assigned to the authenticated user's DID
 * Populates permittedDocs based on allowedDocumentDids
 */
export const getMyTasks = async (req, res) => {
  try {
    const userDid = req.user?.did;
    if (!userDid) {
      return res.status(400).json({ status: "error", message: "User DID missing from request" });
    }

    const tasks = await TaskModel.find({ assignedToDid: userDid })
      .populate("permittedDocs")
      .sort({ updatedAt: -1 })
      .lean();

    return res.status(200).json({
      status: "success",
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message || "Failed to fetch staff tasks",
    });
  }
};

/**
 * 2. Mark Task as Done (Staff Scope)
 * Staff submits completion notes, payment intake, and updates task status to 'Done'
 */
export const markTaskDone = async (req, res) => {
  try {
    const { taskId } = req.params;
    const {
      completionNotes,
      paymentCollectedAmount,
      paymentMethod,
      paymentSlipUrl,
      generateMoneyReceipt,
    } = req.body || {};
    const userDid = req.user?.did;

    const isMongoId = mongoose.isValidObjectId(taskId);
    const conditions = [{ did: taskId }];
    if (isMongoId) conditions.push({ _id: taskId });
    const task = await TaskModel.findOne({ $or: conditions });
    if (!task) {
      return res.status(404).json({ status: "error", message: "Task not found" });
    }

    if (task.assignedToDid !== userDid && req.user?.role !== "Admin" && req.user?.role !== "Owner") {
      return res.status(403).json({ status: "error", message: "You are not assigned to this task" });
    }

    task.status = "Done";
    task.completedAt = new Date();
    if (completionNotes) task.completionNotes = completionNotes;
    task.updatedByDid = userDid;

    // Handle Payment Collection & Pay Slip / Money Receipt Creation
    const collected = Number(paymentCollectedAmount) || (task.requiresPayment ? Number(task.paymentAmount) : 0);
    if (collected > 0) {
      task.paymentCollectedAmount = collected;
      task.paymentMethod = paymentMethod || "Cash";
      if (paymentSlipUrl) task.paymentSlipUrl = paymentSlipUrl;

      // Find Case File to attach receipt details
      const isCaseMongoId = mongoose.isValidObjectId(task.caseDid);
      const caseConditions = [{ did: task.caseDid }, { caseNumber: task.caseDid }];
      if (isCaseMongoId) caseConditions.push({ _id: task.caseDid });
      let caseDoc = await CaseFile.findOne({ $or: caseConditions });

      if (generateMoneyReceipt || task.requirePaySlip || collected > 0) {
        try {
          const receiptNo = generateReceiptTokenNo();
          const clientName = caseDoc ? (caseDoc.applicantName || caseDoc.clientInfo?.fullName || "Client") : "Client";
          const newReceipt = await MoneyReceiptModel.create({
            did: generateDid(),
            receiptNo,
            clientName,
            clientPhone: caseDoc ? (caseDoc.phone || "") : "",
            passportNumber: caseDoc ? (caseDoc.passportNumber || "") : "",
            clientDid: caseDoc ? caseDoc.clientDid : null,
            amount: collected,
            currency: task.paymentCurrency || "BDT",
            paymentMethod: paymentMethod || "Cash",
            serviceType: "Visa & Case Processing Fee",
            purpose: task.paymentPurpose || task.title,
            serviceRef: {
              modelName: "CaseFile",
              trackingId: caseDoc ? (caseDoc.caseNumber || caseDoc.did) : task.caseDid,
            },
            status: "confirmed",
            createdByDid: userDid,
            createdByName: req.user?.name || "Staff",
            receivedBy: req.user?.name || "Accounts Officer",
            notes: completionNotes || `Collected during Step ${task.stepNumber || 1}: ${task.title}`,
          });

          task.moneyReceiptDid = newReceipt.did;
          task.moneyReceiptNumber = newReceipt.receiptNo;

          // Attach created receipt to task permittedDocs
          if (!Array.isArray(task.permittedDocs)) task.permittedDocs = [];
          task.permittedDocs.push({
            did: newReceipt.did,
            documentName: `Money Receipt #${newReceipt.receiptNo}`,
            fileName: `Receipt-${newReceipt.receiptNo}.pdf`,
            fileUrl: `/api/v1/client/receipts/${newReceipt._id}/pdf`,
            fileType: "application/pdf",
            accessLevel: "Public",
          });

          // Attach to caseDoc vaultDocuments & update payment ledger
          if (caseDoc) {
            if (!Array.isArray(caseDoc.vaultDocuments)) caseDoc.vaultDocuments = [];
            caseDoc.vaultDocuments.push({
              did: generateDid(),
              documentName: `Money Receipt #${newReceipt.receiptNo}`,
              fileName: `Receipt-${newReceipt.receiptNo}.pdf`,
              fileUrl: `/api/v1/client/receipts/${newReceipt._id}/pdf`,
              fileType: "application/pdf",
              fileSize: "1.0 MB",
              accessLevel: "Public",
              uploadedBy: req.user?.name || "Staff",
              uploadedAt: new Date(),
            });

            // Update Case Financial Ledger
            if (!caseDoc.paymentLedger) caseDoc.paymentLedger = {};
            const stepNum = task.stepNumber || 1;
            if (stepNum === 1) {
              caseDoc.paymentLedger.step1_advance = (Number(caseDoc.paymentLedger.step1_advance) || 0) + collected;
              caseDoc.initialPaidAmount = caseDoc.paymentLedger.step1_advance;
            } else if (stepNum === 2) {
              caseDoc.paymentLedger.step2_offerApproval = (Number(caseDoc.paymentLedger.step2_offerApproval) || 0) + collected;
            } else if (stepNum === 3) {
              caseDoc.paymentLedger.step3_delivery = (Number(caseDoc.paymentLedger.step3_delivery) || 0) + collected;
            }

            const currentTotalPaid = (Number(caseDoc.totalPaidAmount) || 0) + collected;
            caseDoc.paymentLedger.totalPaidAmount = currentTotalPaid;
            caseDoc.totalPaidAmount = currentTotalPaid;
            const agreed = Number(caseDoc.paymentLedger.totalAgreedAmount || caseDoc.totalAgreedAmount) || 0;
            caseDoc.dueAmount = Math.max(0, agreed - currentTotalPaid);
            caseDoc.paymentLedger.dueAmount = caseDoc.dueAmount;
          }
        } catch (receiptErr) {
          console.warn("[markTaskDone] Auto Money Receipt generation notice:", receiptErr.message);
        }
      }
    }

    await task.save();

    // Synchronize Case File: Record step completion in history and reset active assignment
    try {
      const isCaseMongoId = mongoose.isValidObjectId(task.caseDid);
      const caseConditions = [{ did: task.caseDid }, { caseNumber: task.caseDid }];
      if (isCaseMongoId) caseConditions.push({ _id: task.caseDid });

      const caseDoc = await CaseFile.findOne({ $or: caseConditions });
      if (caseDoc) {
        const staffName = req.user?.name || "Staff Member";
        const stepNum = task.stepNumber || 1;

        caseDoc.workflowStatus = `Step ${stepNum} Done (${task.title}) — Awaiting Admin Review`;
        caseDoc.assignedToDid = null;
        caseDoc.assignedToName = "";
        caseDoc.assignedOfficer = "";

        if (task.paymentCollectedAmount) {
          if (!caseDoc.paymentLedger) caseDoc.paymentLedger = {};
          const currentTotalPaid = (Number(caseDoc.totalPaidAmount) || 0);
          const agreed = Number(caseDoc.paymentLedger.totalAgreedAmount || caseDoc.totalAgreedAmount) || 0;
          caseDoc.dueAmount = Math.max(0, agreed - currentTotalPaid);
        }

        if (!Array.isArray(caseDoc.statusHistory)) {
          caseDoc.statusHistory = [];
        }

        const paymentNote = task.paymentCollectedAmount
          ? ` [Collected: ৳${task.paymentCollectedAmount.toLocaleString()} (${task.paymentMethod || "Cash"})${task.moneyReceiptNumber ? ` • Receipt #${task.moneyReceiptNumber}` : ""}]`
          : "";

        caseDoc.statusHistory.push({
          status: `Step ${stepNum} Done`,
          remarks: `Step "${task.title}" completed by ${staffName}: ${completionNotes || "Work submitted"}${paymentNote}`,
          updatedByDid: userDid,
          updatedByName: staffName,
          assignedToDid: userDid,
          date: new Date(),
        });

        await caseDoc.save();
      }
    } catch (caseSyncErr) {
      console.warn("[taskController] CaseFile sync notice:", caseSyncErr.message);
    }

    // Trigger Admin notification (targeted to Admin/Owner only)
    await NotificationModel.create({
      title: "Task Marked as Done",
      message: `Task "${task.title}" for Case ${task.caseDid} was marked Done by ${req.user?.name || "Staff"}.${task.paymentCollectedAmount ? ` (Payment Collected: ৳${task.paymentCollectedAmount})` : ""}`,
      module: "visa",
      type: "success",
      recipientRole: "Admin",
      createdByDid: userDid,
      createdBy: req.user?.name || "Staff",
    }).catch(() => {});

    // Action 5: Email Owners when staff marks task Done / Complete
    sendTaskCompletedEmailToOwners({
      staffName: req.user?.name || "Staff Member",
      taskTitle: task.title,
      caseNumber: task.caseDid,
      completionNotes: completionNotes || "",
    }).catch((err) => console.error("[EmailTrigger] sendTaskCompletedEmailToOwners error:", err.message));

    return res.status(200).json({
      status: "success",
      message: "Task marked as Done successfully",
      data: task,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message || "Failed to mark task as Done",
    });
  }
};
