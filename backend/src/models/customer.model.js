import mongoose, { Schema, model } from "mongoose";
import { generateDid } from "../utils/generateDid.js";

const { models } = mongoose;

// Unique Customer Reference Number Generator: MAT-CUST- + 6 digits
export function generateCustomerCode() {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `CUST-${num}`;
}

const customerSchema = new Schema(
  {
    did: {
      type: String,
      default: () => generateDid(),
      unique: true,
      index: true,
    },
    customerCode: {
      type: String,
      unique: true,
      index: true,
      default: generateCustomerCode,
    },
    // Primary Bio Info
    fullName: {
      type: String,
      required: [true, "Customer full name is required"],
      trim: true,
      index: true,
    },
    nidNumber: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    passportNumber: {
      type: String,
      trim: true,
      default: "",
      index: true,
      uppercase: true,
    },
    passportExpiryDate: { type: String, default: "" },
    birthDate: { type: String, default: "" },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Male",
    },
    bloodGroup: { type: String, default: "" },
    maritalStatus: { type: String, default: "" },

    // Contact Info
    phone: {
      type: String,
      trim: true,
      required: [true, "Phone number is required"],
      index: true,
    },
    altPhone: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, lowercase: true, default: "" },
    
    // Address Info
    presentAddress: { type: String, default: "" },
    permanentAddress: { type: String, default: "" },
    district: { type: String, default: "" },
    policeStation: { type: String, default: "" },
    postCode: { type: String, default: "" },

    // Family / Parents Info
    fatherName: { type: String, default: "", trim: true },
    motherName: { type: String, default: "", trim: true },
    spouseName: { type: String, default: "", trim: true },

    // Primary Guardian Info
    guardian: {
      name: { type: String, default: "", trim: true },
      relationship: { type: String, default: "Father (পিতা)" },
      phone: { type: String, default: "", trim: true },
      nidNumber: { type: String, default: "", trim: true },
      fatherName: { type: String, default: "" },
      motherName: { type: String, default: "" },
      email: { type: String, default: "" },
      address: { type: String, default: "" },
    },

    // Permanent Attachments Repository for this customer
    attachments: {
      photo: { type: String, default: "" }, // 2x2 photo URL / Base64
      passportScan: { type: String, default: "" },
      nidScan: { type: String, default: "" },
      birthCertScan: { type: String, default: "" },
      otherDocuments: [
        {
          name: { type: String, default: "" },
          fileType: { type: String, default: "" },
          fileUrl: { type: String, default: "" },
          uploadedAt: { type: Date, default: Date.now },
        },
      ],
    },

    // Dynamic Relations (Reference ObjectIds of all applications linked with this customer)
    applications: [
      {
        type: Schema.Types.ObjectId,
        ref: "CustomerGuardianApplication",
      },
    ],
    visaSubmissions: [
      {
        type: Schema.Types.ObjectId,
        ref: "IndianVisaSubmission",
      },
    ],
    passportSubmissions: [
      {
        type: Schema.Types.ObjectId,
        ref: "PassportSubmission",
      },
    ],
    candidateCases: [
      {
        type: Schema.Types.ObjectId,
        ref: "CandidateCaseFile",
      },
    ],
    agreements: [
      {
        type: Schema.Types.ObjectId,
        ref: "EmploymentAgreement",
      },
    ],
    invoices: [
      {
        type: Schema.Types.ObjectId,
        ref: "Invoice",
      },
    ],

    // Customer Status & Notes
    status: {
      type: String,
      enum: ["Active", "Lead", "Inactive", "Blacklisted", "Archived"],
      default: "Active",
    },
    customerType: {
      type: String,
      enum: ["Individual", "Corporate", "Agent_Referred", "VIP"],
      default: "Individual",
    },
    totalBilledAmount: { type: Number, default: 0 },
    totalPaidAmount: { type: Number, default: 0 },
    totalDueAmount: { type: Number, default: 0 },
    remarks: { type: String, default: "" },
    
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Search Index for Quick Lookups across Name, Phone, Passport, NID
customerSchema.index({
  fullName: "text",
  phone: "text",
  passportNumber: "text",
  nidNumber: "text",
  customerCode: "text",
});

const Customer = models.Customer || model("Customer", customerSchema);
export default Customer;
