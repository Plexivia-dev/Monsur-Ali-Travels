import mongoose from "mongoose";
import CaseFile from "../../models/caseFile.model.js";
import TaskModel from "../../models/task.model.js";
import DocumentVaultModel from "../../models/documentVault.model.js";
import { InvoiceModel, generateUniqueInvoiceNo } from "../../models/invoice.model.js";
import { NotificationModel } from "../../models/notification.model.js";
import { UserModel } from "../../models/user.model.js";
import { generateDid } from "../../utils/generateDid.js";
import { sendTaskAssignmentEmail } from "../../services/emailService.js";
import { sendPaymentOrBillCreatedEmailToOwners } from "../../services/emailNotification.service.js";


export const buildCaseIdentifierQuery = (identifier) => {
  if (!identifier) return { _id: null };
  const idStr = String(identifier).trim();
  const conditions = [{ did: idStr }, { caseNumber: idStr }];
  if (mongoose.Types.ObjectId.isValid(idStr) && idStr.length === 24) {
    conditions.push({ _id: new mongoose.Types.ObjectId(idStr) });
  }
  return { $or: conditions };
};

export const buildTaskIdentifierQuery = (identifier) => {
  if (!identifier) return { _id: null };
  const idStr = String(identifier).trim();
  const conditions = [{ did: idStr }];
  if (mongoose.Types.ObjectId.isValid(idStr) && idStr.length === 24) {
    conditions.push({ _id: new mongoose.Types.ObjectId(idStr) });
  }
  return { $or: conditions };
};

/**
 * 1. Get Case Full Details (360-Degree Admin View)
 * Populates clientInfo, workflowTasks (with permittedDocs & assignedTo), and financialReceipts
 */
export const getCaseFullDetails = async (req, res) => {
  try {
    const { caseDid } = req.params;

    const caseDoc = await CaseFile.findOne(buildCaseIdentifierQuery(caseDid))
      .populate("clientInfo")
      .populate("clientId")
      .populate("assignedTo", "name email role subRole designation phone")
      .populate({
        path: "workflowTasks",
        populate: [
          { path: "permittedDocs" },
          { path: "assignedTo", select: "name email role subRole designation" }
        ],
      })
      .populate("financialReceipts")
      .populate("vaultDocuments")
      .lean();

    if (!caseDoc) {
      return res.status(404).json({ status: "error", message: "Case File not found" });
    }

    // Resolve assigned staff names if not pre-populated
    if (caseDoc.assignedTo?.name && !caseDoc.assignedToName) {
      caseDoc.assignedToName = caseDoc.assignedTo.name;
    }
    if (!caseDoc.assignedOfficer) {
      caseDoc.assignedOfficer = caseDoc.assignedToName || caseDoc.assignedTo?.name || "";
    }

    if (Array.isArray(caseDoc.workflowTasks)) {
      caseDoc.workflowTasks.forEach((t) => {
        if (!t.assignedToName && t.assignedTo?.name) {
          t.assignedToName = t.assignedTo.name;
        }
      });
    }

    // Merge Document Vault records
    let clientDocs = [];
    if (caseDoc.clientDid) {
      clientDocs = await DocumentVaultModel.find({ clientDid: caseDoc.clientDid }).lean();
    }

    const mergedDocs = [...(caseDoc.vaultDocuments || [])];
    const existingDocDids = new Set(mergedDocs.map((d) => d.did || d._id?.toString()));
    for (const d of clientDocs) {
      if (!existingDocDids.has(d.did || d._id?.toString())) {
        mergedDocs.push(d);
      }
    }
    caseDoc.vaultDocuments = mergedDocs;

    return res.status(200).json({
      status: "success",
      data: caseDoc,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message || "Failed to fetch case details",
    });
  }
};

/**
 * 2. Assign Task Step (Admin Scope)
 * Admin assigns a new task step to a staff member with specified document access
 */
export const assignTaskStep = async (req, res) => {
  try {
    const userRole = req.user?.role?.toLowerCase() || '';
    if (!['admin', 'manager', 'owner', 'superadmin'].includes(userRole)) {
      return res.status(403).json({ status: "error", message: "Forbidden: Only Admin or Manager can assign tasks." });
    }

    const {
      caseDid,
      title,
      description,
      assignedToDid,
      allowedDocumentDids,
      stepNumber,
      taskTypeDids,
      taskTypeNames,
      requiresDocument,
      requiredDocTypes,
      requiresPayment,
      paymentAmount,
      paymentCurrency,
      paymentPurpose,
      sendInvoiceToClient,
      requirePaySlip,
    } = req.body;
    const adminDid = req.user?.did;

    if (!caseDid || !title || !assignedToDid) {
      return res.status(400).json({ status: "error", message: "caseDid, title, and assignedToDid are required" });
    }

    const caseDoc = await CaseFile.findOne(buildCaseIdentifierQuery(caseDid));
    if (!caseDoc) {
      return res.status(404).json({ status: "error", message: "Associated Case File not found" });
    }

    // Look up assigned user to get canonical name and DID
    const assignedUser = await UserModel.findOne({
      $or: [
        { did: assignedToDid },
        ...(mongoose.Types.ObjectId.isValid(assignedToDid) && assignedToDid.length === 24
          ? [{ _id: new mongoose.Types.ObjectId(assignedToDid) }]
          : []),
      ],
    }).lean();

    const assignedUserName = assignedUser?.name || "Staff Member";
    const canonicalAssignedToDid = assignedUser?.did || assignedToDid;

    const parsedPaymentAmount = Number(paymentAmount) || 0;
    const isPaymentRequired = Boolean(requiresPayment) || parsedPaymentAmount > 0;

    let createdInvoiceDid = null;
    let createdInvoiceNo = "";

    // If Admin requested auto-generation and sending of Invoice to client
    if (isPaymentRequired && sendInvoiceToClient && parsedPaymentAmount > 0) {
      try {
        const invoiceNo = generateUniqueInvoiceNo();
        const clientName = caseDoc.applicantName || caseDoc.clientInfo?.fullName || "Valued Client";
        const newInvoice = await InvoiceModel.create({
          did: generateDid(),
          invoiceNo,
          issueDate: new Date().toISOString().split("T")[0],
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          paymentStatus: "Pending",
          currency: paymentCurrency || "BDT",
          client: {
            name: clientName,
            phone: caseDoc.phone || "",
            address: caseDoc.destinationCountry ? `Case File: ${caseDoc.caseNumber || caseDoc.did} (Destination: ${caseDoc.destinationCountry})` : "",
          },
          items: [
            {
              id: "item-1",
              title: paymentPurpose || title,
              description: `Case ${caseDoc.caseNumber || caseDoc.did} — ${title}`,
              quantity: 1,
              unitPrice: parsedPaymentAmount,
            },
          ],
          subtotal: parsedPaymentAmount,
          grandTotal: parsedPaymentAmount,
        });

        createdInvoiceDid = newInvoice.did;
        createdInvoiceNo = newInvoice.invoiceNo;
      } catch (invErr) {
        console.warn("[assignTaskStep] Auto-invoice generation notice:", invErr.message);
      }
    }

    const newTask = await TaskModel.create({
      caseDid: caseDoc.did,
      title,
      description: description || "",
      stepNumber: stepNumber || (caseDoc.workflowTasks?.length ? caseDoc.workflowTasks.length + 1 : 1),
      assignedToDid: canonicalAssignedToDid,
      assignedToName: assignedUserName,
      allowedDocumentDids: Array.isArray(allowedDocumentDids) ? allowedDocumentDids : [],
      taskTypeDids: Array.isArray(taskTypeDids) ? taskTypeDids : [],
      taskTypeNames: Array.isArray(taskTypeNames) ? taskTypeNames : [],
      requiresDocument: requiresDocument !== false,
      requiredDocTypes: Array.isArray(requiredDocTypes) ? requiredDocTypes : [],
      requiresPayment: isPaymentRequired,
      paymentAmount: parsedPaymentAmount,
      paymentCurrency: paymentCurrency || "BDT",
      paymentPurpose: paymentPurpose || title,
      sendInvoiceToClient: Boolean(sendInvoiceToClient),
      invoiceDid: createdInvoiceDid,
      invoiceNumber: createdInvoiceNo,
      requirePaySlip: Boolean(requirePaySlip),
      status: "Pending",
      createdByDid: adminDid,
    });

    // Update case workflow status, assigned officer, and push to history
    caseDoc.assignedToDid = canonicalAssignedToDid;
    caseDoc.assignedToName = assignedUserName;
    caseDoc.assignedOfficer = assignedUserName;
    caseDoc.workflowStatus = `Step ${newTask.stepNumber}: ${title}`;
    caseDoc.statusHistory.push({
      status: `Assigned Step: ${title}`,
      remarks: `Assigned to ${assignedUserName}`,
      updatedByDid: adminDid,
      updatedByName: req.user?.name || "Admin",
      assignedToDid: canonicalAssignedToDid,
      date: new Date(),
    });
    await caseDoc.save();

    // Trigger Notification for Staff
    await NotificationModel.create({
      title: "New Task Assigned",
      message: `You have been assigned task "${title}" for Case ${caseDoc.caseNumber || caseDoc.did}.`,
      module: "visa",
      type: "info",
      refDid: caseDoc.did || String(caseDoc._id),
      recipientUserDid: canonicalAssignedToDid,
      createdBy: req.user?.name || "Admin",
    }).catch(() => {});

    // Asynchronously send email notification to assigned staff
    if (assignedUser?.email) {
      sendTaskAssignmentEmail({
        toEmail: assignedUser.email,
        staffName: assignedUserName,
        taskTitle: title,
        description: description || "",
        stepNumber: newTask.stepNumber,
        caseNumber: caseDoc.caseNumber,
        caseTitle: caseDoc.title || `Visa Case #${caseDoc.caseNumber}`,
        clientName: caseDoc.applicantName || caseDoc.clientName || "",
        serviceType: caseDoc.caseType || caseDoc.visaType || "Visa Processing",
        assignedBy: req.user?.name || "Administration",
      }).catch(() => {});
    }

    return res.status(201).json({
      status: "success",
      message: "Task step assigned successfully",
      data: newTask,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message || "Failed to assign task step",
    });
  }
};

/**
 * 3. Approve Task Step (Admin Scope)
 * Admin approves staff's completed task and advances workflow
 */
export const approveTaskStep = async (req, res) => {
  try {
    const userRole = req.user?.role?.toLowerCase() || '';
    if (!['admin', 'manager', 'owner', 'superadmin'].includes(userRole)) {
      return res.status(403).json({ status: "error", message: "Forbidden: Only Admin or Manager can approve tasks." });
    }

    const { taskDid } = req.params;
    const { approvalNotes, nextStatus } = req.body || {};
    const adminDid = req.user?.did || req.user?.id;

    const task = await TaskModel.findOne(buildTaskIdentifierQuery(taskDid));
    if (!task) {
      return res.status(404).json({ status: "error", message: "Task step not found" });
    }

    task.status = "Approved";
    task.approvedByDid = adminDid;
    task.approvedAt = new Date();
    if (approvalNotes) task.approvalNotes = approvalNotes;
    await task.save();

    // Update Case Workflow
    const caseDoc = await CaseFile.findOne(buildCaseIdentifierQuery(task.caseDid));
    if (caseDoc) {
      const stepNum = task.stepNumber || 1;
      caseDoc.workflowStatus = nextStatus || `Step ${stepNum} Approved: ${task.title}`;
      if (!Array.isArray(caseDoc.statusHistory)) {
        caseDoc.statusHistory = [];
      }
      caseDoc.statusHistory.push({
        status: `Approved Step ${stepNum}: ${task.title}`,
        remarks: approvalNotes || "Task approved by admin",
        updatedByDid: adminDid,
        updatedByName: req.user?.name || "Admin",
        date: new Date(),
      });
      await caseDoc.save();

      // Trigger notification to staff / assignee
      if (task.assignedToDid) {
        await NotificationModel.create({
          title: "Task Approved",
          message: `Your task "${task.title}" for Case ${caseDoc.caseNumber || caseDoc.did} has been approved by admin.`,
          module: "visa",
          type: "success",
          refDid: caseDoc.did,
          recipientUserDid: task.assignedToDid,
          createdByDid: adminDid,
          createdBy: req.user?.name || "Admin",
        }).catch(() => {});
      }
    }

    return res.status(200).json({
      status: "success",
      message: "Task step approved successfully",
      data: task,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message || "Failed to approve task step",
    });
  }
};

/**
 * 4. Add Payment (Accountant/Admin Scope)
 * Records a payment, auto-calculates remaining due, generates a receipt record.
 */
export const addPayment = async (req, res) => {
  try {
    const { caseDid } = req.params;
    const { amount, paymentType, paymentMethod, notes } = req.body;
    const adminDid = req.user?.did;

    if (!amount || amount <= 0) {
      return res.status(400).json({ status: "error", message: "Valid amount is required" });
    }

    const caseDoc = await CaseFile.findOne(buildCaseIdentifierQuery(caseDid));
    if (!caseDoc) {
      return res.status(404).json({ status: "error", message: "Associated Case File not found" });
    }

    const paymentAmount = Number(amount);
    if (!caseDoc.paymentLedger) {
      caseDoc.paymentLedger = { totalAgreedAmount: 0, totalPaidAmount: 0, step1_advance: 0, dueAmount: 0 };
    }

    // Update payment ledger
    caseDoc.paymentLedger.totalPaidAmount = (caseDoc.paymentLedger.totalPaidAmount || 0) + paymentAmount;
    caseDoc.paymentLedger.dueAmount = Math.max(0, caseDoc.paymentLedger.totalAgreedAmount - caseDoc.paymentLedger.totalPaidAmount);

    if (paymentType === "Advance Payment") {
      caseDoc.paymentLedger.step1_advance = paymentAmount;
    }

    // Advance workflow state if it's the initial entry
    if (caseDoc.status === "ENTRY" || !caseDoc.workflowStatus) {
      caseDoc.status = "PROCESSING";
      caseDoc.workflowStatus = "Initial Payment Done";
    }

    // Record status history
    caseDoc.statusHistory.push({
      status: `Payment Received: ${paymentType}`,
      remarks: `Amount: BDT ${paymentAmount} via ${paymentMethod}. ${notes || ""}`,
      updatedByDid: adminDid,
      date: new Date(),
    });

    // TODO: Create actual Financial Receipt document if needed, but for now caseDoc tracking is primary
    
    await caseDoc.save();

    // Trigger global / assigned officer notification
    await NotificationModel.create({
      title: "Payment Received",
      message: `Received BDT ${paymentAmount.toLocaleString()} (${paymentType}) for Case ${caseDoc.caseNumber || caseDoc.did}.`,
      module: "invoice",
      type: "success",
      refDid: caseDoc.did,
      recipientUserDid: caseDoc.assignedToDid || null,
      createdBy: req.user?.name || "Admin",
    }).catch(() => {});

    // Action 4: Email Owners for payment entry
    sendPaymentOrBillCreatedEmailToOwners({
      createdByUserName: req.user?.name || "Accounts / Admin",
      type: `Payment (${paymentType})`,
      refNumber: `Case #${caseDoc.caseNumber || caseDoc.did}`,
      amount: paymentAmount,
      notes: notes || `Payment method: ${paymentMethod}`,
    }).catch((err) => console.error("[EmailTrigger] sendPaymentOrBillCreatedEmailToOwners error:", err.message));

    return res.status(200).json({
      status: "success",
      message: "Payment recorded successfully",
      data: caseDoc.paymentLedger,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message || "Failed to process payment",
    });
  }
};
