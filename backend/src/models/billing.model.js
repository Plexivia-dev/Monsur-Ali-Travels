import mongoose, { Schema, model } from "mongoose";
import { generateDid } from "../utils/generateDid.js";

const billingSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: false, index: true },
    memberId: { type: Schema.Types.ObjectId, ref: "Member", required: false, index: true },
    did: { type: String, default: () => generateDid(), unique: true, index: true },
    billType: {
      type: String,
      enum: ["supplier_bill", "client_invoice", "service", "raw_material", "placement", "general"],
      default: "general",
    },
    invoiceNumber: { type: String, trim: true, default: "" },
    clientName: { type: String, trim: true, default: "" },
    category: { type: String, trim: true, default: "" },
    billingMethod: { type: String, required: true, trim: true, default: "Cash" },
    billingPhone: { type: String, trim: true, default: "" },
    billingEmail: { type: String, trim: true, lowercase: true, default: "" },
    billingDate: { type: Date, default: () => new Date() },
    dueDate: { type: Date },
    items: {
      type: [
        new Schema(
          {
            title: { type: String, required: true, trim: true },
            quantity: { type: Number, required: true, min: 1, default: 1 },
            unitPrice: { type: Number, required: true, min: 0, default: 0 },
            amount: { type: Number, required: true, min: 0, default: 0 },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
    totalAmount: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, required: true, min: 0, default: 0 },
    pendingAmount: { type: Number, required: true, min: 0, default: 0 },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      required: true,
      enum: ["paid", "partial", "pending", "failed"],
      default: "pending",
    },
    notes: { type: String, trim: true, default: "" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id?.toString();
        delete ret._id;
        return ret;
      },
    },
  }
);

export const BillingModel = mongoose.models.Billing || model("Billing", billingSchema);
