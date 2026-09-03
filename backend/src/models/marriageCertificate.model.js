import mongoose, { Schema, model } from "mongoose";
import { generateDid } from "../utils/generateDid.js";

const { models } = mongoose;

// Generates unique Certificate ID: 3 uppercase letters + 5 digits (e.g. "MC-XYZ84920")
export function generateUniqueMarriageCertificateNo() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let alpha = "";
  for (let i = 0; i < 3; i++) {
    alpha += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `MC-${alpha}${randomNum}`;
}

const marriageCertificateSchema = new Schema(
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
      default: generateUniqueMarriageCertificateNo,
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
    marriageDate: {
      type: String,
      default: "",
    },
    marriagePlace: {
      type: String,
      default: "",
    },
    volumeNo: {
      type: String,
      default: "",
    },
    pageNo: {
      type: String,
      default: "",
    },
    certificateTitle: {
      type: String,
      default: "MARRIAGE CERTIFICATE",
    },
    certificateSubtitle: {
      type: String,
      default: "OFFICIAL MARITAL STATUS & NIKAHNAMA EXTRACT",
    },

    // Issuing Authority / Registrar / Kazi Office
    registrar: {
      officeName: { type: String, default: "OFFICE OF THE MUSLIM MARRIAGE REGISTRAR & KAZI" },
      officeSubtitle: { type: String, default: "Government of the People's Republic of Bangladesh" },
      jurisdiction: { type: String, default: "" },
      officeAddress: { type: String, default: "" },
      phone: { type: String, default: "" },
      email: { type: String, default: "" },
      govLicenseNo: { type: String, default: "" },
      kaziName: { type: String, default: "" },
    },

    // Groom Details
    groom: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, default: "" },
      fatherName: { type: String, default: "" },
      motherName: { type: String, default: "" },
      passportNo: { type: String, default: "" },
      nidNo: { type: String, default: "" },
      birthDate: { type: String, default: "" },
      maritalStatusPrior: { type: String, default: "Unmarried" },
      religion: { type: String, default: "Islam" },
      address: { type: String, default: "" },
    },

    // Bride Details
    bride: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, default: "" },
      fatherName: { type: String, default: "" },
      motherName: { type: String, default: "" },
      passportNo: { type: String, default: "" },
      nidNo: { type: String, default: "" },
      birthDate: { type: String, default: "" },
      maritalStatusPrior: { type: String, default: "Unmarried" },
      religion: { type: String, default: "Islam" },
      address: { type: String, default: "" },
    },

    // Dower & Witnesses
    marriageTerms: {
      dowerAmount: { type: String, default: "" },
      dowerAmountInWords: { type: String, default: "" },
      dowerPaid: { type: String, default: "" },
      dowerDeferred: { type: String, default: "" },
      witness1: { type: String, default: "" },
      witness2: { type: String, default: "" },
      wakilName: { type: String, default: "" },
    },

    // Official Statement
    declaration: {
      statement: {
        type: String,
        default:
          "This is to solemnly certify that the marriage between the above-named Groom and Bride was duly solemnized according to Muslim Sharia Law and registered under the Muslim Marriages and Divorces (Registration) Act, 1974.",
      },
      livingStatus: {
        type: String,
        default:
          "According to our official register and local verification, they have been living together peacefully as legally wedded husband and wife since the date of their marriage without any legal separation or dispute.",
      },
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

marriageCertificateSchema.index({
  certificateNo: "text",
  memoNo: "text",
  "groom.name": "text",
  "groom.phone": "text",
  "bride.name": "text",
  "bride.phone": "text",
});

export const MarriageCertificateModel =
  models.MarriageCertificate || model("MarriageCertificate", marriageCertificateSchema);
export default MarriageCertificateModel;
