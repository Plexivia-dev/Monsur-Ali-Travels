import mongoose, { Schema, model } from "mongoose";
import { generateDid } from "../utils/generateDid.js";

const { models } = mongoose;

const taskSchema = new Schema(
  {
    did: {
      type: String,
      default: () => generateDid(),
      unique: true,
      index: true,
    },
    caseDid: {
      type: String,
      required: [true, "Case DID reference is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    stepNumber: {
      type: Number,
      default: 1,
    },
    assignedToDid: {
      type: String,
      required: [true, "Assigned user DID is required"],
      index: true,
    },
    assignedToName: {
      type: String,
      default: "",
      trim: true,
    },
    allowedDocumentDids: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["Pending", "In_Progress", "Done", "Approved", "Rejected"],
      default: "Pending",
      index: true,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    completionNotes: {
      type: String,
      default: "",
    },
    approvedByDid: {
      type: String,
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    approvalNotes: {
      type: String,
      default: "",
    },
    rejectionReason: {
      type: String,
      default: "",
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

// Virtual Relation: Fetch permitted documents via allowedDocumentDids -> did
taskSchema.virtual("permittedDocs", {
  ref: "DocumentVault",
  localField: "allowedDocumentDids",
  foreignField: "did",
  justOne: false,
});

// Virtual Relation: Fetch assigned user details via assignedToDid -> did
taskSchema.virtual("assignedTo", {
  ref: "User",
  localField: "assignedToDid",
  foreignField: "did",
  justOne: true,
});

export const TaskModel = models.Task || model("Task", taskSchema);
export default TaskModel;
