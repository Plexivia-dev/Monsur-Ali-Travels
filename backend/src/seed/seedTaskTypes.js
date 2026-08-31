import TaskTypeModel from "../models/taskType.model.js";
import { generateDid } from "../utils/generateDid.js";

export const DEFAULT_TASK_TYPES = [
  {
    name: "Passport Bio-Page & Scan",
    category: "DOCUMENT_UPLOAD",
    requiresDocument: true,
    defaultDocumentType: "passport",
    description: "Clear color scan or softcopy of applicant's valid passport bio-page.",
    isSystemDefault: true,
    sortOrder: 1,
  },
  {
    name: "National ID (NID) Copy",
    category: "DOCUMENT_UPLOAD",
    requiresDocument: true,
    defaultDocumentType: "nid",
    description: "High-resolution front and back copy of National ID card.",
    isSystemDefault: true,
    sortOrder: 2,
  },
  {
    name: "Photo 2x2 (White Background)",
    category: "DOCUMENT_UPLOAD",
    requiresDocument: true,
    defaultDocumentType: "photo",
    description: "Standard 2x2 lab print / softcopy studio photograph with white background.",
    isSystemDefault: true,
    sortOrder: 3,
  },
  {
    name: "Employment Agreement & Signatures",
    category: "LEGAL",
    requiresDocument: true,
    defaultDocumentType: "agreement",
    description: "Executed bilateral overseas employment agreement contract signed by applicant & guarantor.",
    isSystemDefault: true,
    sortOrder: 4,
  },
  {
    name: "Police Clearance Certificate (PCC)",
    category: "DOCUMENT_UPLOAD",
    requiresDocument: true,
    defaultDocumentType: "police-clearance",
    description: "Verified police verification certificate issued by authorized government authority.",
    isSystemDefault: true,
    sortOrder: 5,
  },
  {
    name: "Medical Fitness Report",
    category: "DOCUMENT_UPLOAD",
    requiresDocument: true,
    defaultDocumentType: "medical",
    description: "Medical screening, pathology tests, and fitness clearance report.",
    isSystemDefault: true,
    sortOrder: 6,
  },
  {
    name: "Bank Statement & Solvency Certificate",
    category: "FINANCIAL",
    requiresDocument: true,
    defaultDocumentType: "bank-solvency",
    description: "Official 6-month authenticated bank statement and solvency certificate.",
    isSystemDefault: true,
    sortOrder: 7,
  },
  {
    name: "Electricity / Utility Bill Copy",
    category: "DOCUMENT_UPLOAD",
    requiresDocument: true,
    defaultDocumentType: "utility-bill",
    description: "Recent residential electricity or utility bill for address verification.",
    isSystemDefault: true,
    sortOrder: 8,
  },
  {
    name: "Land / Property Asset Documents",
    category: "FINANCIAL",
    requiresDocument: true,
    defaultDocumentType: "land-doc",
    description: "Land ownership deed or property asset valuation statement.",
    isSystemDefault: true,
    sortOrder: 9,
  },
  {
    name: "Client Bio-Data & Guardian Form",
    category: "LEGAL",
    requiresDocument: true,
    defaultDocumentType: "client-form",
    description: "Completed client bio-data form with guardian guarantor declaration.",
    isSystemDefault: true,
    sortOrder: 10,
  },
  {
    name: "Indian Visa / IVAC Application Slip",
    category: "EMBASSY_PROCESS",
    requiresDocument: true,
    defaultDocumentType: "indian-visa",
    description: "IVAC appointment docket and visa submission acknowledgement slip.",
    isSystemDefault: true,
    sortOrder: 11,
  },
  {
    name: "Client Consultation & Follow-up Call",
    category: "GENERAL_ACTION",
    requiresDocument: false,
    defaultDocumentType: "",
    description: "Direct phone call, paper reminder, or case update discussion with client.",
    isSystemDefault: true,
    sortOrder: 12,
  },
  {
    name: "Offer Letter Verification & Scrutiny",
    category: "VERIFICATION",
    requiresDocument: false,
    defaultDocumentType: "",
    description: "Internal verification and authenticity check of received overseas job offer letter.",
    isSystemDefault: true,
    sortOrder: 13,
  },
  {
    name: "VFS / Embassy Appointment Booking",
    category: "EMBASSY_PROCESS",
    requiresDocument: false,
    defaultDocumentType: "",
    description: "Booking and scheduling of official biometric / submission appointment slot.",
    isSystemDefault: true,
    sortOrder: 14,
  },
  {
    name: "General Operational Action",
    category: "GENERAL_ACTION",
    requiresDocument: false,
    defaultDocumentType: "",
    description: "General administrative, courier, or case file processing step.",
    isSystemDefault: true,
    sortOrder: 15,
  },
];

export async function seedTaskTypesIfEmpty() {
  try {
    const count = await TaskTypeModel.countDocuments();
    if (count === 0) {
      console.log("[Seed] Seeding default task types into database...");
      for (const item of DEFAULT_TASK_TYPES) {
        await TaskTypeModel.create({
          ...item,
          did: generateDid(),
          isActive: true,
        });
      }
      console.log(`[Seed] Successfully seeded ${DEFAULT_TASK_TYPES.length} default task types.`);
    }
  } catch (err) {
    console.warn("[Seed] seedTaskTypesIfEmpty notice:", err.message);
  }
}
