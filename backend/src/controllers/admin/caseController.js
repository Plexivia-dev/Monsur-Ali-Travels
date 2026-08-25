import CaseFile from "../../models/caseFile.model.js";
import TaskModel from "../../models/task.model.js";
import DocumentVaultModel from "../../models/documentVault.model.js";
import { NotificationModel } from "../../models/notification.model.js";

/**
 * 1. Get Case Full Details (360-Degree Admin View)
 * Populates clientInfo, workflowTasks (with permittedDocs), and financialReceipts
 */
export const getCaseFullDetails = async (req, res) => {
  try {
    const { caseDid } = req.params;

    const caseDoc = await CaseFile.findOne({ $or: [{ did: caseDid }, { _id: caseDid }] })
      .populate("clientInfo")
      .populate("customerId")
      .populate({
        path: "workflowTasks",
        populate: { path: "permittedDocs" },
      })
      .populate("financialReceipts")
      .populate("vaultDocuments")
      .lean();

    if (!caseDoc) {
      return res.status(404).json({ status: "error", message: "Case File not found" });
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
    const { caseDid, title, description, assignedToDid, allowedDocumentDids, stepNumber } = req.body;
    const adminDid = req.user?.did;

    if (!caseDid || !title || !assignedToDid) {
      return res.status(400).json({ status: "error", message: "caseDid, title, and assignedToDid are required" });
    }

    const caseDoc = await CaseFile.findOne({ $or: [{ did: caseDid }, { _id: caseDid }] });
    if (!caseDoc) {
      return res.status(404).json({ status: "error", message: "Associated Case File not found" });
    }

    const newTask = await TaskModel.create({
      caseDid: caseDoc.did,
      title,
      description: description || "",
      stepNumber: stepNumber || 1,
      assignedToDid,
      allowedDocumentDids: Array.isArray(allowedDocumentDids) ? allowedDocumentDids : [],
      status: "Pending",
      createdByDid: adminDid,
    });

    // Update case workflow status and push to history
    caseDoc.assignedToDid = assignedToDid;
    caseDoc.workflowStatus = `Step ${newTask.stepNumber}: ${title}`;
    caseDoc.statusHistory.push({
      status: `Assigned Step: ${title}`,
      remarks: `Assigned to ${assignedToDid}`,
      updatedByDid: adminDid,
      assignedToDid: assignedToDid,
      date: new Date(),
    });
    await caseDoc.save();

    // Trigger Notification for Staff
    await NotificationModel.create({
      title: "New Task Assigned",
      message: `You have been assigned task "${title}" for Case ${caseDoc.caseNumber}.`,
      module: "visa",
      type: "info",
      refId: caseDoc._id,
      recipientId: assignedToDid,
      createdBy: req.user?.name || "Admin",
    }).catch(() => {});

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
    const { taskDid } = req.params;
    const { approvalNotes, nextStatus } = req.body;
    const adminDid = req.user?.did;

    const task = await TaskModel.findOne({ $or: [{ did: taskDid }, { _id: taskDid }] });
    if (!task) {
      return res.status(404).json({ status: "error", message: "Task step not found" });
    }

    task.status = "Approved";
    task.approvedByDid = adminDid;
    task.approvedAt = new Date();
    if (approvalNotes) task.approvalNotes = approvalNotes;
    await task.save();

    // Update Case Workflow
    const caseDoc = await CaseFile.findOne({ did: task.caseDid });
    if (caseDoc) {
      caseDoc.workflowStatus = nextStatus || `Approved Step: ${task.title}`;
      caseDoc.statusHistory.push({
        status: `Approved Step: ${task.title}`,
        remarks: approvalNotes || "Task approved by admin",
        updatedByDid: adminDid,
        date: new Date(),
      });
      await caseDoc.save();
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

    const caseDoc = await CaseFile.findOne({ $or: [{ did: caseDid }, { _id: caseDid }] });
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

    return res.status(201).json({
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
