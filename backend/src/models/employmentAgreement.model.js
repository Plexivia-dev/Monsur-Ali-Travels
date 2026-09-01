import mongoose, { Schema, model } from "mongoose";
import { generateDid } from "../utils/generateDid.js";

const { models } = mongoose;

// Generates unique Agreement ID: 3 random uppercase English letters + 5 random digits (e.g. "AGR-ABC84920")
export function generateUniqueAgreementId() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let alpha = "";
  for (let i = 0; i < 3; i++) {
    alpha += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `AGR-${alpha}${randomNum}`;
}

const employmentAgreementSchema = new Schema(
  {
    did: {
      type: String,
      default: () => generateDid(),
      unique: true,
      index: true,
    },
    // unique agreement ID (3 letters + 5 digits e.g. AGR-ABC84920)
    agreementId: {
      type: String,
      trim: true,
      default: generateUniqueAgreementId,
    },

    // 1. Company / Header Information
    companyInfo: {
      companyName: { type: String, default: "MONSUR ALI TRAVELS" },
      officeAddress: { type: String, default: "Mominpur Jagannathpur Road, Sunamganj, Post Code 3060" },
      phone: { type: String, default: "+8801345579534" },
      email: { type: String, default: "contact@monsuralitravels.com" },
    },

    // 2. Parties Details
    parties: {
      agreementDate: { type: String, default: "" },
      nidPassport: { type: String, default: "" },
      employerName: { type: String, default: "MD. IKRAMUL HOSSAIN (Managing Director)" },
      employerPhone: { type: String, default: "+8801345579534" },
      employeeName: { type: String, required: true, trim: true },
      employeeEmail: { type: String, default: "" },
      fatherHusbandName: { type: String, default: "" },
      address: { type: String, default: "" },
    },

    // 3. Guardian Details
    guardian: {
      guardianName: { type: String, default: "" },
      guardianPhone: { type: String, default: "" },
      relationship: { type: String, default: "Father" },
      emergencyPhone: { type: String, default: "" },
      guardianNid: { type: String, default: "" },
      guardianAddress: { type: String, default: "" },
    },

    // 4. Position & Schedule
    position: {
      designation: { type: String, default: "" },
      department: { type: String, default: "" },
      joiningDate: { type: String, default: "" },
      location: { type: String, default: "Head Office, Nadampur" },
      jobType: { type: String, default: "Full-Time (Permanent)" },
      workSchedule: { type: String, default: "9:00 AM - 6:00 PM, Sunday to Thursday" },
    },

    // 5. Salary Structure
    salary: {
      basicSalary: { type: String, default: "0" },
      houseRent: { type: String, default: "0" },
      medical: { type: String, default: "0" },
      conveyance: { type: String, default: "0" },
      specialAllowance: { type: String, default: "0" },
      grossSalary: { type: String, default: "0" },
      grossSalaryInWords: { type: String, default: "" },
    },

    // 6. Leave Policy & Benefits
    leave: {
      casualDays: { type: String, default: "10" },
      sickDays: { type: String, default: "14" },
      earnedDays: { type: String, default: "18" },
      lunchProvided: { type: Boolean, default: true },
      teaSnacks: { type: Boolean, default: true },
      lunchAllowance: { type: String, default: "" },
    },

    // 7. Witnesses
    witnesses: {
      firstWitness: {
        name: { type: String, default: "" },
        phone: { type: String, default: "" },
        address: { type: String, default: "" },
      },
      secondWitness: {
        name: { type: String, default: "" },
        phone: { type: String, default: "" },
        address: { type: String, default: "" },
      },
    },

    // Status and Tracking
    status: {
      type: String,
      enum: ["draft", "active", "completed", "terminated"],
      default: "active",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "employment-agreement",
  }
);

employmentAgreementSchema.pre("save", function (next) {
  if (!this.agreementId) {
    this.agreementId = generateUniqueAgreementId();
  }
  next();
});

export const EmploymentAgreementModel =
  models.EmploymentAgreement ||
  model("EmploymentAgreement", employmentAgreementSchema, "employment-agreement");

export default EmploymentAgreementModel;
