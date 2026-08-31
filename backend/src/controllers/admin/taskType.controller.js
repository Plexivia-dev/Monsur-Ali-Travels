import TaskTypeModel from "../../models/taskType.model.js";
import { seedTaskTypesIfEmpty } from "../../seed/seedTaskTypes.js";
import { generateDid } from "../../utils/generateDid.js";

/**
 * 1. Get Task Types (Public / Authenticated)
 * Returns active task types ordered by sortOrder and name
 */
export const getTaskTypes = async (req, res) => {
  try {
    await seedTaskTypesIfEmpty();

    const { includeInactive } = req.query;
    const query = includeInactive === "true" ? {} : { isActive: true };

    const taskTypes = await TaskTypeModel.find(query)
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();

    return res.status(200).json({
      status: "success",
      count: taskTypes.length,
      data: taskTypes,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message || "Failed to fetch task types",
    });
  }
};

/**
 * 2. Create Custom Task Type (Admin Scope)
 */
export const createTaskType = async (req, res) => {
  try {
    const {
      name,
      category,
      requiresDocument,
      defaultDocumentType,
      description,
      sortOrder,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Task type name is required",
      });
    }

    const existing = await TaskTypeModel.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });

    if (existing) {
      return res.status(400).json({
        status: "error",
        message: `Task type "${name.trim()}" already exists`,
      });
    }

    const userDid = req.user?.did || req.user?.id;

    const newTaskType = await TaskTypeModel.create({
      did: generateDid(),
      name: name.trim(),
      category: category || (requiresDocument ? "DOCUMENT_UPLOAD" : "GENERAL_ACTION"),
      requiresDocument: requiresDocument !== false,
      defaultDocumentType: defaultDocumentType?.trim() || "",
      description: description?.trim() || "",
      sortOrder: Number(sortOrder) || 0,
      isActive: true,
      isSystemDefault: false,
      createdByDid: userDid,
      updatedByDid: userDid,
    });

    return res.status(201).json({
      status: "success",
      message: "Custom task type created successfully",
      data: newTaskType,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message || "Failed to create task type",
    });
  }
};

/**
 * 3. Update Task Type (Admin Scope)
 */
export const updateTaskType = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      requiresDocument,
      defaultDocumentType,
      description,
      sortOrder,
      isActive,
    } = req.body;

    const taskType = await TaskTypeModel.findOne({
      $or: [{ did: id }, ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : [])],
    });

    if (!taskType) {
      return res.status(404).json({
        status: "error",
        message: "Task type not found",
      });
    }

    if (name && name.trim()) taskType.name = name.trim();
    if (category) taskType.category = category;
    if (typeof requiresDocument === "boolean") taskType.requiresDocument = requiresDocument;
    if (defaultDocumentType !== undefined) taskType.defaultDocumentType = defaultDocumentType.trim();
    if (description !== undefined) taskType.description = description.trim();
    if (sortOrder !== undefined) taskType.sortOrder = Number(sortOrder);
    if (typeof isActive === "boolean") taskType.isActive = isActive;
    taskType.updatedByDid = req.user?.did || req.user?.id;

    await taskType.save();

    return res.status(200).json({
      status: "success",
      message: "Task type updated successfully",
      data: taskType,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message || "Failed to update task type",
    });
  }
};

/**
 * 4. Delete / Deactivate Task Type (Admin Scope)
 */
export const deleteTaskType = async (req, res) => {
  try {
    const { id } = req.params;

    const taskType = await TaskTypeModel.findOne({
      $or: [{ did: id }, ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : [])],
    });

    if (!taskType) {
      return res.status(404).json({
        status: "error",
        message: "Task type not found",
      });
    }

    if (taskType.isSystemDefault) {
      // System default cannot be hard deleted, only deactivated
      taskType.isActive = false;
      await taskType.save();
      return res.status(200).json({
        status: "success",
        message: "System default task type deactivated successfully",
        data: taskType,
      });
    }

    await TaskTypeModel.deleteOne({ _id: taskType._id });

    return res.status(200).json({
      status: "success",
      message: "Task type deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message || "Failed to delete task type",
    });
  }
};
