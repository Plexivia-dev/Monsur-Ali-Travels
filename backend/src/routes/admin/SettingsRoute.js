import { Router } from "express";
import { 
  getCoreTeam, 
  getStaffCandidates, 
  assignCoreTeamRole, 
  removeCoreTeamRole, 
  inviteCoreTeamUser 
} from "../../controllers/admin/SettingsController.js";
import { authenticateToken, authorizeRoles } from "../../middlewares/auth.middleware.js";

const settingsRouter = Router();

// Retrieve current core team map
settingsRouter.get(
  "/core-team",
  authenticateToken,
  authorizeRoles("Owner", "Admin", "Manager", "Superadmin"),
  getCoreTeam
);

// Retrieve available staff candidates for assignment
settingsRouter.get(
  "/staff-candidates",
  authenticateToken,
  authorizeRoles("Owner", "Admin", "Manager", "Superadmin"),
  getStaffCandidates
);

// Assign a core team role to existing staff
settingsRouter.post(
  "/core-team/assign",
  authenticateToken,
  authorizeRoles("Owner", "Admin", "Manager", "Superadmin"),
  assignCoreTeamRole
);

// Remove a core team role from a user
settingsRouter.post(
  "/core-team/remove",
  authenticateToken,
  authorizeRoles("Owner", "Admin", "Manager", "Superadmin"),
  removeCoreTeamRole
);

// Invite a new user into a core team role
settingsRouter.post(
  "/core-team/invite",
  authenticateToken,
  authorizeRoles("Owner", "Admin", "Manager", "Superadmin"),
  inviteCoreTeamUser
);

export default settingsRouter;
