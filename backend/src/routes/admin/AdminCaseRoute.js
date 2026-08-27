import { Router } from "express";
import {
  getCaseFullDetails,
  assignTaskStep,
  approveTaskStep,
  addPayment,
} from "../../controllers/admin/caseController.js";
import {
  getAllCases,
  getCaseById,
  createCase,
  updateCase,
  deleteCase,
  getDueSummary,
  lookupCase,
  bulkImportCases,
  updateWorkflowStatus,
} from "../../controllers/client/caseFile.controller.js";
import { authenticateToken, authorizeRoles } from "../../middlewares/auth.middleware.js";

const adminCaseRouter = Router();

adminCaseRouter.use(authenticateToken);
adminCaseRouter.use(authorizeRoles("Admin", "Owner", "Manager", "Staff"));

// Summaries & lookups
adminCaseRouter.get("/summary", getDueSummary);
adminCaseRouter.get("/due-summary", getDueSummary);
adminCaseRouter.get("/lookup", lookupCase);
adminCaseRouter.post("/bulk", bulkImportCases);

// Workflow-specific endpoints
adminCaseRouter.get("/:caseDid/full-details", getCaseFullDetails);
adminCaseRouter.post("/assign-step", assignTaskStep);
adminCaseRouter.patch("/tasks/:taskDid/approve", approveTaskStep);
adminCaseRouter.post("/:caseDid/payments", addPayment);
adminCaseRouter.patch("/:id/workflow", updateWorkflowStatus);

// Standard Case CRUD endpoints
adminCaseRouter.get("/", getAllCases);
adminCaseRouter.post("/", createCase);
adminCaseRouter.get("/:id", getCaseById);
adminCaseRouter.put("/:id", updateCase);
adminCaseRouter.delete("/:id", deleteCase);

export default adminCaseRouter;
