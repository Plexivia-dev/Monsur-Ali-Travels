import mongoose, { Schema, model } from "mongoose";

const { models } = mongoose;

const pipelineStepSchema = new Schema(
  {
    id: { type: Number, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    status: { type: String, enum: ["completed", "in_progress", "pending", "blocked"], default: "pending" },
    targetDays: { type: Number, default: 7 },
    primaryWorkflow: { type: String, default: "destination_agency" },
    description: { type: String, default: "" },
    checklist: [
      {
        id: { type: String },
        text: { type: String },
        completed: { type: Boolean, default: false },
      },
    ],
    milestoneNotes: { type: String, default: "" },
  },
  { _id: false }
);

const documentItemSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, default: "other" },
    fileName: { type: String, default: "" },
    fileSize: { type: String, default: "0 KB" },
    uploadedAt: { type: String, default: "" },
    status: { type: String, enum: ["verified", "pending_review", "missing", "rejected"], default: "pending_review" },
    downloadUrl: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { _id: false }
);

const candidateCaseFileSchema = new Schema(
  {
    fileNumber: { type: String, required: true, unique: true, index: true },
    candidateName: { type: String, required: true, trim: true },
    candidateAge: { type: Number, default: 25 },
    candidateGender: { type: String, enum: ["Male", "Female", "Other"], default: "Male" },
    candidatePhone: { type: String, trim: true, default: "" },
    candidateEmail: { type: String, trim: true, lowercase: true, default: "" },
    passportNumber: { type: String, required: true, trim: true, index: true },
    passportExpiry: { type: String, trim: true, default: "" },
    tradeSkill: { type: String, required: true, trim: true },
    experienceYears: { type: Number, default: 3 },
    destinationCountry: { type: String, required: true, trim: true },
    destinationCountryCode: { type: String, trim: true, default: "SA" },
    destinationCity: { type: String, trim: true, default: "Riyadh" },
    workflowType: {
      type: String,
      enum: ["direct_client", "destination_partner", "outsourced_local"],
      default: "destination_partner",
    },
    client: {
      name: { type: String, default: "" },
      company: { type: String, default: "" },
      country: { type: String, default: "" },
      city: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      contractRef: { type: String, default: "" },
    },
    destinationAgency: {
      agencyName: { type: String, default: "" },
      country: { type: String, default: "" },
      licenseNo: { type: String, default: "" },
      contactPerson: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      airportReceptionCity: { type: String, default: "" },
    },
    localAgency: {
      isOutsourced: { type: Boolean, default: false },
      subAgencyName: { type: String, default: "" },
      licenseNo: { type: String, default: "" },
      contactPerson: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      commissionAgreement: { type: String, default: "" },
    },
    currentStepId: { type: Number, default: 1 },
    steps: { type: [pipelineStepSchema], default: [] },
    documents: { type: [documentItemSchema], default: [] },
    casePriority: { type: String, enum: ["normal", "high", "urgent"], default: "normal" },
    expectedDeploymentDate: { type: String, default: "" },
    internalNotes: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const CandidateCaseFileModel =
  models.CandidateCaseFile || model("CandidateCaseFile", candidateCaseFileSchema);
