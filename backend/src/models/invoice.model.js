import mongoose from "mongoose";
import { generateDid } from "../utils/generateDid.js";

// Generates unique Invoice Number starting strictly with "I-": I- + 2 letters + 4 digits + 1 middle letter + 3 digits (e.g. "I-AB4829K513")
export function generateUniqueInvoiceNo() {
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

  return `I-${prefixLetters}${firstDigits}${midLetter}${lastDigits}`;
}

const invoiceItemSchema = new mongoose.Schema({
  id: String,
  title: { type: String, default: "" },
  description: { type: String, default: "" },
  quantity: { type: Number, default: null },
  unitPrice: { type: Number, default: 0 },
});

const invoiceSchema = new mongoose.Schema(
  {
    did: {
      type: String,
      default: () => generateDid(),
      unique: true,
      index: true,
    },
    invoiceNo: {
      type: String,
      trim: true,
      default: generateUniqueInvoiceNo,
    },
    issueDate: { type: String, default: "" },
    dueDate: { type: String, default: "" },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Pending", "Overdue"],
      default: "Paid",
    },
    currency: { type: String, default: "BDT" },
    taxRate: { type: Number, default: 0 },

    biller: {
      name: { type: String, default: "MONSUR ALI TOURS & TRAVELS" },
      subtitle: { type: String, default: "Your Trusted Travel Partner" },
      address: { type: String, default: "Nadampur, Jagannathpur, Sunamganj - 3060, Sylhet, Bangladesh" },
      city: { type: String, default: "Sunamganj, Sylhet, Bangladesh" },
      phone: { type: String, default: "+8801345579534" },
      email: { type: String, default: "monsuralitravels@gmail.com" },
      binNo: { type: String, default: "RL-1842" },
    },

    client: {
      name: { type: String, required: true },
      contactPerson: { type: String, default: "" },
      address: { type: String, default: "" },
      phone: { type: String, default: "" },
      email: { type: String, default: "" },
    },

    items: [invoiceItemSchema],

    paymentTerms: { type: String, default: "" },
    subtotal: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: "invoices",
  }
);

invoiceSchema.pre("save", function (next) {
  if (!this.invoiceNo) {
    this.invoiceNo = generateUniqueInvoiceNo();
  }
  next();
});

export const InvoiceModel = mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);
