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
// 4. Pure Generic REST CRUD Endpoints
// ==========================================
// Query params: ?caseType=greece&status=ENTRY&page=1&limit=20&search=...&sortBy=createdAt&sortOrder=desc
caseFileRouter.get("/", getAllCases);
caseFileRouter.post("/", createCase);
caseFileRouter.get("/:id", getCaseById);
caseFileRouter.put("/:id", updateCase);
caseFileRouter.delete("/:id", deleteCase);

export default caseFileRouter;
