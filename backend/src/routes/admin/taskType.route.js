import { Router } from "express";
import {
  getTaskTypes,
  createTaskType,
  updateTaskType,
  deleteTaskType,
} from "../../controllers/admin/taskType.controller.js";
import { authenticateToken, authorizeRoles } from "../../middlewares/auth.middleware.js";

const taskTypeRouter = Router();

// Public / Authenticated read endpoint
taskTypeRouter.get("/", getTaskTypes);

// Admin-only management endpoints
taskTypeRouter.post(
  "/",
  authenticateToken,
  authorizeRoles("Owner", "Admin", "Manager", "Superadmin"),
  createTaskType
);

taskTypeRouter.put(
  "/:id",
  authenticateToken,
  authorizeRoles("Owner", "Admin", "Manager", "Superadmin"),
  updateTaskType
);

taskTypeRouter.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("Owner", "Admin", "Manager", "Superadmin"),
  deleteTaskType
);

export default taskTypeRouter;
