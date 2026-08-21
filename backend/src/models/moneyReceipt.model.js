import mongoose, { Schema, model } from "mongoose";
import { generateDid } from "../utils/generateDid.js";
import crypto from "crypto";
import QRCode from "qrcode";

const { models } = mongoose;

/**
 * Generates unique receipt number: MA + CurrentYear(2 digits) + CurrentMonth(2 digits) + 4-digit hexadecimal code
 * Example: MA26081235 or MA26084F1A
 */
export function generateReceiptTokenNo() {
  const date = new Date();
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const hex = crypto.randomBytes(2).toString("hex").toUpperCase(); // 4-digit hexadecimal code
  return `MA${yy}${mm}${hex}`;
}

/**
 * Generates exact QR code text formatted as requested:
 * Monsur Ali Travels
 * Money receipt No: MA2601235
 */
export function generateReceiptQrText(receiptNo) {
  return `Monsur Ali Travels\nMoney receipt No: ${receiptNo}`;
}

/**
 * Generates base64 QR Code Data URL
 */
export async function generateReceiptQrCode(receiptNo) {
  try {
    const text = generateReceiptQrText(receiptNo);
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 256,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });
  } catch (err) {
    console.error("Error generating receipt QR code:", err);
    return "";
  }
}

const moneyReceiptSchema = new Schema(
  {
    did: {
      type: String,
      default: () => generateDid(),
      unique: true,
      index: true,
    },
    receiptNo: {
      type: String,
      unique: true,
      index: true,
      default: generateReceiptTokenNo,
    },
    qrCode: {
      type: String,
      default: "",
    },
    // Central Customer reference if available
    clientDid: {
      type: String,
      default: null,
      index: true,
    },
    // Source document linking (e.g. Indian Visa, Passport, CaseFile, Invoice)
    serviceRef: {
      modelName: { type: String, default: "" },
      docId: { type: Schema.Types.ObjectId, default: null },
      trackingId: { type: String, default: "" },
    },

    // Client details
    clientName: {
      type: String,
      required: [true, "Client name is required"],
      trim: true,
      index: true,
    },
    clientPhone: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    passportNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
      index: true,
    },

    // Service & Payment details
    serviceType: {
      type: String,
      trim: true,
      default: "Visa Processing & Flight Ticket Booking",
    },
    purpose: {
      type: String,
      trim: true,
      default: "Visa Processing & Flight Ticket Booking (Saudi Arabia)",
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    amountInWords: {
      type: String,
      trim: true,
      default: "",
    },
    currency: {
      type: String,
      default: "BDT",
    },
    paymentMethod: {
      type: String,
      default: "Cash",
    },

    // Dates & Times
    receiptDate: {
      type: String,
      default: () => new Date().toISOString().split("T")[0],
    },
    receiptTime: {
      type: String,
      default: "11:30 AM",
    },

    // Officer & Signatures
    receivedBy: {
      type: String,
      default: "Md. Tanvir Hossain",
    },
    receivedByRole: {
      type: String,
      default: "Accounts Officer",
    },
    preparedBy: {
      type: String,
      default: "প্রদানকারী",
    },
    receivedBySignature: {
      type: String,
      default: "গ্রহণকারী",
    },
    accountsSignature: {
      type: String,
      default: "একাউন্টেন্ট",
    },
    approvedBySignature: {
      type: String,
      default: "জিএম / প্রোপাইটার",
    },

    // Layout configuration
    dualPrint: {
      type: Boolean,
      default: true,
    },

    // Internal Lifecycle Status
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "confirmed",
      index: true,
    },

    // Manager / Token Creator
    createdByDid: {
      type: String,
      default: null,
    },
    createdByName: {
      type: String,
      default: "ম্যানেজার (Manager)",
    },

    // Cashier / Accountant (Seal/Confirmation)
    confirmedByDid: {
      type: String,
      default: null,
    },
    confirmedByName: {
      type: String,
      default: "",
    },
    confirmedAt: {
      type: Date,
      default: null,
    },

    // Bank Deposit & Turnover Management
    handedOverToBank: {
      type: Boolean,
      default: false,
    },
    bankDepositRef: {
      type: String,
      default: "",
    },
    bankDepositDate: {
      type: Date,
      default: null,
    },

    notes: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
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

// Virtual Populates for moneyReceipt relations using DIDs
moneyReceiptSchema.virtual("customerId", {
  ref: "Client",
  localField: "clientDid",
  foreignField: "did",
  justOne: true,
});
moneyReceiptSchema.virtual("createdBy", {
  ref: "User",
  localField: "createdByDid",
  foreignField: "did",
  justOne: true,
});
moneyReceiptSchema.virtual("confirmedBy", {
  ref: "User",
  localField: "confirmedByDid",
  foreignField: "did",
  justOne: true,
});

// Ensure receipt number and QR code generation before save
moneyReceiptSchema.pre("save", async function (next) {
  if (!this.receiptNo) {
    this.receiptNo = generateReceiptTokenNo();
  }
  if (!this.qrCode) {
    this.qrCode = await generateReceiptQrCode(this.receiptNo);
  }
  next();
});

moneyReceiptSchema.index({
  receiptNo: "text",
  clientName: "text",
  clientPhone: "text",
  passportNumber: "text",
  purpose: "text",
});

export const MoneyReceiptModel = models.MoneyReceipt || model("MoneyReceipt", moneyReceiptSchema);
export default MoneyReceiptModel;

