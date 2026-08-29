import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { UserModel } from "../models/user.model.js";

// Lazy-initialized SMTP transporter
let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: String(env.SMTP_ENCRYPTION).toLowerCase() === "ssl",
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD,
      },
    });
  }
  return transporter;
}

/**
 * Basic send mail wrapper with error catching so failures don't block operations
 */
export async function sendEmail({ to, subject, html, text }) {
  if (!env.SMTP_USER || !env.SMTP_PASSWORD) {
    console.warn("[EmailService] SMTP credentials not set, skipping email:", subject);
    return false;
  }

  try {
    const activeTransporter = getTransporter();
    const fromName = env.SMTP_FROM_NAME || "Monsur Ali Travels";
    const fromEmail = env.SMTP_FROM || env.SMTP_USER;

    const info = await activeTransporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject,
      text: text || subject,
      html,
    });

    console.info(`[EmailService] Sent email "${subject}" to:`, to, "MessageId:", info.messageId);
    return true;
  } catch (err) {
    console.error("[EmailService] Failed to send email:", err.message);
    return false;
  }
}

/**
 * Standard branded HTML Email Template
 */
function buildBrandedTemplate({ title, preheader, bodyHtml, actionUrl, actionText }) {
  const currentYear = new Date().getFullYear();
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; color: #1e293b; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #0b3a60 0%, #0284c7 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; }
          .header p { margin: 6px 0 0 0; font-size: 13px; opacity: 0.9; }
          .content { padding: 32px 28px; line-height: 1.6; font-size: 14px; color: #334155; }
          .badge { display: inline-block; padding: 4px 12px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 9999px; font-size: 12px; font-weight: 700; color: #0b3a60; margin-bottom: 16px; }
          .highlight-box { background: #f8fafc; border-left: 4px solid #0284c7; padding: 16px 20px; border-radius: 8px; margin: 20px 0; }
          .btn-container { text-align: center; margin: 28px 0 12px; }
          .btn { background: #0b3a60; color: #ffffff !important; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 13px; display: inline-block; }
          .footer { background: #f8fafc; padding: 20px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Monsur Ali Travels</h1>
            <p>Smart ERP & Operations Management System</p>
          </div>
          <div class="content">
            <div class="badge">${preheader || "Operational Alert"}</div>
            ${bodyHtml}
            ${
              actionUrl && actionText
                ? `<div class="btn-container"><a href="${actionUrl}" class="btn" target="_blank">${actionText}</a></div>`
                : ""
            }
          </div>
          <div class="footer">
            <p>© ${currentYear} Monsur Ali Travels. All rights reserved.</p>
            <p>This is an automated notification from your ERP system.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Action 1: To all Owners & Admins when a new case file is opened
//    "<userName>" created a new file <FiledID> for "<clientName>"
// ─────────────────────────────────────────────────────────────────────────────
export async function sendNewCaseEmailToAdmins({ userName, caseNumber, caseDid, clientName, destinationCountry }) {
  try {
    const adminsAndOwners = await UserModel.find({
      role: { $in: ["Owner", "Admin"] },
      isActive: true,
    }).select("email name").lean();

    const emails = adminsAndOwners.map((u) => u.email).filter(Boolean);
    if (!emails.length) return;

    const subject = `New Case File Created: ${caseNumber} - ${clientName}`;
    const html = buildBrandedTemplate({
      title: "New Case File Opened",
      preheader: "New Visa Case",
      bodyHtml: `
        <p>Hello Admin & Management,</p>
        <p><strong>${userName}</strong> has created a new case file in the system:</p>
        <div class="highlight-box">
          <p style="margin: 0 0 6px 0;"><strong>Case Number:</strong> ${caseNumber}</p>
          <p style="margin: 0 0 6px 0;"><strong>Client / Applicant:</strong> ${clientName}</p>
          ${destinationCountry ? `<p style="margin: 0;"><strong>Destination:</strong> ${destinationCountry}</p>` : ""}
        </div>
        <p>You can review and assign tasks for this case on the admin dashboard.</p>
      `,
      actionUrl: "https://admin.monsuralitravels.com/admin/cases",
      actionText: "View Case Files",
    });

    await sendEmail({ to: emails, subject, html });
  } catch (err) {
    console.error("[EmailService] sendNewCaseEmailToAdmins error:", err.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Action 2: To Staff when a task is assigned to them
//    "<userName>" assigned new task <Task name> of <fileId> to you
// ─────────────────────────────────────────────────────────────────────────────
export async function sendTaskAssignedEmailToStaff({ assignedByUserName, assignedToDid, taskTitle, caseNumber }) {
  try {
    const staff = await UserModel.findOne({
      $or: [{ did: assignedToDid }, { email: assignedToDid }],
      isActive: true,
    }).select("email name").lean();

    if (!staff?.email) return;

    const subject = `New Task Assigned: ${taskTitle} (Case #${caseNumber})`;
    const html = buildBrandedTemplate({
      title: "Task Assigned",
      preheader: "Workflow Task Assignment",
      bodyHtml: `
        <p>Hello <strong>${staff.name || "Colleague"}</strong>,</p>
        <p><strong>${assignedByUserName}</strong> assigned a new task to you:</p>
        <div class="highlight-box">
          <p style="margin: 0 0 6px 0;"><strong>Task Name:</strong> ${taskTitle}</p>
          <p style="margin: 0;"><strong>Case Reference:</strong> ${caseNumber}</p>
        </div>
        <p>Please log in to your dashboard to review the task requirements, process the files, and mark it as done once completed.</p>
      `,
      actionUrl: "https://admin.monsuralitravels.com/admin/cases",
      actionText: "Open My Tasks",
    });

    await sendEmail({ to: staff.email, subject, html });
  } catch (err) {
    console.error("[EmailService] sendTaskAssignedEmailToStaff error:", err.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Action 3: To Accountant when any other user creates a new payment related document
// ─────────────────────────────────────────────────────────────────────────────
export async function sendPaymentDocCreatedEmailToAccountants({ createdByUserName, docType, docNumber, amount, clientName }) {
  try {
    const accountants = await UserModel.find({
      $or: [
        { subRole: "Accountant" },
        { department: { $regex: /account/i } },
        { designation: { $regex: /account/i } },
      ],
      isActive: true,
    }).select("email name").lean();

    const emails = accountants.map((u) => u.email).filter(Boolean);
    if (!emails.length) return;

    const formattedAmount = amount ? Number(amount).toLocaleString() + " BDT" : "N/A";
    const subject = `Payment Document Generated: ${docType} #${docNumber}`;
    const html = buildBrandedTemplate({
      title: "Payment Document Alert",
      preheader: "Document Studio Transaction",
      bodyHtml: `
        <p>Hello Accounts Team,</p>
        <p>A new payment-related document has been generated in Document Studio by <strong>${createdByUserName}</strong>:</p>
        <div class="highlight-box">
          <p style="margin: 0 0 6px 0;"><strong>Document Type:</strong> ${docType}</p>
          <p style="margin: 0 0 6px 0;"><strong>Document / Token No:</strong> ${docNumber}</p>
          <p style="margin: 0 0 6px 0;"><strong>Amount:</strong> ${formattedAmount}</p>
          ${clientName ? `<p style="margin: 0;"><strong>Client / Paid To:</strong> ${clientName}</p>` : ""}
        </div>
        <p>Please audit this transaction and verify cashier receipt / voucher ledger posting.</p>
      `,
      actionUrl: "https://admin.monsuralitravels.com/admin/accounts/payments",
      actionText: "View Payments & Vouchers",
    });

    await sendEmail({ to: emails, subject, html });
  } catch (err) {
    console.error("[EmailService] sendPaymentDocCreatedEmailToAccountants error:", err.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Action 4: To Owners when a new payment or bill is created
// ─────────────────────────────────────────────────────────────────────────────
export async function sendPaymentOrBillCreatedEmailToOwners({ createdByUserName, type, refNumber, amount, notes }) {
  try {
    const owners = await UserModel.find({
      role: "Owner",
      isActive: true,
    }).select("email name").lean();

    const emails = owners.map((u) => u.email).filter(Boolean);
    if (!emails.length) return;

    const formattedAmount = amount ? Number(amount).toLocaleString() + " BDT" : "N/A";
    const subject = `Financial Entry: New ${type} (${formattedAmount})`;
    const html = buildBrandedTemplate({
      title: `New ${type} Recorded`,
      preheader: "Financial Notification",
      bodyHtml: `
        <p>Hello Honorable Owner,</p>
        <p>A new <strong>${type}</strong> entry has been created by <strong>${createdByUserName}</strong>:</p>
        <div class="highlight-box">
          <p style="margin: 0 0 6px 0;"><strong>Entry Type:</strong> ${type}</p>
          <p style="margin: 0 0 6px 0;"><strong>Reference No:</strong> ${refNumber}</p>
          <p style="margin: 0 0 6px 0;"><strong>Amount:</strong> ${formattedAmount}</p>
          ${notes ? `<p style="margin: 0;"><strong>Notes / Purpose:</strong> ${notes}</p>` : ""}
        </div>
        <p>This transaction has been logged in the central accounts ledger.</p>
      `,
      actionUrl: "https://admin.monsuralitravels.com/admin/accounts/reports",
      actionText: "View Accounts Summary",
    });

    await sendEmail({ to: emails, subject, html });
  } catch (err) {
    console.error("[EmailService] sendPaymentOrBillCreatedEmailToOwners error:", err.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Action 5: To Owners when any staff marks their assigned task as Done / Complete
// ─────────────────────────────────────────────────────────────────────────────
export async function sendTaskCompletedEmailToOwners({ staffName, taskTitle, caseNumber, completionNotes }) {
  try {
    const owners = await UserModel.find({
      role: "Owner",
      isActive: true,
    }).select("email name").lean();

    const emails = owners.map((u) => u.email).filter(Boolean);
    if (!emails.length) return;

    const subject = `Task Completed by ${staffName}: ${taskTitle} (Case #${caseNumber})`;
    const html = buildBrandedTemplate({
      title: "Task Marked as Done",
      preheader: "Operational Milestone Completed",
      bodyHtml: `
        <p>Hello Honorable Owner,</p>
        <p>Staff member <strong>${staffName}</strong> has completed their assigned task:</p>
        <div class="highlight-box">
          <p style="margin: 0 0 6px 0;"><strong>Task Title:</strong> ${taskTitle}</p>
          <p style="margin: 0 0 6px 0;"><strong>Case Number:</strong> ${caseNumber}</p>
          ${completionNotes ? `<p style="margin: 0;"><strong>Completion Notes:</strong> ${completionNotes}</p>` : ""}
        </div>
        <p>The task is now ready for final verification or subsequent workflow transitions.</p>
      `,
      actionUrl: "https://admin.monsuralitravels.com/admin/cases",
      actionText: "Review Case Workflow",
    });

    await sendEmail({ to: emails, subject, html });
  } catch (err) {
    console.error("[EmailService] sendTaskCompletedEmailToOwners error:", err.message);
  }
}
