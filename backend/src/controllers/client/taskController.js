import mongoose from "mongoose";
import TaskModel from "../../models/task.model.js";
import CaseFile from "../../models/caseFile.model.js";
import { NotificationModel } from "../../models/notification.model.js";
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
 * Staff submits completion notes and updates task status to 'Done'
 */
export const markTaskDone = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { completionNotes } = req.body;
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

        if (!Array.isArray(caseDoc.statusHistory)) {
          caseDoc.statusHistory = [];
        }

        caseDoc.statusHistory.push({
          status: `Step ${stepNum} Done`,
          remarks: `Step "${task.title}" completed by ${staffName}: ${completionNotes || "Work submitted"}`,
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
      message: `Task "${task.title}" for Case ${task.caseDid} was marked Done by ${req.user?.name || "Staff"}.`,
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
