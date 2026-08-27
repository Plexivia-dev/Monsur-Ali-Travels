import mongoose, { Schema, model } from "mongoose";
import { generateDid } from "../utils/generateDid.js";
import crypto from "crypto";
import QRCode from "qrcode";

const { models } = mongoose;

/**
 * Generates unique voucher number: MAT-KV-YYYYMM + 4-digit hex
 * Example: MAT-KV-26081A2F
 */
export function generateVoucherNo() {
  const date = new Date();
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const hex = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `MAT-KV-${yy}${mm}${hex}`;
}

/**
 * Generates QR text as a verification URL:
 * https://monsuralitravels.com/cash-voucher?q=MAT-KV-26081A2F
 */
export function generateVoucherQrUrl(voucherNo) {
  return `https://monsuralitravels.com/cash-voucher?q=${encodeURIComponent(voucherNo)}`;
}

/**
 * Generates base64 QR Code Data URL from the verification URL
 */
export async function generateVoucherQrCode(voucherNo) {
  try {
    const url = generateVoucherQrUrl(voucherNo);
    return await QRCode.toDataURL(url, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 256,
      color: { dark: "#000000", light: "#ffffff" },
    });
  } catch (err) {
    console.error("Error generating cash voucher QR code:", err);
    return "";
  }
}

// Single line-item in the expense table
const lineItemSchema = new Schema(
  {
    slNo: { type: Number, default: 1 },
    descriptionBn: { type: String, default: "" },   // Expense Description
    descriptionEn: { type: String, default: "" },   // Description of Expense (English)
    amount: { type: Number, default: 0 },
  },
  { _id: false }
);

const cashVoucherSchema = new Schema(
  {
    // Unique document identifier
    did: {
      type: String,
      default: () => generateDid(),
      unique: true,
      index: true,
    },

    // Human-readable voucher number
    voucherNo: {
      type: String,
      unique: true,
      index: true,
      default: generateVoucherNo,
    },

    // QR Code (base64 data URL of verification link)
    qrCode: {
      type: String,
      default: "",
    },

    // Voucher date
    voucherDate: {
      type: String,
      default: () => new Date().toLocaleDateString("en-GB"), // DD/MM/YYYY
    },

    // Prepared by / received by
    preparedBy: { type: String, default: "" },
    preparedByRole: { type: String, default: "" },
    receivedBy: { type: String, default: "" },
    accountsSignature: { type: String, default: "" },
    accountsDesignation: { type: String, default: "" },

    // Expense line items
    items: {
      type: [lineItemSchema],
      default: [],
    },

    // Totals
    subtotal: { type: Number, default: 0 },
    taxVat: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    grandTotalInWordsEn: { type: String, default: "" },
    grandTotalInWordsBn: { type: String, default: "" },

    // Status
    status: {
      type: String,
      enum: ["draft", "confirmed", "cancelled"],
      default: "confirmed",
      index: true,
    },

    // Metadata
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    createdByName: { type: String, default: "" },
    notes: { type: String, default: "" },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Pre-save hook: generate voucherNo and QR code
cashVoucherSchema.pre("save", async function (next) {
  if (!this.voucherNo) {
    this.voucherNo = generateVoucherNo();
  }
  if (!this.qrCode) {
    this.qrCode = await generateVoucherQrCode(this.voucherNo);
  }
  next();
});

cashVoucherSchema.index({ voucherNo: "text", preparedBy: "text" });

export const CashVoucherModel = models.CashVoucher || model("CashVoucher", cashVoucherSchema);
export default CashVoucherModel;
