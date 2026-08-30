import { Router } from "express";
import {
  createEmployee,
  deleteEmployee,
  getEmployeeById,
  listEmployees,
  updateEmployee,
} from "../../controllers/admin/EmployeeController.js";
import { authenticateToken, authorizeRoles } from "../../middlewares/auth.middleware.js";

const employeeRouter = Router();

// Require authentication for employee endpoints
employeeRouter.use(authenticateToken);

// Endpoints for employee directory management
employeeRouter.get("/", authorizeRoles("Owner", "Admin", "Superadmin", "Accountant", "accounts", "Staff", "frontdesk"), listEmployees);
employeeRouter.get("/:id", authorizeRoles("Owner", "Admin", "Superadmin", "Accountant", "accounts", "Staff", "frontdesk"), getEmployeeById);
employeeRouter.post("/", authorizeRoles("Owner", "Admin"), createEmployee);
employeeRouter.put("/:id", authorizeRoles("Owner", "Admin"), updateEmployee);
employeeRouter.patch("/:id", authorizeRoles("Owner", "Admin"), updateEmployee);
employeeRouter.delete("/:id", authorizeRoles("Owner", "Admin"), deleteEmployee);

export default employeeRouter;

