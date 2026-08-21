import mongoose, { Schema, model } from "mongoose";
import { generateDid } from "../utils/generateDid.js";

const { models } = mongoose;

export const USER_ROLES = ["Owner", "Admin", "Employee"];

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    did: { type: String, default: () => generateDid(), unique: true, index: true },
    employeeDid: { type: String, ref: "Employee", default: null, index: true },
    passwordHash: { type: String, required: true, trim: true, select: false },
    phone: { type: String, required: true, trim: true, index: true },
    refreshToken: { type: String, select: false },
    refreshTokenExpiresAt: { type: Date, select: false },
    emailOtp: { type: String, trim: true, select: false },
    emailOtpExpiresAt: { type: Date, select: false },
    twoFactorSecret: { type: String, select: false },
    twoFactorEnabled: { type: Boolean, default: false },
    role: { type: String, required: true, enum: USER_ROLES, default: "Employee" },
    department: { type: String, trim: true, default: "" },
    designation: { type: String, trim: true, default: "" },
    assets: {
      type: [String],
      default: [],
    },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
    createdByDid: { type: String, default: null },
    updatedByDid: { type: String, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret.did;
        delete ret._id;
        delete ret.passwordHash;
        delete ret.emailOtp;
        delete ret.emailOtpExpiresAt;
        delete ret.twoFactorSecret;
        delete ret.refreshToken;
        delete ret.refreshTokenExpiresAt;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  },
);

userSchema.virtual("createdBy", {
  ref: "User",
  localField: "createdByDid",
  foreignField: "did",
  justOne: true,
});
userSchema.virtual("updatedBy", {
  ref: "User",
  localField: "updatedByDid",
  foreignField: "did",
  justOne: true,
});
userSchema.virtual("employee", {
  ref: "Employee",
  localField: "employeeDid",
  foreignField: "did",
  justOne: true,
});

export const UserModel = models.User || model("User", userSchema);
