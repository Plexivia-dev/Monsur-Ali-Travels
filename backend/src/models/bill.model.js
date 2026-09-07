import mongoose, { Schema, model } from "mongoose";
import { generateDid } from "../utils/generateDid.js";
import crypto from "crypto";

const { models } = mongoose;

/**
 * Generates unique company bill voucher number:
 * Example: BILL-2609A1F4
 */
export function generateBillNumber() {
  const date = new Date();
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const hex = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `BILL-${yy}${mm}${hex}`;
}

const billSchema = new Schema(
  {
    did: {
      type: String,
      default: () => generateDid(),
      unique: true,
      index: true,
    },
    billNumber: {
      type: String,
      unique: true,
      index: true,
      default: generateBillNumber,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      default: "Other Office Expense",
      enum: [
        "Employee Salary",
        "Office Rent",
        "Electricity / Utility",
        "Internet & Phone",
        "Office Supplies & Stationery",
        "Tea & Refreshments",
        "Vendor & Supplier Payment",
        "Travel & Transportation",
        "Legal & Trade Fees",
        "Visa Operations",
        "Maintenance & Repairs",
        "Other Office Expense",
      ],
    },
    payee: {
      type: String,
      required: true,
      trim: true,
    },
    payeePhone: {
      type: String,
      trim: true,
      default: "",
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    dueAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    billDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Unpaid", "Partial"],
      default: "Paid",
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Bank Transfer", "bKash", "Nagad", "Cheque", "Other"],
      default: "Cash",
    },
    bankAccount: {
      type: String,
      default: "",
    },
    documentUrl: {
      type: String,
      default: "",
    },
    documentName: {
      type: String,
      default: "",
    },
    documentSize: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
    paymentHistory: [
      {
        amount: { type: Number, required: true },
        paymentMethod: { type: String, default: "Cash" },
        bankAccount: { type: String, default: "" },
        paidDate: { type: Date, default: Date.now },
        notes: { type: String, default: "" },
        recordedBy: { type: String, default: "" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    createdByDid: {
      type: String,
      default: "",
    },
    createdByName: {
      type: String,
      default: "Accounts Officer",
    },
  },
  {
    timestamps: true,
  }
);

// Auto-calculate paidAmount and dueAmount before saving
billSchema.pre("save", function (next) {
  const tot = Number(this.amount) || 0;
  if (this.paymentStatus === "Paid") {
    this.paidAmount = tot;
    this.dueAmount = 0;
  } else if (this.paymentStatus === "Unpaid") {
    this.paidAmount = 0;
    this.dueAmount = tot;
  } else if (this.paymentStatus === "Partial") {
    const paid = Number(this.paidAmount) || 0;
    this.dueAmount = Math.max(0, tot - paid);
    if (this.dueAmount === 0 && tot > 0) {
      this.paymentStatus = "Paid";
    }
  }
  next();
});

export const BillModel = models.Bill || model("Bill", billSchema);
export default BillModel;
