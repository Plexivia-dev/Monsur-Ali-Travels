import { Router } from "express";
import { getSystemInfo, getMetadata } from "../../controllers/admin/SystemController.js";
import { getSystemLogs, getSystemLogStats } from "../../controllers/admin/SystemLogController.js";
import { authenticateToken, authorizeRoles } from "../../middlewares/auth.middleware.js";

const systemRouter = Router();

// Protected endpoints for system logs
systemRouter.get(
  "/logs",
  authenticateToken,
  authorizeRoles("Owner", "Admin", "Manager", "Super Admin", "Superadmin"),
  getSystemLogs
);

systemRouter.get(
  "/logs/stats",
  authenticateToken,
  authorizeRoles("Owner", "Admin", "Manager", "Super Admin", "Superadmin"),
  getSystemLogStats
);

// Protected endpoint for retrieving system & version information
systemRouter.get(
  "/info",
  authenticateToken,
  authorizeRoles("Owner", "Admin", "Manager", "Super Admin", "Superadmin"),
  getSystemInfo
);

// Public utility endpoint for retrieving metadata
systemRouter.get("/metadata", getMetadata);

export default systemRouter;
