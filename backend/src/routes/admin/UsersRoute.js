import { Router } from "express";

import { createUser, deleteUser, getUserById, listUsers, updateUser } from "../../controllers/admin/UsersController.js";
import { authenticateToken, authorizeRoles } from "../../middlewares/auth.middleware.js";

const usersRouter = Router();

// Require authentication for user management endpoints
usersRouter.use(authenticateToken);

// Allow authorized roles to view staff/user roster
usersRouter.get("/", authorizeRoles("Owner", "Admin", "Superadmin", "Accountant", "accounts", "Staff", "frontdesk"), listUsers);
usersRouter.get("/:userId", authorizeRoles("Owner", "Admin", "Superadmin", "Accountant", "accounts", "Staff", "frontdesk"), getUserById);
usersRouter.post("/", authorizeRoles("Owner", "Admin"), createUser);
usersRouter.put("/:userId", authorizeRoles("Owner", "Admin"), updateUser);
usersRouter.delete("/:userId", authorizeRoles("Owner", "Admin"), deleteUser);

export default usersRouter;
