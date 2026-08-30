import mongoose, { Schema } from "mongoose";
import { generateDid } from "../utils/generateDid.js";

const taskTypeSchema = new Schema(
  {
    did: {
      type: String,
      default: () => generateDid(),
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Task Type name is required"],
      trim: true,
      index: true,
    },
    category: {
      type: String,
      enum: [
        "DOCUMENT_UPLOAD",
        "LEGAL",
        "FINANCIAL",
        "EMBASSY_PROCESS",
        "VERIFICATION",
        "GENERAL_ACTION",
      ],
      default: "DOCUMENT_UPLOAD",
      index: true,
    },
    requiresDocument: {
      type: Boolean,
      default: true,
      index: true,
    },
    defaultDocumentType: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isSystemDefault: {
      type: Boolean,
      default: false,
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    createdByDid: {
      type: String,
      default: null,
    },
    updatedByDid: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const TaskTypeModel =
  mongoose.models.TaskType || mongoose.model("TaskType", taskTypeSchema);

export default TaskTypeModel;
