import { Router } from "express";
import { NotificationController } from "../../controllers/shared/NotificationController.js";

const notificationRouter = Router();

// GET /api/v1/notifications
notificationRouter.get("/", NotificationController.getAll);

// PATCH /api/v1/notifications/read-all
notificationRouter.patch("/read-all", NotificationController.markAllAsRead);

// PATCH /api/v1/notifications/:id/read
notificationRouter.patch("/:id/read", NotificationController.markAsRead);

export default notificationRouter;
