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
      name: { type: String, default: "MONSUR ALI TOURS & TRAVELS" },
      address: { type: String, default: "Mominpur Jagannathpur Road, Sunamganj, Post Code 3060" },
      phone: { type: String, default: "+8801345579534" },
      email: { type: String, default: "contact@monsuralitravels.com" },
    },

    clientDid: {
      type: String,
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
      default: "received",
    },
    attachments: {
      photo: { type: String, default: "" },
      passportScan: { type: String, default: "" },
      nidScan: { type: String, default: "" },
      supportingDocs: [
        {
          name: { type: String, default: "" },
          fileUrl: { type: String, default: "" },
          fileType: { type: String, default: "" },
          uploadedAt: { type: Date, default: Date.now },
        },
      ],
    },
    activityLogs: [
      {
        timestamp: { type: Date, default: Date.now },
        statusChangedTo: { type: String, default: "" },
        note: { type: String, default: "" },
        updatedBy: { type: String, default: "Admin" },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: "passport-submissions",
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret.did;
        delete ret._id;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

// Virtual Populates for passportSubmission relations using DIDs
passportSubmissionSchema.virtual("customerId", {
  ref: "Client",
  localField: "clientDid",
  foreignField: "did",
  justOne: true,
});

passportSubmissionSchema.pre("save", function (next) {
  if (!this.trackingNo) {
    this.trackingNo = generateUniquePassportTrackingNo();
  }
  next();
});

export const PassportSubmissionModel =
  mongoose.models.PassportSubmission ||
  mongoose.model("PassportSubmission", passportSubmissionSchema);
