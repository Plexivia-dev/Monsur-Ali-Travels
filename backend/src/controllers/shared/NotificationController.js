import mongoose from "mongoose";
import { NotificationModel } from "../../models/notification.model.js";

export class NotificationController {
  // GET /api/v1/notifications
  static async getAll(req, res) {
    try {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.max(1, parseInt(req.query.limit, 10) || 25);
      const skip = (page - 1) * limit;

      const query = {};
      if (req.query.isRead !== undefined) {
        query.isRead = req.query.isRead === "true";
      }
      if (req.query.module) {
        query.module = req.query.module;
      }

      // If userDid is provided or authenticated, filter for user or broadcast notifications
      const userDid = req.query.userDid || req.user?.did;
      if (userDid) {
        query.$or = [
          { recipientUserDid: userDid },
          { recipientUserDid: null },
          { recipientUserDid: { $exists: false } },
        ];
      }

      // Fetch notifications sorted by unread first, then by createdAt desc
      const docs = await NotificationModel.find(query)
        .sort({ isRead: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const totalCount = await NotificationModel.countDocuments(query);
      const totalPages = Math.ceil(totalCount / limit) || 1;

      return res.status(200).json({
        status: "success",
        success: true,
        data: docs,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
        },
      });
    } catch (err) {
      console.error("NotificationController getAll error:", err);
      return res.status(500).json({
        status: "error",
        success: false,
        message: err.message || "Failed to fetch notifications.",
      });
    }
  }

  // PATCH /api/v1/notifications/:id/read
  static async markAsRead(req, res) {
    try {
      const idStr = String(req.params.id || "").trim();
      const isObjectId = mongoose.Types.ObjectId.isValid(idStr) && idStr.length === 24;
      const query = isObjectId ? { $or: [{ _id: idStr }, { did: idStr }] } : { did: idStr };

      const doc = await NotificationModel.findOneAndUpdate(
        query,
        { isRead: true },
        { new: true }
      );

      if (!doc) {
        return res.status(404).json({
          status: "fail",
          success: false,
          message: "Notification not found.",
        });
      }

      return res.status(200).json({
        status: "success",
        success: true,
        data: doc,
      });
    } catch (err) {
      console.error("NotificationController markAsRead error:", err);
      return res.status(500).json({
        status: "error",
        success: false,
        message: err.message || "Failed to mark notification as read.",
      });
    }
  }

  // PATCH /api/v1/notifications/read-all
  static async markAllAsRead(req, res) {
    try {
      const userDid = req.query.userDid || req.user?.did;
      const query = { isRead: false };
      if (userDid) {
        query.$or = [
          { recipientUserDid: userDid },
          { recipientUserDid: null },
          { recipientUserDid: { $exists: false } },
        ];
      }

      await NotificationModel.updateMany(query, { isRead: true });
      return res.status(200).json({
        status: "success",
        success: true,
        message: "All notifications marked as read.",
      });
    } catch (err) {
      console.error("NotificationController markAllAsRead error:", err);
      return res.status(500).json({
        status: "error",
        success: false,
        message: err.message || "Failed to mark all notifications as read.",
      });
    }
  }
}
