import nodemailer from "nodemailer";
import QRCode from "qrcode";
import { authenticator } from "otplib";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import {
  BRAND_CONFIG,
  buildMasterEmailHtml,
  buildOtpEmailHtml,
  buildTwoFactorQrEmailHtml,
  buildStaffInvitationEmailHtml,
  buildTaskAssignmentEmailHtml,
  buildCaseStatusUpdateEmailHtml,
  buildPaymentReceiptEmailHtml,
  buildInvoiceEmailHtml,
  buildPayrollSlipEmailHtml,
} from "../templates/commonEmailTemplate.js";

// Cached SMTP transport connection instance
let cachedTransport = null;

/**
 * Returns or initializes the shared Nodemailer SMTP transporter
 */
export function getEmailTransport() {
  if (!cachedTransport) {
    const isSsl = String(env.SMTP_ENCRYPTION).toUpperCase() === "SSL" || Number(env.SMTP_PORT) === 465;

    cachedTransport = nodemailer.createTransport({
      host: env.SMTP_HOST || "aberi.us.svlogins.com",
      port: Number(env.SMTP_PORT) || 587,
      secure: isSsl,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }
  return cachedTransport;
}

/**
 * Low-level email sender
 */
export async function sendEmail({
  to,
  subject,
  html,
  text = "",
  attachments = [],
  fromName = env.SMTP_FROM_NAME || BRAND_CONFIG.name,
  fromEmail = env.SMTP_FROM || env.SMTP_USER,
}) {
  if (!env.SMTP_USER || !env.SMTP_PASSWORD) {
    const msg = "SMTP credentials are not configured in the environment";
    logger?.warn?.({ to, subject }, msg);
    return { delivered: false, reason: msg };
  }

  if (!to || typeof to !== "string" || !to.includes("@")) {
    return { delivered: false, reason: `Invalid recipient email address: "${to}"` };
  }

  const transport = getEmailTransport();
  const fromAddress = `"${fromName}" <${fromEmail}>`;

  try {
    const info = await transport.sendMail({
      from: fromAddress,
      to: to.trim().toLowerCase(),
      subject,
      text: text || subject,
      html,
      attachments,
    });

    logger?.info?.({ to, subject, messageId: info.messageId }, "Email dispatched successfully");
    return { delivered: true, messageId: info.messageId, response: info.response };
  } catch (error) {
    logger?.error?.({ error: error.message, to, subject }, "Email dispatch failed");
    return { delivered: false, reason: error.message };
  }
}

/**
 * 1. Send OTP Email (2FA, Password Reset, Registration)
 */
export async function sendOtpEmail({ toEmail, otp, name = "", type = "two-factor" }) {
  const is2fa = type === "two-factor";
  const isForgot = type === "forgot-password";
  const subject = is2fa
    ? "Your Monsur Ali Travels Login 2FA Code"
    : isForgot
    ? "Your Monsur Ali Travels Password Reset Code"
    : "Your Email Verification Code — Monsur Ali Travels";

  const html = buildOtpEmailHtml({ name, otp, type });
  const text = `Hello ${name || "there"},\n\nYour verification code is: ${otp}\nThis code will expire in 10 minutes.\n\nMonsur Ali Travels ERP System`;

  return sendEmail({
    to: toEmail,
    subject,
    html,
    text,
  });
}

/**
 * 2. Send Google Authenticator QR Code Setup Email
 */
export async function send2faQrEmail({ toEmail, name = "", secret }) {
  let finalSecret = secret;
  if (!finalSecret) {
    finalSecret = authenticator.generateSecret();
  }

  const otpauth = authenticator.keyuri(toEmail, "Monsur Ali Travels BD", finalSecret);
  const qrCodeBuffer = await QRCode.toBuffer(otpauth, { width: 220, margin: 2 });
  const html = buildTwoFactorQrEmailHtml({ name, secret: finalSecret });

  const subject = "Set Up Two-Factor Authentication — Monsur Ali Travels";
  const text = `Hello ${name || "Dashboard User"},\n\nScan the QR code or enter manual key: ${finalSecret} to set up 2FA for your account.`;

  return sendEmail({
    to: toEmail,
    subject,
    html,
    text,
    attachments: [
      {
        filename: "qrcode.png",
        content: qrCodeBuffer,
        cid: "qrcode",
        contentType: "image/png",
        contentDisposition: "inline",
      },
    ],
  });
}

/**
 * 3. Send Staff / User Account Invitation Email
 */
export async function sendStaffInvitationEmail({
  toEmail,
  name,
  role = "Staff",
  subRole = "",
  tempPassword,
  loginUrl,
  invitedBy,
}) {
  const displayRole = subRole ? `${role} (${subRole.replace(/_/g, " ")})` : role;
  const subject = `Welcome to Monsur Ali Travels ERP — Staff Invitation (${displayRole})`;
  const html = buildStaffInvitationEmailHtml({
    name,
    toEmail,
    role,
    subRole,
    tempPassword,
    loginUrl,
    invitedBy,
  });
  const text = `Hello ${name},\n\nYou have been invited to join the Monsur Ali Travels ERP system as ${displayRole}.\n\nLogin URL: ${loginUrl || BRAND_CONFIG.dashboardUrl}\nEmail: ${toEmail}\nTemporary Password: ${tempPassword}\n\nPlease update your password after logging in.`;

  return sendEmail({
    to: toEmail,
    subject,
    html,
    text,
  });
}

/**
 * 4. Send Workflow Task Assignment Email to Staff
 */
export async function sendTaskAssignmentEmail({
  toEmail,
  staffName,
  taskTitle,
  description,
  stepNumber = 1,
  caseNumber,
  caseTitle,
  clientName,
  serviceType,
  deadline,
  assignedBy,
  caseUrl,
}) {
  const subject = `New Task Assigned: ${taskTitle} (Case #${caseNumber})`;
  const html = buildTaskAssignmentEmailHtml({
    staffName,
    taskTitle,
    description,
    stepNumber,
    caseNumber,
    caseTitle,
    clientName,
    serviceType,
    deadline,
    assignedBy,
    caseUrl,
  });
  const text = `Hello ${staffName},\n\nYou have been assigned the task "${taskTitle}" for Case #${caseNumber} (${clientName || "Client"}).\nAssigned By: ${assignedBy || "Admin"}`;

  return sendEmail({
    to: toEmail,
    subject,
    html,
    text,
  });
}

/**
 * 5. Send Case File Status Update Email to Client or Staff
 */
export async function sendCaseStatusUpdateEmail({
  toEmail,
  clientName,
  caseNumber,
  serviceType,
  newStatus,
  remarks,
  updatedBy,
  portalUrl,
}) {
  const subject = `Update on Application #${caseNumber}: ${newStatus}`;
  const html = buildCaseStatusUpdateEmailHtml({
    clientName,
    caseNumber,
    serviceType,
    newStatus,
    remarks,
    updatedBy,
    portalUrl,
  });
  const text = `Dear ${clientName},\n\nYour application #${caseNumber} status has been updated to: ${newStatus}.\nRemarks: ${remarks || "None"}\n\nMonsur Ali Travels`;

  return sendEmail({
    to: toEmail,
    subject,
    html,
    text,
  });
}

/**
 * 6. Send Payment Receipt / Confirmation Email
 */
export async function sendPaymentReceiptEmail({
  toEmail,
  clientName,
  receiptNo,
  amount,
  serviceType,
  purpose,
  paymentMethod,
  paymentDate,
  receivedBy,
  remainingDue,
}) {
  const subject = `Official Payment Receipt #${receiptNo} — Monsur Ali Travels`;
  const html = buildPaymentReceiptEmailHtml({
    clientName,
    receiptNo,
    amount,
    serviceType,
    purpose,
    paymentMethod,
    paymentDate,
    receivedBy,
    remainingDue,
  });
  const text = `Dear ${clientName},\n\nPayment of BDT ${Number(amount).toLocaleString()} received successfully.\nReceipt No: #${receiptNo}\nPayment Method: ${paymentMethod || "Cash"}\nDate: ${paymentDate || new Date().toLocaleDateString()}\n\nThank you,\nMonsur Ali Travels`;

  return sendEmail({
    to: toEmail,
    subject,
    html,
    text,
  });
}

/**
 * 7. Send Invoice Delivery Email
 */
export async function sendInvoiceEmail({
  toEmail,
  buyerName,
  invoiceNumber,
  createdDate,
  dueDate,
  items,
  total,
  subtotal,
  paymentMethod,
  invoiceUrl,
}) {
  const subject = `Invoice #${invoiceNumber} from Monsur Ali Travels`;
  const html = buildInvoiceEmailHtml({
    invoiceNumber,
    createdDate,
    dueDate,
    buyerName,
    buyerEmail: toEmail,
    items,
    total,
    subtotal,
    paymentMethod,
    invoiceUrl,
  });
  const text = `Dear ${buyerName},\n\nPlease find your Invoice #${invoiceNumber} for BDT ${(total || 0).toLocaleString()} attached.\nDue Date: ${dueDate || "Upon Receipt"}\n\nMonsur Ali Travels`;

  return sendEmail({
    to: toEmail,
    subject,
    html,
    text,
  });
}

/**
 * 8. Send Payroll / Salary Slip Email
 */
export async function sendPayrollSlipEmail({
  toEmail,
  employeeName,
  employeeCode,
  designation,
  monthYear,
  netSalary,
  basicSalary,
  allowances,
  deductions,
  paymentDate,
}) {
  const subject = `Salary Slip for ${monthYear} — Monsur Ali Travels`;
  const html = buildPayrollSlipEmailHtml({
    employeeName,
    employeeCode,
    designation,
    monthYear,
    netSalary,
    basicSalary,
    allowances,
    deductions,
    paymentDate,
  });
  const text = `Hello ${employeeName},\n\nYour salary slip for ${monthYear} is processed.\nNet Salary: BDT ${Number(netSalary).toLocaleString()}\n\nMonsur Ali Travels Accounts`;

  return sendEmail({
    to: toEmail,
    subject,
    html,
    text,
  });
}
