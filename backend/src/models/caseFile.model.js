import mongoose, { Schema, model } from "mongoose";
import { generateDid } from "../utils/generateDid.js";

const { models } = mongoose;

export function generateCaseNumber(caseType = "GEN") {
  const prefix = String(caseType).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4) || "CASE";
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${year}-${randomDigits}`;
}

const caseFileSchema = new Schema(
  {
    did: {
      type: String,
      default: () => generateDid(),
      unique: true,
      index: true,
    },
    caseNumber: {
      type: String,
      unique: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: [true, "Customer reference is required"],
      index: true,
    },
    // Snapshot fields for ultra-fast lookup
    applicantName: {
      type: String,
      trim: true,
      index: true,
    },
    passportNumber: {
      type: String,
      trim: true,
      uppercase: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      index: true,
    },
    nidNumber: {
      type: String,
      trim: true,
      default: "",
    },

    // Case Type / Country (Extensible: 'greece', 'n-macedonia', 'indian-bsf', or custom string)
    caseType: {
      type: String,
      required: [true, "Case Type or Country is required"],
      trim: true,
      lowercase: true,
      index: true,
    },

    // Universal 5 Lifecycle Steps
    status: {
      type: String,
      enum: [
        "ENTRY",                  // ১. পাসপোর্ট রিসিভ ও এন্ট্রি
        "PROCESSING",             // ২. লয়ার/উকিল কাজ শুরু করেছে
        "APPROVED_OFFER_LETTER",  // ৩. ওয়ার্ক পারমিট / অফার লেটার অনুমোদিত
        "SUBMITTED_EMBASSY_BSF",  // ৪. বিএসএফ / এম্বাসিতে জমা সম্পন্ন
        "COMPLETED_DELIVERED",    // ৫. ভিসা ও পাসপোর্ট ডেলিভারি সম্পন্ন (লকড)
        "REJECTED",
        "ON_HOLD",
      ],
      default: "ENTRY",
      index: true,
    },

    // Document Checklist & Follow-up Reminders
    checklist: {
      photo2x2: { type: Boolean, default: false },
      electricityBill: { type: Boolean, default: false }, // কারেন্ট বিল
      nidCopy: { type: Boolean, default: false },
      landDocuments: { type: Boolean, default: false }, // জমির কাগজ
      followUpCallRequired: { type: Boolean, default: false }, // পেন্ডিং পেপারের জন্য কল রিমাইন্ডার
      notes: { type: String, default: "" },
    },

    // 3-Stage Payment Milestones & Company Due Tracking
    paymentLedger: {
      totalAgreedAmount: { type: Number, default: 0 },
      step1_advance: { type: Number, default: 0 },        // ফাইল সাবমিশনের সময় অ্যাডভান্স
      step2_offerApproval: { type: Number, default: 0 },   // অফার লেটার অ্যাপ্রুভ হলে
      step3_delivery: { type: Number, default: 0 },        // ভিসা ও পাসপোর্ট ডেলিভারির সময়
      totalPaidAmount: { type: Number, default: 0 },
      dueAmount: { type: Number, default: 0, index: true }, // কোম্পানির বকেয়া ট্র্যাকিং
      isFullyPaid: { type: Boolean, default: false },
    },

    // Extensible Extra Data (Country-specific fields without schema changes)
    extraData: {
      type: Schema.Types.Mixed,
      default: {},
    },

    remarks: {
      type: String,
      default: "",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Auto-assign case number and compute payment ledger before save
caseFileSchema.pre("save", function (next) {
  if (!this.caseNumber) {
    this.caseNumber = generateCaseNumber(this.caseType);
  }

  // Recalculate total paid
  const p1 = Number(this.paymentLedger?.step1_advance) || 0;
  const p2 = Number(this.paymentLedger?.step2_offerApproval) || 0;
  const p3 = Number(this.paymentLedger?.step3_delivery) || 0;
  const totalPaid = p1 + p2 + p3;
  this.paymentLedger.totalPaidAmount = totalPaid;

  const totalAgreed = Number(this.paymentLedger?.totalAgreedAmount) || 0;
  if (totalAgreed > 0) {
    this.paymentLedger.dueAmount = Math.max(0, totalAgreed - totalPaid);
    this.paymentLedger.isFullyPaid = totalPaid >= totalAgreed;
  }

  next();
});

caseFileSchema.index({
  caseNumber: "text",
  applicantName: "text",
  passportNumber: "text",
  phone: "text",
  caseType: "text",
});

const CaseFile = models.CaseFile || model("CaseFile", caseFileSchema);
export default CaseFile;
