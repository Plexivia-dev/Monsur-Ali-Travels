import mongoose, { Schema, model } from "mongoose";
import { generateDid } from "../utils/generateDid.js";

const paymentSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: false, index: true },
    billingId: { type: Schema.Types.ObjectId, ref: "Billing", required: false, index: true },
    memberId: { type: Schema.Types.ObjectId, ref: "Member", required: false, index: true },
    did: { type: String, default: () => generateDid(), unique: true, index: true },
    paymentType: {
      type: String,
      enum: ["order", "billing", "payout", "salary", "advance", "supplier_bill", "general"],
      default: "general",
    },
    paymentMethod: { type: String, required: true, trim: true },
    paymentPhone: { type: String, trim: true, default: "" },
    transactionRef: { type: String, trim: true, default: "" },
    notes: { type: String, trim: true, default: "" },
    totalAmount: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, required: true, min: 0 },
    pendingAmount: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      required: true,
      enum: ["paid", "partial", "pending", "failed", "n-a"],
      default: "pending",
    },
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

export const PaymentModel = mongoose.models.Payment || model("Payment", paymentSchema);
