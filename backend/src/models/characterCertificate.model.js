import mongoose, { Schema, model } from "mongoose";
import { generateDid } from "../utils/generateDid.js";

const { models } = mongoose;

// Generates unique Certificate ID: 3 uppercase letters + 5 digits (e.g. "CC-XYZ84920")
export function generateUniqueCharacterCertificateNo() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let alpha = "";
  for (let i = 0; i < 3; i++) {
    alpha += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `CC-${alpha}${randomNum}`;
}

const characterCertificateSchema = new Schema(
  {
    did: {
      type: String,
      default: () => generateDid(),
      unique: true,
      index: true,
    },
    certificateNo: {
      type: String,
      trim: true,
      unique: true,
      default: generateUniqueCharacterCertificateNo,
    },
    memoNo: {
      type: String,
      default: "",
      trim: true,
    },
    issueDate: {
      type: String,
      default: () => new Date().toISOString().split("T")[0],
    },
    language: {
      type: String,
      enum: ["en", "bn"],
      default: "en",
    },
    certificateTitle: {
      type: String,
      default: "CHARACTER CERTIFICATE",
    },
    certificateSubtitle: {
      type: String,
      default: "Character Certificate & Testimonial",
    },

    // Issuing Authority / Organization
    authority: {
      organizationName: { type: String, default: "" },
      organizationSubtitle: { type: String, default: "" },
      officeAddress: { type: String, default: "" },
      phone: { type: String, default: "" },
      email: { type: String, default: "" },
      logoUrl: { type: String, default: "" },
    },

    // Client / Candidate Details
    client: {
      fullName: { type: String, required: true, trim: true },
      phone: { type: String, default: "" },
      fatherName: { type: String, default: "" },
      motherName: { type: String, default: "" },
      passportNo: { type: String, default: "" },
      nidNo: { type: String, default: "" },
      birthDate: { type: String, default: "" },
      gender: { type: String, default: "Male" },
      maritalStatus: { type: String, default: "" },
      presentAddress: { type: String, default: "" },
      permanentAddress: { type: String, default: "" },
    },

    // Certification Statement
    conduct: {
      knownYears: { type: String, default: "" },
      statement: { type: String, default: "" },
      characterPraise: { type: String, default: "" },
      recommendation: { type: String, default: "" },
    },

    // Signatory
    signatory: {
      name: { type: String, default: "" },
      designation: { type: String, default: "" },
      phone: { type: String, default: "" },
      sealText: { type: String, default: "" },
    },

    clientDid: {
      type: String,
      default: null,
      index: true,
    },
    linkedCaseId: {
      type: String,
      default: null,
    },
    linkedCaseDid: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

characterCertificateSchema.index({
  certificateNo: "text",
  memoNo: "text",
  "client.fullName": "text",
  "client.phone": "text",
  "client.passportNo": "text",
  "client.nidNo": "text",
});

export const CharacterCertificateModel =
  models.CharacterCertificate || model("CharacterCertificate", characterCertificateSchema);
export default CharacterCertificateModel;
