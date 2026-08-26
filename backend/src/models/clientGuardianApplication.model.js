import mongoose from "mongoose";
import { generateDid } from "../utils/generateDid.js";

// Generates unique Client Guardian Application Tracking Number: CGA- + 6 digits
export function generateUniqueClientAppNo() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const getChar = () => letters.charAt(Math.floor(Math.random() * letters.length));
  const num = Math.floor(100000 + Math.random() * 900000);
  return `CGA-${getChar()}${getChar()}-${num}`;
}

const clientGuardianSchema = new mongoose.Schema(
  {
    did: {
      type: String,
      default: () => generateDid(),
      unique: true,
      index: true,
    },
    applicationNo: {
      type: String,
      trim: true,
      default: generateUniqueClientAppNo,
    },
    dateReceived: { type: String, default: "" },
    verifiedBy: { type: String, default: "M. Ali (Manager)" },
    declarationDate: { type: String, default: "" },

    // Service Category
    serviceType: {
      type: String,
      default: "ইন্ডিয়ান ভিসা (Indian Visa)",
    },

    clientDid: {
      type: String,
      default: null,
      index: true,
    },

    // 1. Client Details
    client: {
      fullName: {
        type: String,
        required: [true, "Client full name is required"],
        trim: true,
      },
      nidNumber: { type: String, default: "", trim: true },
      passportNumber: { type: String, default: "", trim: true },
      countryRejected: { type: String, default: "" },
      fatherName: { type: String, default: "" },
      motherName: { type: String, default: "" },
      mobileNumber: { type: String, default: "", trim: true },
      email: { type: String, default: "", trim: true },
    },

    // 2. Guardian Details
    guardian: {
      fullName: { type: String, default: "", trim: true },
      nidNumber: { type: String, default: "", trim: true },
      fatherName: { type: String, default: "" },
      motherName: { type: String, default: "" },
      mobileNumber: { type: String, default: "", trim: true },
      email: { type: String, default: "", trim: true },
      address: { type: String, default: "" },
      relationship: { type: String, default: "Father (পিতা)" },
    },

    // 3. Requirement Documents Checklist
    requirementDocuments: [
      {
        id: { type: Number },
        name: { type: String, default: "" },
        submitted: { type: String, default: "Yes" },
        remarks: { type: String, default: "" },
      },
    ],

    // 4. Advance Payment Details
    payment: {
      totalAmount: { type: Number, default: 0 },
      advancePaid: { type: Number, default: 0 },
      dueAmount: { type: Number, default: 0 },
      paymentMethod: {
        type: String,
        default: "Cash",
      },
      paymentStatus: {
        type: String,
        default: "Partial",
      },
      paymentDate: { type: String, default: "" },
      receiptNo: { type: String, default: "" },
    },

    // 5. Document Attachments (Passport size photo, Passport scan, NID scan & other files)
    attachments: {
      passportPhoto: { type: String, default: "" }, // 2x2 Passport Size Picture
      passportScan: { type: String, default: "" }, // Main Passport Scan
      nidScan: { type: String, default: "" }, // NID Card Scan
      otherFiles: [
        {
          name: { type: String, default: "" },
          fileType: { type: String, default: "" },
          fileData: { type: String, default: "" },
          uploadedAt: { type: Date, default: Date.now },
        },
      ],
    },

    // Workflow / File Processing Status
    status: {
      type: String,
      enum: [
        "received", // ফাইল গ্রহণ করা হয়েছে
        "under_review", // কাগজপত্র যাচাই হচ্ছে
        "processing", // প্রসেসিং চলছে
        "embassy_submitted", // এম্বাসি / ভিএফএস-এ জমা
        "approved", // অনুমোদিত / ভিসা রেডি
        "delivered", // ক্লায়েন্টকে বুঝিয়ে দেওয়া হয়েছে
        "rejected", // বাতিল / রিজেক্টেড
      ],
      default: "received",
    },

    // Activity Tracking Logs
    activityLogs: [
      {
        timestamp: { type: Date, default: Date.now },
        statusChangedTo: { type: String },
        note: { type: String, default: "" },
        updatedBy: { type: String, default: "Admin" },
      },
    ],

    officeNotes: { type: String, default: "" },

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

// Virtual Populates for clientGuardianApplication relations using DIDs
clientGuardianSchema.virtual("clientId", {
  ref: "Client",
  localField: "clientDid",
  foreignField: "did",
  justOne: true,
});
clientGuardianSchema.virtual("createdBy", {
  ref: "User",
  localField: "createdByDid",
  foreignField: "did",
  justOne: true,
});

// Pre-save hook to calculate due amount
clientGuardianSchema.pre("save", function (next) {
  if (this.payment) {
    const total = Number(this.payment.totalAmount) || 0;
    const advance = Number(this.payment.advancePaid) || 0;
    this.payment.dueAmount = Math.max(0, total - advance);

    if (total > 0 && advance >= total) {
      this.payment.paymentStatus = "Paid";
    } else if (advance > 0) {
      this.payment.paymentStatus = "Partial";
    } else {
      this.payment.paymentStatus = "Unpaid";
    }
  }
  next();
});

export const ClientGuardianModel =
  mongoose.models.ClientGuardianApplication || mongoose.models.ClientGuardian ||
  mongoose.model("ClientGuardianApplication", clientGuardianSchema);

export default ClientGuardianModel;
