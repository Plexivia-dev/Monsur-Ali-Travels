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
      enum: ["visa", "passport", "client", "agreement", "invoice", "general"],
      default: "general",
    },
    type: {
      type: String,
      enum: ["info", "success", "warning", "danger"],
      default: "info",
    },
    refDid: {
      type: String,
      default: null,
    },
    recipientUserDid: {
      type: String,
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
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret.did;
        delete ret._id;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

// Virtual Populates for Notification relations using DIDs
notificationSchema.virtual("recipientUser", {
  ref: "User",
  localField: "recipientUserDid",
  foreignField: "did",
  justOne: true,
});

// Post-save hook to emit real-time WebSockets notification
notificationSchema.post("save", function (doc) {
  if (global.io) {
    if (doc.recipientUserDid) {
      global.io.to(`user:${doc.recipientUserDid}`).emit("new_notification", doc);
    } else {
      global.io.emit("new_notification", doc);
    }
  }
});

export const NotificationModel =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);
