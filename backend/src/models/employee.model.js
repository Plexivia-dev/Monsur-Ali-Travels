import mongoose, { Schema, model } from "mongoose";
import { generateDid } from "../utils/generateDid.js";

const { models } = mongoose;

const employeeSchema = new Schema(
  {
    did: {
      type: String,
      default: () => generateDid(),
      unique: true,
      index: true,
    },
    userDid: {
      type: String,
      ref: "User",
      required: false,
      index: true,
    },
    employeeCode: {
      type: String,
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, "Employee full name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      default: "General",
      trim: true,
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    baseSalary: {
      type: Number,
      default: 0,
    },
    accessLevel: {
      type: String,
      enum: ["Level_1", "Level_2", "Level_3", "Manager", "Full_Staff"],
      default: "Level_1",
    },
    permissions: {
      canCreateCases: { type: Boolean, default: true },
      canUpdateStatus: { type: Boolean, default: true },
      canViewAccounts: { type: Boolean, default: false },
      canManageDocs: { type: Boolean, default: true },
    },
    salaryHistory: [
      {
        month: { type: String, required: true }, // e.g. "2026-08"
        amount: { type: Number, required: true },
        paidAt: { type: Date, default: Date.now },
        paidByDid: { type: String },
        remarks: { type: String, default: "" },
      },
    ],
    status: {
      type: String,
      enum: ["Active", "On_Leave", "Resigned", "Terminated"],
      default: "Active",
    },
    createdByDid: { type: String, default: null },
    updatedByDid: { type: String, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

employeeSchema.pre("save", function (next) {
  if (!this.employeeCode) {
    const num = Math.floor(1000 + Math.random() * 9000);
    this.employeeCode = `EMP-${num}`;
  }
  next();
});

export const EmployeeModel = models.Employee || model("Employee", employeeSchema);
