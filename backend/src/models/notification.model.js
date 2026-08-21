import mongoose from "mongoose";
import { generateDid } from "../utils/generateDid.js";

const notificationSchema = new mongoose.Schema(
  {
    did: {
      type: String,
      default: () => generateDid(),
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    module: {
      type: String,
      enum: ["visa", "passport", "customer", "agreement", "invoice", "general"],
      default: "general",
    },
    type: {
      type: String,
      enum: ["info", "success", "warning", "danger"],
      default: "info",
    },
    refId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: String,
      default: "System",
    },
  },
  {
    timestamps: true,
  }
);

export const NotificationModel =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);
