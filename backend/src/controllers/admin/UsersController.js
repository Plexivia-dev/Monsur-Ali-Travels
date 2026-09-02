import mongoose from "mongoose";
import { UserModel } from "../../models/user.model.js";
import { hashPassword } from "../../utils/password.js";
import {
  validateCreateUserPayload,
  validateUpdateUserPayload,
} from "../../helper/userControllerHelper.js";
import { sendStaffInvitationEmail } from "../../services/emailService.js";

// Helper to query user by either MongoDB _id or custom did
const findUserByIdOrDid = async (id) => {
  if (!id) return null;
  const isObjectId = mongoose.isValidObjectId(id);
  const conditions = [{ did: id }];
  if (isObjectId) conditions.push({ _id: id });
  return UserModel.findOne({ $or: conditions });
};

// List all users in the system.
export const listUsers = async (req, res, next) => {
  try {
    const users = await UserModel.find().sort({ createdAt: -1 }).lean();
    res.json({ data: users });
  } catch (error) {
    next(error);
  }
};

// Fetch a single user record by id or did.
export const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await findUserByIdOrDid(userId);
    if (!user) return res.status(404).json({ status: "error", message: "User not found" });
    res.json({ data: user });
  } catch (error) {
    next(error);
  }
};

// Create a new user with role-aware permission checks.
export const createUser = async (req, res, next) => {
  try {
    const payload = req.body ?? {};
    const validationErrors = validateCreateUserPayload(payload);
    if (validationErrors.length > 0) {
      return res.status(400).json({ status: "error", message: "Invalid user payload", errors: validationErrors });
    }

    const name = (payload.name || payload.fullName || "").trim();
    const email = (payload.email || "").toLowerCase().trim();
    const phone = (payload.phone || "").trim();
    const role = payload.role || "Staff";
    const subRole = role === "Staff" ? (payload.subRole || "Frontdesk") : undefined;
    const designation = (payload.designation || "").trim();
    const department = (payload.department || "").trim();

    // If creator is Admin, they cannot create Owner or Admin accounts
    const creatorRole = req.user?.role || null;
    if (creatorRole === "Admin" && (role === "Owner" || role === "Admin")) {
      return res.status(403).json({ status: "error", message: "Insufficient permissions to create this role" });
    }

    const existing = await UserModel.findOne({ email });
    if (existing) {
      return res.status(409).json({ status: "error", message: "A user with this email already exists" });
    }

    const user = await UserModel.create({
      name,
      email,
      phone,
      role,
      subRole,
      designation,
      department,
      passwordHash: await hashPassword(payload.password),
      createdByDid: req.user?.did || null,
    });

    // Send welcome/credentials email asynchronously
    sendStaffInvitationEmail({
      toEmail: user.email,
      name: user.name,
      role: user.role,
      subRole: user.subRole || "",
      tempPassword: payload.password,
      invitedBy: req.user?.name || "Administrator",
    }).catch(() => {});

    res.status(201).json({ status: "success", data: user });
  } catch (error) {
    next(error);
  }
};

// Update an existing user while enforcing role-based restrictions.
export const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const payload = req.body ?? {};
    const validationErrors = validateUpdateUserPayload(payload);
    if (validationErrors.length > 0) {
      return res.status(400).json({ status: "error", message: "Invalid user payload", errors: validationErrors });
    }

    const user = await findUserByIdOrDid(userId);
    if (!user) return res.status(404).json({ status: "error", message: "User not found" });

    // If updater is Admin, prevent modifying Owner accounts
    const updaterRole = req.user?.role || null;
    if (updaterRole === "Admin" && user.role === "Owner") {
      return res.status(403).json({ status: "error", message: "Insufficient permissions to modify this user" });
    }

    const name = (payload.name || payload.fullName || "").trim();
    if (name) user.name = name;

    if (payload.email) {
      const email = payload.email.toLowerCase().trim();
      if (email !== user.email) {
        const emailExists = await UserModel.findOne({ email });
        if (emailExists) return res.status(409).json({ status: "error", message: "A user with this email already exists" });
        user.email = email;
      }
    }

    if (payload.phone !== undefined) user.phone = payload.phone.trim();
    if (payload.designation !== undefined) user.designation = String(payload.designation || '').trim();
    if (payload.department !== undefined) user.department = String(payload.department || '').trim();
    if (payload.role) user.role = payload.role;

    if (user.role === 'Staff') {
      user.subRole = payload.subRole || user.subRole || 'Frontdesk';
    } else {
      user.subRole = undefined;
    }

    if (payload.isActive !== undefined) {
      user.isActive = Boolean(payload.isActive);
      user.status = user.isActive ? "Active" : "Inactive";
    }

    if (payload.status !== undefined) {
      user.status = payload.status;
      user.isActive = payload.status === "Active";
    }

    if (payload.password) {
      user.passwordHash = await hashPassword(payload.password);
    }

    user.updatedByDid = req.user?.did || null;
    await user.save();

    res.json({ status: "success", data: user.toJSON() });
  } catch (error) {
    next(error);
  }
};

// Toggle user status (Active / Inactive)
export const toggleUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { isActive, status } = req.body ?? {};

    const user = await findUserByIdOrDid(userId);
    if (!user) return res.status(404).json({ status: "error", message: "User not found" });

    const updaterRole = req.user?.role || null;
    if (updaterRole === "Admin" && user.role === "Owner") {
      return res.status(403).json({ status: "error", message: "Insufficient permissions to modify this user" });
    }

    if (isActive !== undefined) {
      user.isActive = Boolean(isActive);
      user.status = user.isActive ? "Active" : "Inactive";
    } else if (status !== undefined) {
      user.status = status;
      user.isActive = status === "Active";
    } else {
      user.isActive = !user.isActive;
      user.status = user.isActive ? "Active" : "Inactive";
    }

    user.updatedByDid = req.user?.did || null;
    await user.save();

    res.json({
      status: "success",
      message: `User status updated to ${user.status}`,
      data: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// Delete a user and prevent unsafe admin/self-deletion cases.
export const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const requesterId = req.user?.did || req.user?.userId;
    const requesterRole = req.user?.role;

    const user = await findUserByIdOrDid(userId);
    if (!user) return res.status(404).json({ status: "error", message: "User not found" });

    // Admin cannot delete their own account
    if (requesterRole === "Admin" && (requesterId === user.did || requesterId === String(user._id))) {
      return res.status(403).json({ status: "error", message: "Admin cannot delete own account" });
    }

    // Admin cannot delete Owner
    if (requesterRole === "Admin" && user.role === "Owner") {
      return res.status(403).json({ status: "error", message: "Insufficient permissions to delete this user" });
    }

    await UserModel.deleteOne({ _id: user._id });
    res.json({ status: "success", message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};
