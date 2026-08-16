import mongoose from "mongoose";
import { generateDid } from "../utils/generateDid.js";

// Generates unique Passport Submission Tracking Number: PASS- + 2 letters + 4 digits + 1 middle letter + 3 digits (e.g. "PASS-AB4829K513")
export function generateUniquePassportTrackingNo() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const getChar = () => letters.charAt(Math.floor(Math.random() * letters.length));
  const getDigits = (len) => {
    let res = "";
    for (let i = 0; i < len; i++) res += Math.floor(Math.random() * 10);
    return res;
  };

  const prefixLetters = getChar() + getChar();
  const firstDigits = getDigits(4);
  const midLetter = getChar();
  const lastDigits = getDigits(3);

  return `PASS-${prefixLetters}${firstDigits}${midLetter}${lastDigits}`;
}

const passportSubmissionSchema = new mongoose.Schema(
  {
    did: {
      type: String,
      default: () => generateDid(),
      unique: true,
      index: true,
    },
    trackingNo: {
      type: String,
      trim: true,
      default: generateUniquePassportTrackingNo,
    },
    submissionDate: { type: String, default: "" },

    // Agency Header Info
    agencyInfo: {
      name: { type: String, default: "MANSUR ALI TOURS & TRAVELS" },
      address: { type: String, default: "Nadampur, Jagannathpur, Sunamganj - 3060, Sylhet, Bangladesh" },
      phone: { type: String, default: "+8801345579534" },
      email: { type: String, default: "monsuralitravels@gmail.com" },
      licenseNo: { type: String, default: "RL-1842" },
    },

    // Central Customer Profile Reference (Relationship)
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
      index: true,
    },

    // Applicant Details
    applicantName: {
      type: String,
      required: [true, "Applicant full name is required"],
      trim: true,
    },
    nidBirthCertNo: { type: String, default: "" },
    previousPassportNo: { type: String, default: "" },
    applicantPhone: { type: String, default: "" },
    applicantEmail: { type: String, default: "" },
    address: { type: String, default: "" },

    // Guardian Details
    guardianName: { type: String, default: "" },
    guardianPhone: { type: String, default: "" },
    guardianEmail: { type: String, default: "" },
    relationship: { type: String, default: "পিতা" },

    // Application Specifications
    passportType: {
      type: String,
      default: "ই-পাসপোর্ট (E-Passport)",
    },
    applicationCategory: {
      type: String,
      default: "নতুন আবেদন (New Passport)",
    },
    pageCount: {
      type: String,
      default: "৪৮ পৃষ্ঠা (48 Pages)",
    },
    validityYears: {
      type: String,
      default: "১০ বছর (10 Years)",
    },
    deliverySpeed: {
      type: String,
      default: "সাধারণ (Regular)",
    },

    // Documents Checklist
    documentsProvided: {
      nidCopy: { type: Boolean, default: true },
      birthCertOnline: { type: Boolean, default: false },
      oldPassportOriginal: { type: Boolean, default: false },
      photoLabPrint: { type: Boolean, default: true },
      guardianNidCopy: { type: Boolean, default: false },
      utilityBillCopy: { type: Boolean, default: false },
    },

    remarks: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "processing", "submitted", "delivered"],
      default: "pending",
    },
  },
  {
    timestamps: true,
    collection: "passport-submissions",
  }
);

passportSubmissionSchema.pre("save", function (next) {
  if (!this.trackingNo) {
    this.trackingNo = generateUniquePassportTrackingNo();
  }
  next();
});

export const PassportSubmissionModel =
  mongoose.models.PassportSubmission ||
  mongoose.model("PassportSubmission", passportSubmissionSchema);
