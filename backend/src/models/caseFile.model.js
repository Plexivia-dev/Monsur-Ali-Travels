import mongoose, { Schema, model } from "mongoose";
import { generateDid } from "../utils/generateDid.js";
import "./client.model.js";
import "./documentVault.model.js";
import "./task.model.js";
import "./moneyReceipt.model.js";
import "./user.model.js";

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
    clientDid: {
      type: String,
      required: [true, "Client reference DID is required"],
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

    // Primary Guardian Info (Guarantor for 300-Tk Judicial Stamp Deed)
    guardian: {
      name: { type: String, default: "", trim: true },
      relationship: { type: String, default: "Father", trim: true },
      phone: { type: String, default: "", trim: true },
      nidNumber: { type: String, default: "", trim: true },
      address: { type: String, default: "", trim: true },
    },

    // Case Type / Country (Extensible: 'greece', 'n-macedonia', 'indian-bsf', or custom string)
    caseType: {
      type: String,
      required: [true, "Case Type or Country is required"],
      trim: true,
      lowercase: true,
      index: true,
    },

    // Canonical 4 Lifecycle Stages & Aliases
    status: {
      type: String,
      enum: [
        "ENTRY",
        "INTAKE",
        "PROCESSING",
        "UNDER_PROCESS",
        "APPROVED_OFFER_LETTER",
        "OFFER_LETTER",
        "SUBMITTED_EMBASSY_BSF",
        "COMPLETED_DELIVERED",
        "COMPLETED",
        "REJECTED",
        "ON_HOLD",
      ],
      default: "INTAKE",
      index: true,
    },

    assignedToDid: {
      type: String,
      default: null,
      index: true,
    },
    assignedToName: {
      type: String,
      default: "",
      trim: true,
    },
    assignedOfficer: {
      type: String,
      default: "",
      trim: true,
    },
    workflowStatus: {
      type: String,
      default: "Received",
      trim: true,
      index: true,
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        remarks: { type: String, default: "" },
        updatedByDid: { type: String, ref: "User" },
        updatedByName: { type: String, default: "" },
        assignedToDid: { type: String, ref: "User" },
        date: { type: Date, default: Date.now },
      }
    ],

    // Document Checklist & Follow-up Reminders
    checklist: {
      photo2x2: { type: Boolean, default: false },
      electricityBill: { type: Boolean, default: false }, // Electricity Bill
      nidCopy: { type: Boolean, default: false },
      landDocuments: { type: Boolean, default: false }, // Land Documents
      followUpCallRequired: { type: Boolean, default: false }, // Pending paper call reminder
      notes: { type: String, default: "" },
    },

    // 3-Stage Payment Milestones & Company Due Tracking
    paymentLedger: {
      totalAgreedAmount: { type: Number, default: 0 },
      step1_advance: { type: Number, default: 0 },        // Advance upon file submission
      step2_offerApproval: { type: Number, default: 0 },   // Upon offer letter approval
      step3_delivery: { type: Number, default: 0 },        // Upon visa & passport delivery
      totalPaidAmount: { type: Number, default: 0 },
      dueAmount: { type: Number, default: 0, index: true }, // Outstanding due balance tracking
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
    // Internal Staff Communication & Case Notes (Direct collaboration)
    internalMessages: [
      {
        did: { type: String, default: () => generateDid() },
        senderDid: { type: String, required: true },
        senderName: { type: String, required: true },
        senderRole: { type: String, default: "Staff" },
        message: { type: String, required: true, trim: true },
        attachments: [{ fileName: String, fileUrl: String }],
        createdAt: { type: Date, default: Date.now },
      }
    ],
    createdByDid: {
      type: String,
      default: null,
    },
    createdByName: {
      type: String,
      default: "",
    },
    updatedByDid: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
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

// Virtual Populates for DID relations
caseFileSchema.virtual("clientInfo", {
  ref: "Client",
  localField: "clientDid",
  foreignField: "did",
  justOne: true,
});

caseFileSchema.virtual("workflowTasks", {
  ref: "Task",
  localField: "did",
  foreignField: "caseDid",
  justOne: false,
});

caseFileSchema.virtual("financialReceipts", {
  ref: "MoneyReceipt",
  localField: "did",
  foreignField: "caseDid",
  justOne: false,
});

caseFileSchema.virtual("vaultDocuments", {
  ref: "DocumentVault",
  localField: "did",
  foreignField: "caseDid",
  justOne: false,
});

// Virtual Populates for CaseFile relations using DIDs
caseFileSchema.virtual("clientId", {
  ref: "Client",
  localField: "clientDid",
  foreignField: "did",
  justOne: true,
});
caseFileSchema.virtual("assignedTo", {
  ref: "User",
  localField: "assignedToDid",
  foreignField: "did",
  justOne: true,
});
caseFileSchema.virtual("createdBy", {
  ref: "User",
  localField: "createdByDid",
  foreignField: "did",
  justOne: true,
});
caseFileSchema.virtual("updatedBy", {
  ref: "User",
  localField: "updatedByDid",
  foreignField: "did",
  justOne: true,
});

const CaseFile = models.CaseFile || model("CaseFile", caseFileSchema);
export default CaseFile;
