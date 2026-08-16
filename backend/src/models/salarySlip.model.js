import mongoose from "mongoose";

// Generates unique Slip Number: SLIP- + 2 letters + 4 digits + 1 middle letter + 3 digits (e.g. "SLIP-AB4829K513")
export function generateUniqueSlipNumber() {
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

  return `SLIP-${prefixLetters}${firstDigits}${midLetter}${lastDigits}`;
}

const salarySlipSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      default: "MANSUR ALI TOURS & TRAVELS",
    },
    companyAddress: {
      type: String,
      default: "Nadampur, Jagannathpur, Sunamganj - 3060, Sylhet, Bangladesh",
    },
    slipNo: {
      type: String,
      trim: true,
      default: generateUniqueSlipNumber,
    },

    // Employee Details
    employeeName: {
      type: String,
      required: [true, "Employee name is required"],
      trim: true,
    },
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      trim: true,
    },
    designation: {
      type: String,
      default: "Employee",
    },
    department: {
      type: String,
      default: "Operations",
    },
    joiningDate: {
      type: String,
    },

    // Control Details
    salaryMonth: {
      type: String,
      required: [true, "Salary month is required"],
    },
    payDate: {
      type: String,
    },
    paymentMode: {
      type: String,
      default: "Cash",
    },
    attendanceDays: {
      type: Number,
      default: 30,
    },

    // Earnings / Allowances (BDT)
    basicSalary: { type: Number, default: 0 },
    houseRentAllowance: { type: Number, default: 0 },
    medicalAllowance: { type: Number, default: 0 },
    conveyanceAllowance: { type: Number, default: 0 },
    otherAllowance: { type: Number, default: 0 },
    overtimeExtraDuty: { type: Number, default: 0 },
    grossEarnings: { type: Number, default: 0 },

    // Deductions / Adjustments (BDT)
    advanceSalary: { type: Number, default: 0 },
    unpaidLeaveAbsence: { type: Number, default: 0 },
    loanAuthorizedDeduction: { type: Number, default: 0 },
    taxStatutoryDeduction: { type: Number, default: 0 },
    otherAuthorizedDeduction: { type: Number, default: 0 },
    totalDeduction: { type: Number, default: 0 },

    // Net Payable
    netSalaryPayable: { type: Number, default: 0 },
    netSalaryInWords: { type: String, default: "" },

    // Attendance & Leave Values
    workingDays: { type: Number, default: 30 },
    presentDays: { type: Number, default: 30 },
    paidLeave: { type: Number, default: 0 },
    unpaidLeave: { type: Number, default: 0 },

    // Verification & Signatures
    preparedBy: { type: String, default: "HR Department" },
    checkedBy: { type: String, default: "Accounts Department" },
    authorizedSignatory: { type: String, default: "Managing Director" },
    remarks: { type: String, default: "" },
  },
  {
    timestamps: true,
    collection: "salary-slips",
  }
);

salarySlipSchema.pre("save", function (next) {
  if (!this.slipNo) {
    this.slipNo = generateUniqueSlipNumber();
  }
  next();
});

export const SalarySlip = mongoose.model("SalarySlip", salarySlipSchema);
