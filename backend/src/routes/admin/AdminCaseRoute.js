import { Router } from "express";
import {
  getCaseFullDetails,
  assignTaskStep,
  approveTaskStep,
} from "../../controllers/admin/caseController.js";
import { authenticateToken, authorizeRoles } from "../../middlewares/auth.middleware.js";

const adminCaseRouter = Router();

adminCaseRouter.use(authenticateToken);
adminCaseRouter.use(authorizeRoles("Admin", "Owner", "Manager"));

adminCaseRouter.get("/:caseDid/full-details", getCaseFullDetails);
adminCaseRouter.post("/assign-step", assignTaskStep);
adminCaseRouter.patch("/tasks/:taskDid/approve", approveTaskStep);

export default adminCaseRouter;
