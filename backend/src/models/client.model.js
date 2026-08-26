import mongoose, { Schema, model } from "mongoose";
import { generateDid } from "../utils/generateDid.js";

// Ensure all referenced models are registered in Mongoose for virtual populate
import "./clientGuardianApplication.model.js";
import "./indianVisaSubmission.model.js";
import "./passportSubmission.model.js";
import "./clientCaseFile.model.js";
import "./employmentAgreement.model.js";
import "./invoice.model.js";
import "./caseFile.model.js";
import "./user.model.js";

const { models } = mongoose;

// Unique Client Reference Number Generator: MAT-CLNT- + 6 digits
export function generateClientCode() {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `CLNT-${num}`;
}

const clientSchema = new Schema(
  {
    did: {
      type: String,
      default: () => generateDid(),
      unique: true,
      index: true,
    },
    clientCode: {
      type: String,
      unique: true,
      index: true,
      default: generateClientCode,
    },
    // Primary Bio Info
    fullName: {
      type: String,
      required: [true, "Client full name is required"],
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
      relationship: { type: String, default: "Father" },
      phone: { type: String, default: "", trim: true },
      nidNumber: { type: String, default: "", trim: true },
      fatherName: { type: String, default: "" },
      motherName: { type: String, default: "" },
      email: { type: String, default: "" },
      address: { type: String, default: "" },
    },

    // Permanent Attachments Repository for this client
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

    // Dynamic Relations (Reference DIDs of all applications linked with this client)
    applicationDids: { type: [String], default: [] },
    visaSubmissionDids: { type: [String], default: [] },
    passportSubmissionDids: { type: [String], default: [] },
    clientCaseDids: { type: [String], default: [] },
    agreementDids: { type: [String], default: [] },
    invoiceDids: { type: [String], default: [] },
    caseDids: { type: [String], default: [] },

    // Client Status & Notes
    status: {
      type: String,
      enum: ["Active", "Lead", "Inactive", "Blacklisted", "Archived"],
      default: "Active",
    },
    clientType: {
      type: String,
      enum: ["Individual", "Corporate", "Agent_Referred", "VIP"],
      default: "Individual",
    },
    totalBilledAmount: { type: Number, default: 0 },
    totalPaidAmount: { type: Number, default: 0 },
    totalDueAmount: { type: Number, default: 0 },
    remarks: { type: String, default: "" },
    
    isActive: { type: Boolean, default: true },
    createdByDid: { type: String, default: null },
    updatedByDid: { type: String, default: null },
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

// Search Index for Quick Lookups across Name, Phone, Passport, NID
clientSchema.index({
  fullName: "text",
  phone: "text",
  passportNumber: "text",
  nidNumber: "text",
  clientCode: "text",
});

// Virtual Populates for Client relations using DIDs
clientSchema.virtual("applications", {
  ref: "ClientGuardianApplication",
  localField: "applicationDids",
  foreignField: "did",
});
clientSchema.virtual("visaSubmissions", {
  ref: "IndianVisaSubmission",
  localField: "visaSubmissionDids",
  foreignField: "did",
});
clientSchema.virtual("passportSubmissions", {
  ref: "PassportSubmission",
  localField: "passportSubmissionDids",
  foreignField: "did",
});
clientSchema.virtual("clientCases", {
  ref: "ClientCaseFile",
  localField: "clientCaseDids",
  foreignField: "did",
});
clientSchema.virtual("agreements", {
  ref: "EmploymentAgreement",
  localField: "agreementDids",
  foreignField: "did",
});
clientSchema.virtual("invoices", {
  ref: "Invoice",
  localField: "invoiceDids",
  foreignField: "did",
});
clientSchema.virtual("cases", {
  ref: "CaseFile",
  localField: "caseDids",
  foreignField: "did",
});
clientSchema.virtual("createdBy", {
  ref: "User",
  localField: "createdByDid",
  foreignField: "did",
  justOne: true,
});
clientSchema.virtual("updatedBy", {
  ref: "User",
  localField: "updatedByDid",
  foreignField: "did",
  justOne: true,
});

const Client = models.Client || model("Client", clientSchema);
export default Client;
