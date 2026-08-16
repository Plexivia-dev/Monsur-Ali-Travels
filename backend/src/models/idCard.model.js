import mongoose from "mongoose";

const idCardSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      default: "Officer",
      trim: true,
    },
    idNumber: {
      type: String,
      default: "",
      trim: true,
    },
    joiningDate: {
      type: String,
      default: "",
    },
    bloodGroup: {
      type: String,
      default: "",
    },
    contactPhone: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    website: {
      type: String,
      default: "www.monsuralitravels.com",
    },
    signatureName: {
      type: String,
      default: "M. Ali",
    },
    signatureTitle: {
      type: String,
      default: "Managing Director",
    },
    photo: {
      type: String, // base64 or URL
      default: null,
    },
    qrData: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

idCardSchema.index({ fullName: 1, idNumber: 1 });

export const IdCardModel = mongoose.models.IdCard || mongoose.model("IdCard", idCardSchema);
