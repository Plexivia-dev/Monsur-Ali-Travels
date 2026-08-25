import mongoose from "mongoose";
import { generateDid } from "../utils/generateDid.js";

// Generates unique Indian Visa Application Tracking Number: IVISA- + 2 letters + 4 digits + 1 middle letter + 3 digits (e.g. "IVISA-AB4829K513")
export function generateUniqueIndianVisaTrackingNo() {
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

  return `IVISA-${prefixLetters}${firstDigits}${midLetter}${lastDigits}`;
}

const indianVisaSubmissionSchema = new mongoose.Schema(
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
      default: generateUniqueIndianVisaTrackingNo,
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
    passportNo: {
      type: String,
      required: [true, "Passport number is required"],
      trim: true,
    },
    nidBirthCertNo: { type: String, default: "" },
    applicantPhone: { type: String, default: "" },
    applicantEmail: { type: String, default: "" },
    address: { type: String, default: "" },

    // Visa Specifications
    visaType: {
      type: String,
      default: "ট্যুরিস্ট ভিসা (Tourist Visa)",
    },
    entryPort: {
      type: String,
      default: "হরিদাসপুর / গেদে (Haridaspur / Gede)",
    },
    durationMonths: {
      type: String,
      default: "১ বছর (1 Year Multiple)",
    },
    entryType: {
      type: String,
      default: "মাল্টিপল এন্ট্রি (Multiple Entry)",
    },

    // Documents Provided Checklist
    documentsProvided: {
      passportOriginal: { type: Boolean, default: true },
      nidCopy: { type: Boolean, default: true },
      photoLabPrint: { type: Boolean, default: true },
      bankSolvency: { type: Boolean, default: false },
      utilityBillCopy: { type: Boolean, default: true },
      previousVisaCopy: { type: Boolean, default: false },
      nocTradeLicense: { type: Boolean, default: false },
    },

    remarks: { type: String, default: "" },

    // Status Stages: pending -> submitted -> accepted -> rejected -> delivered
    status: {
      type: String,
      default: "received",
      index: true,
    },

    // Attachments uploaded at any stage
    attachments: {
      photo: { type: String, default: "" },
      passportScan: { type: String, default: "" },
      nidScan: { type: String, default: "" },
      visaCopy: { type: String, default: "" },
      supportingDocs: [
        {
          name: { type: String, default: "" },
          fileUrl: { type: String, default: "" },
          fileType: { type: String, default: "" },
          uploadedAt: { type: Date, default: Date.now },
        },
      ],
    },

    // Stage updates / Activity History
    activityLogs: [
      {
        timestamp: { type: Date, default: Date.now },
        statusChangedTo: { type: String, default: "" },
        note: { type: String, default: "" },
        updatedBy: { type: String, default: "Admin" },
      },
    ],

    isActive: { type: Boolean, default: true },
    createdByDid: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
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

// Virtual Populates for indianVisaSubmission relations using DIDs
indianVisaSubmissionSchema.virtual("clientId", {
  ref: "Client",
  localField: "clientDid",
  foreignField: "did",
  justOne: true,
});
indianVisaSubmissionSchema.virtual("createdBy", {
  ref: "User",
  localField: "createdByDid",
  foreignField: "did",
  justOne: true,
});

// Pre-save hook to ensure trackingNo is generated if not provided
indianVisaSubmissionSchema.pre("save", function (next) {
  if (!this.trackingNo) {
    this.trackingNo = generateUniqueIndianVisaTrackingNo();
  }
  next();
});

export const IndianVisaSubmissionModel =
  mongoose.models.IndianVisaSubmission ||
  mongoose.model("IndianVisaSubmission", indianVisaSubmissionSchema);
