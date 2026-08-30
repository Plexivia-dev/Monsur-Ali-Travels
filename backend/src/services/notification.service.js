import { NotificationModel } from "../models/notification.model.js";

/**
 * Creates and saves a notification to the database, which automatically
 * broadcasts via WebSockets (Socket.IO) through the NotificationModel post-save hook.
 */
export async function createNotification({
  title,
  message,
  module = "general",
  type = "info",
  refDid = null,
  recipientUserDid = null,
  createdBy = "System",
}) {
  try {
    const notification = await NotificationModel.create({
      title,
      message,
      module,
      type,
      refDid,
      recipientUserDid,
      createdBy,
    });
    return notification;
  } catch (err) {
    console.error("[NotificationService] Failed to create notification:", err.message);
    return null;
  }
}
