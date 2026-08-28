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

    const task = await TaskModel.findOne({ did: taskId });
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

    // Trigger Admin notification
    await NotificationModel.create({
      title: "Task Marked as Done",
      message: `Task "${task.title}" for Case ${task.caseDid} was marked Done by ${req.user?.name || "Staff"}.`,
      module: "visa",
      type: "success",
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
