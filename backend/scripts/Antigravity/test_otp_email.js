import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import {
  sendOtpEmail,
  send2faQrEmail,
  sendStaffInvitationEmail,
  sendTaskAssignmentEmail,
  sendCaseStatusUpdateEmail,
  sendPaymentReceiptEmail,
  sendInvoiceEmail,
  sendPayrollSlipEmail,
} from "../../src/services/emailService.js";

const targetEmail = process.argv[2]?.trim() || "md.ikr4m@gmail.com";

async function testAllEmailTemplates() {
  console.log("=================================================");
  console.log("🌟 MONSUR ALI TRAVELS — MASTER EMAIL SUITE TEST");
  console.log("=================================================");
  console.log(`Target Recipient: ${targetEmail}\n`);

  // 1. 2FA Login OTP
  console.log("1️⃣ Testing 2FA Login OTP Email...");
  const res1 = await sendOtpEmail({
    toEmail: targetEmail,
    name: "Md Ikramul",
    otp: "842915",
    type: "two-factor",
  });
  console.log(`   Result: ${res1.delivered ? "✅ DELIVERED" : "❌ FAILED: " + res1.reason}`);

  // 2. Staff Invitation Email
  console.log("2️⃣ Testing Staff Invitation & Credentials Email...");
  const res2 = await sendStaffInvitationEmail({
    toEmail: targetEmail,
    name: "Ikramul Hoque",
    role: "Staff",
    subRole: "Visa_Processor",
    tempPassword: "Pass@" + Math.floor(1000 + Math.random() * 9000),
    invitedBy: "Managing Director",
  });
  console.log(`   Result: ${res2.delivered ? "✅ DELIVERED" : "❌ FAILED: " + res2.reason}`);

  // 3. 2FA QR Code Setup Email
  console.log("3️⃣ Testing Google Authenticator QR Setup Email...");
  const res3 = await send2faQrEmail({
    toEmail: targetEmail,
    name: "Md Ikramul",
  });
  console.log(`   Result: ${res3.delivered ? "✅ DELIVERED" : "❌ FAILED: " + res3.reason}`);

  // 4. Task Assignment Email
  console.log("4️⃣ Testing Workflow Task Assignment Email...");
  const res4 = await sendTaskAssignmentEmail({
    toEmail: targetEmail,
    staffName: "Ikramul Hoque",
    taskTitle: "Greek Work Permit Online Application Submission",
    description: "Please verify client passport, photo scan, and submit to Greek immigration portal.",
    stepNumber: 2,
    caseNumber: "GRC-2026-9281",
    caseTitle: "Greece Work Permit Processing",
    clientName: "Rahim Uddin",
    serviceType: "Greece Work Permit",
    deadline: "September 05, 2026",
    assignedBy: "Admin Ikram",
  });
  console.log(`   Result: ${res4.delivered ? "✅ DELIVERED" : "❌ FAILED: " + res4.reason}`);

  // 5. Case Status Update Email
  console.log("5️⃣ Testing Case Status Update Email...");
  const res5 = await sendCaseStatusUpdateEmail({
    toEmail: targetEmail,
    clientName: "Rahim Uddin",
    caseNumber: "GRC-2026-9281",
    serviceType: "Greece Work Permit",
    newStatus: "Government Offer Letter Approved",
    remarks: "Your offer letter has been approved by the Greek authorities. Secondary visa processing initiated.",
    updatedBy: "Monsur Ali Travels Visa Department",
  });
  console.log(`   Result: ${res5.delivered ? "✅ DELIVERED" : "❌ FAILED: " + res5.reason}`);

  // 6. Payment Receipt Email
  console.log("6️⃣ Testing Money Receipt Confirmation Email...");
  const res6 = await sendPaymentReceiptEmail({
    toEmail: targetEmail,
    clientName: "Rahim Uddin",
    receiptNo: "REC-2026-8812",
    amount: 150000,
    serviceType: "Greece Work Permit",
    purpose: "Step 2 Milestone (Offer Letter Approval)",
    paymentMethod: "Bank Transfer",
    paymentDate: new Date().toLocaleDateString(),
    receivedBy: "Accounts Dept. (Monsur Ali Travels)",
    remainingDue: 100000,
  });
  console.log(`   Result: ${res6.delivered ? "✅ DELIVERED" : "❌ FAILED: " + res6.reason}`);

  // 7. Invoice Delivery Email
  console.log("7️⃣ Testing Invoice Delivery Email...");
  const res7 = await sendInvoiceEmail({
    toEmail: targetEmail,
    buyerName: "Rahim Uddin",
    invoiceNumber: "INV-MAT-9921",
    createdDate: new Date().toLocaleDateString(),
    dueDate: "September 10, 2026",
    items: [
      { description: "Greece Work Permit Processing Fee", quantity: 1, total: 200000 },
      { description: "Embassy Document Translation & Legalization", quantity: 1, total: 35000 },
      { description: "VFS Global Appointment & Biometric Booking", quantity: 1, total: 15000 },
    ],
    total: 250000,
    subtotal: 250000,
    paymentMethod: "Bank Deposit",
    invoiceUrl: "https://admin.monsuralitravels.com/invoices/INV-MAT-9921",
  });
  console.log(`   Result: ${res7.delivered ? "✅ DELIVERED" : "❌ FAILED: " + res7.reason}`);

  // 8. Payroll Salary Slip Email
  console.log("8️⃣ Testing Employee Salary Slip Email...");
  const res8 = await sendPayrollSlipEmail({
    toEmail: targetEmail,
    employeeName: "Ikramul Hoque",
    employeeCode: "EMP-1092",
    designation: "Senior Visa Processor",
    monthYear: "August 2026",
    netSalary: 65000,
    basicSalary: 50000,
    allowances: 18000,
    deductions: 3000,
    paymentDate: new Date().toLocaleDateString(),
  });
  console.log(`   Result: ${res8.delivered ? "✅ DELIVERED" : "❌ FAILED: " + res8.reason}`);

  console.log("\n=================================================");
  console.log("🎉 MASTER EMAIL SUITE TESTING COMPLETE!");
  console.log("=================================================");
}

testAllEmailTemplates().catch(console.error);
