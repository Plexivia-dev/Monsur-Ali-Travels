import mongoose, { Schema, model } from "mongoose";
import { generateDid } from "../utils/generateDid.js";

const { models } = mongoose;

const documentVaultSchema = new Schema(
  {
    did: {
      type: String,
      default: () => generateDid(),
      unique: true,
      index: true,
    },
    clientDid: {
      type: String,
      required: [true, "Client DID reference is required"],
      index: true,
    },
    caseDid: {
      type: String,
      default: null,
      index: true,
    },
    documentName: {
      type: String,
      required: [true, "Document name is required"],
      trim: true,
    },
    fileName: {
      type: String,
      default: "",
    },
    fileUrl: {
      type: String,
      required: [true, "File URL is required"],
    },
    fileType: {
      type: String,
      default: "application/octet-stream",
    },
    fileSize: {
      type: String,
      default: "0 B",
    },
    accessLevel: {
      type: String,
      enum: ["Public", "Restricted", "Internal_Only"],
      default: "Restricted",
    },
    uploadedByDid: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual Relation: Fetch client info via clientDid -> did
documentVaultSchema.virtual("clientInfo", {
  ref: "Client",
  localField: "clientDid",
  foreignField: "did",
  justOne: true,
});

export const DocumentVaultModel = models.DocumentVault || model("DocumentVault", documentVaultSchema);
export default DocumentVaultModel;
