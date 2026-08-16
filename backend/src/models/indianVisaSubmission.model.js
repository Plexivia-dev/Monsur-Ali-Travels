import mongoose from "mongoose";

// Generates unique Indian Visa Application Tracking Number: IVISA- + 2 letters + 4 digits + 1 middle letter + 3 digits (e.g. "IVISA-AB4829K513")
export function generateUniqueIndianVisaTrackingNo() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const getChar = () => letters.charAt(Math.floor(Math.random() * letters.length));
  const getDigits = (len) => {
    let res = "";
    for (let i = 0; i < len; i++) res += Math.floor(Math.random() * 10);
    return res;
  };

  const prefixLetters = getChar() + getChar();
  const firstDigits = getDigits(4);
  const midLetter = getChar();
  const lastDigits = getDigits(3);

  return `IVISA-${prefixLetters}${firstDigits}${midLetter}${lastDigits}`;
}

const indianVisaSubmissionSchema = new mongoose.Schema(
  {
    trackingNo: {
      type: String,
      trim: true,
      default: generateUniqueIndianVisaTrackingNo,
    },
    submissionDate: { type: String, default: "" },

    // Agency Header Info
    agencyInfo: {
      name: { type: String, default: "MANSUR ALI TOURS & TRAVELS" },
      address: { type: String, default: "Nadampur, Jagannathpur, Sunamganj - 3060, Sylhet, Bangladesh" },
      phone: { type: String, default: "+8801345579534" },
      email: { type: String, default: "monsuralitravels@gmail.com" },
      licenseNo: { type: String, default: "RL-1842" },
    },

    // Applicant Details
    applicantName: {
      type: String,
      required: [true, "Applicant full name is required"],
      trim: true,
    },
    passportNo: {
      type: String,
      required: [true, "Passport number is required"],
      trim: true,
    },
    nidBirthCertNo: { type: String, default: "" },
    applicantPhone: { type: String, default: "" },
    applicantEmail: { type: String, default: "" },
    address: { type: String, default: "" },

    // Visa Specifications
    visaType: {
      type: String,
      default: "ট্যুরিস্ট ভিসা (Tourist Visa)",
    },
    entryPort: {
      type: String,
      default: "হরিদাসপুর / গেদে (Haridaspur / Gede)",
    },
    durationMonths: {
      type: String,
      default: "১ বছর (1 Year Multiple)",
    },
    entryType: {
      type: String,
      default: "মাল্টিপল এন্ট্রি (Multiple Entry)",
    },

    // Documents Provided Checklist
    documentsProvided: {
      passportOriginal: { type: Boolean, default: true },
      nidCopy: { type: Boolean, default: true },
      photoLabPrint: { type: Boolean, default: true },
      bankSolvency: { type: Boolean, default: false },
      utilityBillCopy: { type: Boolean, default: true },
      previousVisaCopy: { type: Boolean, default: false },
      nocTradeLicense: { type: Boolean, default: false },
    },

    remarks: { type: String, default: "" },

    status: {
      type: String,
      enum: ["pending", "processing", "submitted", "delivered"],
      default: "pending",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to ensure trackingNo is generated if not provided
indianVisaSubmissionSchema.pre("save", function (next) {
  if (!this.trackingNo) {
    this.trackingNo = generateUniqueIndianVisaTrackingNo();
  }
  next();
});

export const IndianVisaSubmissionModel =
  mongoose.models.IndianVisaSubmission ||
  mongoose.model("IndianVisaSubmission", indianVisaSubmissionSchema);
