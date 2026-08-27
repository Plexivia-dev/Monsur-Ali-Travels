import mongoose, { Schema, model } from "mongoose";
import { generateDid } from "../utils/generateDid.js";

const { models } = mongoose;

// Generates unique Verification ID: 3 letters + 5 digits (e.g. "JVF-AB48291")
export function generateUniqueJobVerificationId() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let alpha = "";
  for (let i = 0; i < 3; i++) {
    alpha += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `JVF-${alpha}${randomNum}`;
}

const jobVerificationSchema = new Schema(
  {
    did: {
      type: String,
      default: () => generateDid(),
      unique: true,
      index: true,
    },
    verificationId: {
      type: String,
      trim: true,
      unique: true,
      default: generateUniqueJobVerificationId,
    },
    clientDid: {
      type: String,
      default: null,
      index: true,
    },

    // 1. Company Information
    companyInfo: {
      companyName: { type: String, default: "MONSUR ALI TOURS & TRAVELS" },
      companyPhone: { type: String, default: "+8801345579534" },
      companyEmail: { type: String, default: "contact@monsuralitravels.com" },
      companyTaxNumber: { type: String, default: "" },
      companyIdNumber: { type: String, default: "" },
      companyAddress: { type: String, default: "Mominpur Jagannathpur Road, Sunamganj, Post Code 3060" },
      companyCity: { type: String, default: "Sunamganj" },
    },

    // 2. Client Information
    clientInfo: {
      clientName: { type: String, required: true, trim: true },
      clientPhone: { type: String, required: true, trim: true },
      clientEmail: { type: String, default: "" },
      clientTaxNumber: { type: String, default: "" },
      clientIdNumber: { type: String, default: "" },
      clientAddress: { type: String, default: "" },
      clientCity: { type: String, default: "" },
    },

    // 3. Job & Stay Details
    jobStayDetails: {
      destinationPlace: { type: String, default: "" },
      destinationCountry: { type: String, default: "" },
      destinationCity: { type: String, default: "" },
      accommodationType: { type: String, default: "Company Provided" },
      residenceAddress: { type: String, default: "" },
      jobNature: { type: String, default: "" },
      jobTitle: { type: String, default: "" },
      dailyWorkingHours: { type: String, default: "8 Hours" },
      weeklyWorkingHours: { type: String, default: "48 Hours" },
      salaryAmount: { type: String, default: "" },
      currency: { type: String, default: "EUR" },
    },

    // 4. Work Permit & Helper Info
    helperInfo: {
      helperName: { type: String, default: "" },
      helperRelationship: { type: String, default: "" },
      helperDurationOfStay: { type: String, default: "" },
      helperImmigrationStatus: { type: String, default: "Legal Resident" },
      knowsHelper: { type: String, default: "Yes" },
      durationKnown: { type: String, default: "" },
      helperDob: { type: String, default: "" },
      helperPhone: { type: String, default: "" },
    },

    // Verification & Status
    verificationDetails: {
      issueDate: { type: String, default: () => new Date().toISOString().split("T")[0] },
      clientSignatureDate: { type: String, default: () => new Date().toISOString().split("T")[0] },
      authorizedSignatory: { type: String, default: "Managing Director" },
      authorizedSignatureDate: { type: String, default: () => new Date().toISOString().split("T")[0] },
      notes: { type: String, default: "" },
      status: { type: String, default: "Verified" },
    },

    createdByDid: {
      type: String,
      default: null,
    },
    qrCode: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

jobVerificationSchema.index({ "clientInfo.clientName": "text", "clientInfo.clientPhone": "text", verificationId: "text" });

export const JobVerificationModel =
  models.JobVerification || model("JobVerification", jobVerificationSchema);
