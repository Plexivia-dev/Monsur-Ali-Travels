import mongoose from "mongoose";

// Generates unique Customer Guardian Application Tracking Number: CGA- + 6 digits
export function generateUniqueCustomerAppNo() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const getChar = () => letters.charAt(Math.floor(Math.random() * letters.length));
  const num = Math.floor(100000 + Math.random() * 900000);
  return `CGA-${getChar()}${getChar()}-${num}`;
}

const customerGuardianSchema = new mongoose.Schema(
  {
    applicationNo: {
      type: String,
      trim: true,
      default: generateUniqueCustomerAppNo,
    },
    dateReceived: { type: String, default: "" },
    verifiedBy: { type: String, default: "M. Ali (Manager)" },
    declarationDate: { type: String, default: "" },

    // Service Category
    serviceType: {
      type: String,
      default: "ইন্ডিয়ান ভিসা (Indian Visa)",
    },

    // 1. Customer Details
    customer: {
      fullName: {
        type: String,
        required: [true, "Customer full name is required"],
        trim: true,
      },
      nidNumber: { type: String, default: "", trim: true },
      passportNumber: { type: String, default: "", trim: true },
      countryRejected: { type: String, default: "" },
      fatherName: { type: String, default: "" },
      motherName: { type: String, default: "" },
      mobileNumber: { type: String, default: "", trim: true },
      email: { type: String, default: "", trim: true },
    },

    // 2. Guardian Details
    guardian: {
      fullName: { type: String, default: "", trim: true },
      nidNumber: { type: String, default: "", trim: true },
      fatherName: { type: String, default: "" },
      motherName: { type: String, default: "" },
      mobileNumber: { type: String, default: "", trim: true },
      email: { type: String, default: "", trim: true },
      address: { type: String, default: "" },
      relationship: { type: String, default: "Father (পিতা)" },
    },

    // 3. Requirement Documents Checklist
    requirementDocuments: [
      {
        id: { type: Number },
        name: { type: String, default: "" },
        submitted: { type: String, default: "Yes" },
        remarks: { type: String, default: "" },
      },
    ],

    // 4. Advance Payment Details
    payment: {
      totalAmount: { type: Number, default: 0 },
      advancePaid: { type: Number, default: 0 },
      dueAmount: { type: Number, default: 0 },
      paymentMethod: {
        type: String,
        enum: ["Cash", "bKash", "Nagad", "Rocket", "Bank Transfer", "Other"],
        default: "Cash",
      },
      paymentStatus: {
        type: String,
        enum: ["Paid", "Partial", "Unpaid"],
        default: "Partial",
      },
      paymentDate: { type: String, default: "" },
      receiptNo: { type: String, default: "" },
    },

    // 5. Document Attachments (Passport size photo, Passport scan, NID scan & other files)
    attachments: {
      passportPhoto: { type: String, default: "" }, // 2x2 Passport Size Picture
      passportScan: { type: String, default: "" }, // Main Passport Scan
      nidScan: { type: String, default: "" }, // NID Card Scan
      otherFiles: [
        {
          name: { type: String, default: "" },
          fileType: { type: String, default: "" },
          fileData: { type: String, default: "" },
          uploadedAt: { type: Date, default: Date.now },
        },
      ],
    },

    // Workflow / File Processing Status
    status: {
      type: String,
      enum: [
        "received", // ফাইল গ্রহণ করা হয়েছে
        "under_review", // কাগজপত্র যাচাই হচ্ছে
        "processing", // প্রসেসিং চলছে
        "embassy_submitted", // এম্বাসি / ভিএফএস-এ জমা
        "approved", // অনুমোদিত / ভিসা রেডি
        "delivered", // কাস্টমারকে বুঝিয়ে দেওয়া হয়েছে
        "rejected", // বাতিল / রিজেক্টেড
      ],
      default: "received",
    },

    // Activity Tracking Logs
    activityLogs: [
      {
        timestamp: { type: Date, default: Date.now },
        statusChangedTo: { type: String },
        note: { type: String, default: "" },
        updatedBy: { type: String, default: "Admin" },
      },
    ],

    officeNotes: { type: String, default: "" },

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

// Pre-save hook to calculate due amount
customerGuardianSchema.pre("save", function (next) {
  if (this.payment) {
    const total = Number(this.payment.totalAmount) || 0;
    const advance = Number(this.payment.advancePaid) || 0;
    this.payment.dueAmount = Math.max(0, total - advance);

    if (total > 0 && advance >= total) {
      this.payment.paymentStatus = "Paid";
    } else if (advance > 0) {
      this.payment.paymentStatus = "Partial";
    } else {
      this.payment.paymentStatus = "Unpaid";
    }
  }
  next();
});

export const CustomerGuardianModel =
  mongoose.models.CustomerGuardian ||
  mongoose.model("CustomerGuardian", customerGuardianSchema);
