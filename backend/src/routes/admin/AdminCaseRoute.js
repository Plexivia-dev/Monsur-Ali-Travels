import { Router } from "express";
import {
  getCaseFullDetails,
  assignTaskStep,
  approveTaskStep,
  addPayment,
} from "../../controllers/admin/caseController.js";
import { authenticateToken, authorizeRoles } from "../../middlewares/auth.middleware.js";

const adminCaseRouter = Router();

adminCaseRouter.use(authenticateToken);
adminCaseRouter.use(authorizeRoles("Admin", "Owner", "Manager", "Staff"));

adminCaseRouter.get("/:caseDid/full-details", getCaseFullDetails);
adminCaseRouter.post("/assign-step", assignTaskStep);
adminCaseRouter.patch("/tasks/:taskDid/approve", approveTaskStep);
adminCaseRouter.post("/:caseDid/payments", addPayment);

export default adminCaseRouter;
