import { Router } from "express";
import {
  getAllCases,
  lookupCase,
  getCaseById,
  createCase,
  updateCase,
  deleteCase,
  getDueSummary,
  bulkImportCases,
  updateWorkflowStatus,
  addCaseInternalMessage,
  uploadCaseDocument,
  renameCaseDocument,
  completeTaskStep
} from "../../controllers/client/caseFile.controller.js";

const caseFileRouter = Router();

// ==========================================
// 1. Generic Aggregation & Summary Endpoints
// ==========================================
// GET /api/v1/cases/summary (or due-summary)
caseFileRouter.get("/summary", getDueSummary);
caseFileRouter.get("/due-summary", getDueSummary);

// ==========================================
// 2. Generic Fast Lookup Endpoint
// ==========================================
// GET /api/v1/cases/lookup?q=...&passport=...
caseFileRouter.get("/lookup", lookupCase);

// ==========================================
// 3. Generic Bulk Operations
// ==========================================
// POST /api/v1/cases/bulk
caseFileRouter.post("/bulk", bulkImportCases);
caseFileRouter.post("/bulk-import", bulkImportCases);

// ==========================================
// 4. Case Collaboration, Documents & Tasks
// ==========================================
caseFileRouter.post("/:id/messages", addCaseInternalMessage);
caseFileRouter.post("/:id/documents", uploadCaseDocument);
caseFileRouter.patch("/:id/documents/:docDid/rename", renameCaseDocument);
caseFileRouter.patch("/tasks/:taskDid/complete", completeTaskStep);

// ==========================================
// 5. Pure Generic REST CRUD Endpoints
// ==========================================
// Query params: ?caseType=greece&status=ENTRY&page=1&limit=20&search=...&sortBy=createdAt&sortOrder=desc
caseFileRouter.get("/", getAllCases);
caseFileRouter.post("/", createCase);
caseFileRouter.get("/:id", getCaseById);
caseFileRouter.put("/:id", updateCase);
caseFileRouter.delete("/:id", deleteCase);


caseFileRouter.patch('/:id/workflow', updateWorkflowStatus);

export default caseFileRouter;
