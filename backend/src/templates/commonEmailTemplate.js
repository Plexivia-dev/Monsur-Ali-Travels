/**
 * Monsur Ali Travels — Master Common Email Template System
 * Modern dark/electric sky-blue theme with high-contrast accessibility and responsive layout.
 */

export const BRAND_CONFIG = {
  name: "Monsur Ali Travels",
  companyName: "Monsur Ali Travels BD",
  logoUrl: "https://server.monsuralitravelsbd.com/uploads/logo_horizontal.png",
  websiteUrl: "https://monsuralitravels.com",
  adminDashboardUrl: "https://admin.monsuralitravels.com",
  clientDashboardUrl: "https://dashboard.monsuralitravels.com",
  dashboardUrl: "https://dashboard.monsuralitravels.com",
  supportEmail: "info@monsuralitravels.com",
  address: "Mominpur, Jagannathpur Road, Sunamganj - 3060, Bangladesh",
  phone: "+880 1345-579534",
  accentColor: "#00A3FF", // Electric Sky Blue Accent (from UI & Branding)
  accentLight: "#38BDF8", // Light Sky Cyan
  accentHover: "#0088D6",
  darkBg: "#0B101D",      // Deep Navy Midnight
  cardBg: "#141D33",      // Sleek Navy Card
  headerBg: "#060A14",    // Midnight Header
  borderColor: "#233354",  // Subtle Slate/Blue Border
  textColor: "#F1F5F9",
  textMuted: "#94A3B8",
  textDim: "#64748B",
};

/**
 * Base Master Email HTML Generator
 */
export function buildMasterEmailHtml({
  badge = "",
  title = "Notification",
  previewText = "",
  greeting = "",
  intro = "",
  highlightBox = null, // { type: 'otp'|'credentials'|'alert'|'success'|'info'|'qr', title, code, details: [], note }
  detailsTable = null, // Array of { label, value, isBold, isAccent, isGold }
  itemsTable = null, // { headers: ['Item', 'Qty', 'Price'], rows: [['Greece Permit', '1', 'BDT 50,000']], summary: [{ label, value, isTotal }] }
  button = null, // { text: 'Log In', url: 'https://...' }
  secondaryContent = "",
  securityNote = "",
  logoUrl = BRAND_CONFIG.logoUrl,
}) {
  const finalPreviewText = previewText || title;
  const currentYear = new Date().getFullYear();

  // Render Badge
  const badgeHtml = badge
    ? `<div style="text-align: center; margin-bottom: 14px;">
        <span style="display: inline-block; padding: 5px 16px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: ${BRAND_CONFIG.accentColor}; background-color: rgba(0, 163, 255, 0.12); border: 1px solid rgba(0, 163, 255, 0.35); border-radius: 9999px; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          ${badge}
        </span>
      </div>`
    : "";

  // Render Highlight Box
  let highlightBoxHtml = "";
  if (highlightBox) {
    if (highlightBox.type === "otp") {
      highlightBoxHtml = `
        <div style="background-color: ${BRAND_CONFIG.cardBg}; border: 1px dashed ${BRAND_CONFIG.accentColor}; border-radius: 12px; padding: 24px 20px; margin: 24px 0; text-align: center;">
          ${highlightBox.title ? `<div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: ${BRAND_CONFIG.textMuted}; margin-bottom: 10px;">${highlightBox.title}</div>` : ""}
          <div style="font-family: 'Geist Mono', Courier, monospace; font-size: 34px; font-weight: 700; letter-spacing: 8px; color: ${BRAND_CONFIG.accentColor}; margin: 8px 0; text-shadow: 0 0 16px rgba(0, 163, 255, 0.3);">
            ${highlightBox.code}
          </div>
          ${highlightBox.note ? `<div style="font-size: 12px; color: ${BRAND_CONFIG.textMuted}; margin-top: 10px;">⏱ ${highlightBox.note}</div>` : ""}
        </div>
      `;
    } else if (highlightBox.type === "credentials") {
      const credRows = (highlightBox.details || [])
        .map(
          (d) => `
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid ${BRAND_CONFIG.borderColor}; font-size: 13px;">
            <span style="color: ${BRAND_CONFIG.textMuted};">${d.label}:</span>
            <strong style="color: ${d.isAccent || d.isGold ? BRAND_CONFIG.accentLight : '#FFFFFF'}; font-family: 'Geist Mono', monospace;">${d.value}</strong>
          </div>
        `
        )
        .join("");

      highlightBoxHtml = `
        <div style="background-color: ${BRAND_CONFIG.cardBg}; border: 1px solid ${BRAND_CONFIG.borderColor}; border-left: 4px solid ${BRAND_CONFIG.accentColor}; border-radius: 8px; padding: 18px 20px; margin: 24px 0;">
          ${highlightBox.title ? `<div style="font-size: 14px; font-weight: 600; color: ${BRAND_CONFIG.accentLight}; margin-bottom: 12px;">${highlightBox.title}</div>` : ""}
          ${credRows}
          ${highlightBox.note ? `<div style="font-size: 12px; color: ${BRAND_CONFIG.textMuted}; margin-top: 12px; font-style: italic;">${highlightBox.note}</div>` : ""}
        </div>
      `;
    } else if (highlightBox.type === "qr") {
      highlightBoxHtml = `
        <div style="background-color: ${BRAND_CONFIG.cardBg}; border: 1px solid ${BRAND_CONFIG.borderColor}; border-radius: 12px; padding: 24px 20px; margin: 24px 0; text-align: center;">
          ${highlightBox.title ? `<div style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: ${BRAND_CONFIG.accentLight}; margin-bottom: 16px; font-weight: 700;">${highlightBox.title}</div>` : ""}
          <div style="display: inline-block; padding: 14px; background-color: #FFFFFF; border-radius: 12px; border: 3px solid ${BRAND_CONFIG.accentColor}; margin-bottom: 18px; box-shadow: 0 4px 16px rgba(0, 163, 255, 0.25);">
            <img src="${highlightBox.qrSrc || 'cid:qrcode'}" alt="Google Authenticator QR Code" width="180" height="180" style="display: block; width: 180px; height: 180px; margin: 0 auto; border: 0; outline: none;" />
          </div>
          ${highlightBox.code ? `
            <div style="font-size: 11px; color: ${BRAND_CONFIG.textDim}; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; font-weight: 600;">Manual Setup Key (If you cannot scan)</div>
            <div style="display: inline-block; background-color: #060A14; border: 1px dashed ${BRAND_CONFIG.accentColor}; padding: 10px 20px; border-radius: 8px; font-family: 'Geist Mono', Courier, monospace; color: ${BRAND_CONFIG.accentLight}; font-weight: 700; letter-spacing: 3px; font-size: 16px; word-break: break-all; user-select: all;">
              ${highlightBox.code}
            </div>
          ` : ""}
          ${highlightBox.note ? `<div style="font-size: 12px; color: ${BRAND_CONFIG.textMuted}; margin-top: 14px;">${highlightBox.note}</div>` : ""}
        </div>
      `;
    } else {
      // Generic alert / success / info box
      const borderColor = highlightBox.type === "success" ? "#22c55e" : highlightBox.type === "alert" ? "#ef4444" : BRAND_CONFIG.accentColor;
      highlightBoxHtml = `
        <div style="background-color: ${BRAND_CONFIG.cardBg}; border: 1px solid ${BRAND_CONFIG.borderColor}; border-left: 4px solid ${borderColor}; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
          ${highlightBox.title ? `<div style="font-size: 14px; font-weight: 600; color: #FFFFFF; margin-bottom: 6px;">${highlightBox.title}</div>` : ""}
          <div style="font-size: 13px; color: ${BRAND_CONFIG.textColor}; line-height: 1.6;">${highlightBox.content || highlightBox.note || ""}</div>
        </div>
      `;
    }
  }

  // Render Details Table
  let detailsTableHtml = "";
  if (detailsTable && detailsTable.length > 0) {
    const rows = detailsTable
      .map(
        (row, idx) => `
        <tr style="border-bottom: 1px solid ${BRAND_CONFIG.borderColor}; background-color: ${idx % 2 === 0 ? BRAND_CONFIG.cardBg : '#0E1626'};">
          <td style="padding: 10px 14px; font-size: 13px; color: ${BRAND_CONFIG.textMuted}; width: 40%; vertical-align: top;">
            ${row.label}
          </td>
          <td style="padding: 10px 14px; font-size: 13px; color: ${row.isAccent || row.isGold ? BRAND_CONFIG.accentLight : row.isBold ? '#FFFFFF' : BRAND_CONFIG.textColor}; font-weight: ${row.isBold || row.isAccent || row.isGold ? '600' : 'normal'}; text-align: right; vertical-align: top;">
            ${row.value}
          </td>
        </tr>
      `
      )
      .join("");

    detailsTableHtml = `
      <div style="margin: 24px 0; border: 1px solid ${BRAND_CONFIG.borderColor}; border-radius: 8px; overflow: hidden;">
        <table style="width: 100%; border-collapse: collapse; font-family: 'Geist Mono', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace;">
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;
  }

  // Render Items Table (Invoice/Receipt line items)
  let itemsTableHtml = "";
  if (itemsTable && itemsTable.rows && itemsTable.rows.length > 0) {
    const headers = (itemsTable.headers || ["Description", "Qty", "Amount"])
      .map((h, i) => `<th style="padding: 10px 12px; font-size: 11px; font-weight: 600; color: ${BRAND_CONFIG.accentLight}; text-transform: uppercase; letter-spacing: 1px; text-align: ${i === 0 ? 'left' : i === 1 ? 'center' : 'right'}; background-color: #060A14; border-bottom: 2px solid ${BRAND_CONFIG.accentColor};">${h}</th>`)
      .join("");

    const itemRows = itemsTable.rows
      .map((r, idx) => `
        <tr style="border-bottom: 1px solid ${BRAND_CONFIG.borderColor}; background-color: ${idx % 2 === 0 ? BRAND_CONFIG.cardBg : '#0E1626'};">
          <td style="padding: 10px 12px; font-size: 13px; color: #FFFFFF; text-align: left;">${r[0]}</td>
          <td style="padding: 10px 12px; font-size: 13px; color: ${BRAND_CONFIG.textMuted}; text-align: center;">${r[1] || '1'}</td>
          <td style="padding: 10px 12px; font-size: 13px; color: ${BRAND_CONFIG.accentLight}; font-weight: 600; text-align: right;">${r[2]}</td>
        </tr>
      `)
      .join("");

    let summaryHtml = "";
    if (itemsTable.summary && itemsTable.summary.length > 0) {
      summaryHtml = itemsTable.summary
        .map((s) => `
          <tr style="${s.isTotal ? `border-top: 2px solid ${BRAND_CONFIG.accentColor};` : ''}">
            <td colspan="2" style="padding: 8px 12px; font-size: ${s.isTotal ? '14px' : '12px'}; font-weight: ${s.isTotal ? '700' : 'normal'}; color: ${s.isTotal ? '#FFFFFF' : BRAND_CONFIG.textMuted}; text-align: right;">${s.label}:</td>
            <td style="padding: 8px 12px; font-size: ${s.isTotal ? '16px' : '13px'}; font-weight: 700; color: ${s.isTotal ? BRAND_CONFIG.accentLight : '#FFFFFF'}; text-align: right;">${s.value}</td>
          </tr>
        `)
        .join("");
    }

    itemsTableHtml = `
      <div style="margin: 24px 0; border: 1px solid ${BRAND_CONFIG.borderColor}; border-radius: 8px; overflow: hidden;">
        <table style="width: 100%; border-collapse: collapse; font-family: 'Geist Mono', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace;">
          <thead>
            <tr>${headers}</tr>
          </thead>
          <tbody>
            ${itemRows}
            ${summaryHtml}
          </tbody>
        </table>
      </div>
    `;
  }

  // Render CTA Button (Modern Electric Blue Pill Button)
  let buttonHtml = "";
  if (button && button.url && button.text) {
    buttonHtml = `
      <div style="text-align: center; margin: 32px 0 20px 0;">
        <a href="${button.url}" target="_blank" style="display: inline-block; padding: 14px 38px; background-color: ${BRAND_CONFIG.accentColor}; color: #FFFFFF; text-decoration: none; border-radius: 9999px; font-weight: 700; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; letter-spacing: 0.5px; box-shadow: 0 4px 18px rgba(0, 163, 255, 0.38); text-align: center; transition: all 0.2s ease;">
          &rarr;] ${button.text}
        </a>
      </div>
    `;
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <!-- Google Fonts Import -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Geist+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #F0F4F8;
      color: ${BRAND_CONFIG.textColor};
      -webkit-font-smoothing: antialiased;
      -webkit-text-size-adjust: 100%;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #F0F4F8;
      padding: 36px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: ${BRAND_CONFIG.darkBg};
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 16, 40, 0.2);
      border: 1px solid ${BRAND_CONFIG.borderColor};
    }
    .header {
      background-color: ${BRAND_CONFIG.headerBg};
      padding: 28px 20px;
      text-align: center;
      border-bottom: 3px solid ${BRAND_CONFIG.accentColor};
    }
    .content {
      padding: 36px 30px;
      line-height: 1.65;
    }
    .footer {
      background-color: ${BRAND_CONFIG.headerBg};
      padding: 26px 20px;
      text-align: center;
      font-size: 12px;
      color: ${BRAND_CONFIG.textDim};
      border-top: 1px solid ${BRAND_CONFIG.borderColor};
    }
    .footer a {
      color: ${BRAND_CONFIG.accentLight};
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      .container {
        width: 100% !important;
        border-radius: 0 !important;
      }
      .content {
        padding: 24px 18px !important;
      }
    }
  </style>
</head>
<body>
  <!-- Hidden Preheader -->
  <div style="display: none; font-size: 1px; color: #F0F4F8; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${finalPreviewText}
  </div>

  <div class="wrapper">
    <div class="container">
      
      <!-- Top Brand Header (Vibrant Modern Cyan Brand Display) -->
      <div class="header">
        <a href="${BRAND_CONFIG.websiteUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
          <div style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 24px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.5px; line-height: 1.2;">
            Monsur Ali <span style="color: ${BRAND_CONFIG.accentColor};">Travels</span>
          </div>
          <div style="font-family: 'Geist Mono', -apple-system, BlinkMacSystemFont, monospace; font-size: 11px; color: ${BRAND_CONFIG.accentLight}; letter-spacing: 2px; text-transform: uppercase; margin-top: 5px; font-weight: 600;">
            ERP &amp; Operations Management
          </div>
        </a>
      </div>

      <!-- Main Body Content -->
      <div class="content">
        ${badgeHtml}

        <h1 style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 22px; color: #FFFFFF; margin: 0 0 16px 0; text-align: center; font-weight: 700; letter-spacing: -0.2px;">
          ${title}
        </h1>

        ${greeting ? `<p style="font-size: 15px; color: #FFFFFF; font-weight: 600; margin: 0 0 12px 0;">${greeting}</p>` : ""}
        ${intro ? `<p style="font-size: 14px; color: ${BRAND_CONFIG.textColor}; line-height: 1.65; margin: 0 0 16px 0;">${intro}</p>` : ""}

        ${highlightBoxHtml}
        ${detailsTableHtml}
        ${itemsTableHtml}
        ${buttonHtml}

        ${secondaryContent ? `<div style="font-size: 13px; color: ${BRAND_CONFIG.textMuted}; line-height: 1.6; margin: 20px 0;">${secondaryContent}</div>` : ""}

        ${securityNote ? `
          <div style="border-top: 1px solid ${BRAND_CONFIG.borderColor}; padding-top: 18px; margin-top: 24px; font-size: 12px; color: ${BRAND_CONFIG.textDim}; line-height: 1.5;">
            🔒 <strong>Security Advisory:</strong> ${securityNote}
          </div>
        ` : ""}
      </div>

      <!-- Footer -->
      <div class="footer">
        <p style="margin: 0 0 8px 0; color: ${BRAND_CONFIG.textMuted};">
          &copy; ${currentYear} <a href="${BRAND_CONFIG.websiteUrl}" target="_blank">${BRAND_CONFIG.name}</a>. All rights reserved.
        </p>
        <p style="margin: 0 0 6px 0; font-size: 11px; color: ${BRAND_CONFIG.textDim};">
          ${BRAND_CONFIG.address} &bull; Support: <a href="mailto:${BRAND_CONFIG.supportEmail}">${BRAND_CONFIG.supportEmail}</a>
        </p>
        <p style="margin: 0; font-size: 10px; color: #475569;">
          This is an automated system notification from Monsur Ali Travels ERP.
        </p>
      </div>

    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Specialized Builder: OTP Email (2FA / Password Reset / Registration)
 */
export function buildOtpEmailHtml({ name, otp, type = "two-factor", logoUrl }) {
  const is2fa = type === "two-factor";
  const isForgot = type === "forgot-password";
  const isReg = type === "registration";

  const badge = is2fa ? "SECURITY VERIFICATION" : isForgot ? "ACCOUNT RECOVERY" : "ACCOUNT ACTIVATION";
  const title = is2fa
    ? "Two-Factor Authentication Code"
    : isForgot
    ? "Password Reset Request"
    : "Verify Your Email Address";
  const greeting = `Hello ${name || "there"},`;
  const intro = is2fa
    ? "A sign-in attempt requires two-factor verification. Please enter the 6-digit code below to complete your login to Monsur Ali Travels Dashboard."
    : isForgot
    ? "We received a request to reset your Monsur Ali Travels account password. Use the verification code below to authorize this request."
    : "Thank you for joining Monsur Ali Travels. Please use the verification code below to confirm your email and complete your registration.";

  const note = "Valid for 3 minutes. Do not share this code with anyone.";
  const securityNote =
    "If you did not request this code, please ignore this email or change your password immediately if you suspect unauthorized activity.";

  return buildMasterEmailHtml({
    badge,
    title,
    previewText: `Your verification code is ${otp}`,
    greeting,
    intro,
    highlightBox: {
      type: "otp",
      title: "One-Time Verification Code",
      code: otp,
      note,
    },
    securityNote,
    logoUrl,
  });
}

/**
 * Specialized Builder: 2FA Google Authenticator QR Code Setup
 */
export function buildTwoFactorQrEmailHtml({ name, secret, qrSrc = "cid:qrcode", logoUrl }) {
  return buildMasterEmailHtml({
    badge: "2FA SECURITY SETUP",
    title: "Set Up Google Authenticator",
    previewText: "Scan the QR code to set up Two-Factor Authentication",
    greeting: `Hello ${name || "Dashboard User"},`,
    intro:
      "You have requested to set up Google Authenticator (TOTP) for your Monsur Ali Travels account. Scan the QR code below or enter the key manually in your authenticator app.",
    highlightBox: {
      type: "qr",
      title: "Scan with Authenticator App",
      qrSrc,
      code: secret,
      note: "Supported apps: Google Authenticator, Microsoft Authenticator, 1Password, Authy.",
    },
    secondaryContent: `
      <div style="background-color: ${BRAND_CONFIG.cardBg}; border: 1px solid ${BRAND_CONFIG.borderColor}; border-radius: 6px; padding: 14px 16px;">
        <div style="font-weight: 600; color: #FFFFFF; font-size: 13px; margin-bottom: 8px;">Step-by-Step Instructions:</div>
        <ol style="margin: 0; padding-left: 18px; color: ${BRAND_CONFIG.textColor}; font-size: 12px; line-height: 1.7;">
          <li>Open your Authenticator app on your smartphone.</li>
          <li>Tap the <strong>+</strong> icon and select <strong>Scan QR code</strong>.</li>
          <li>Point your camera at the QR code above.</li>
          <li>Enter the generated 6-digit code on the dashboard to verify.</li>
        </ol>
      </div>
    `,
    securityNote:
      "Keep your secret key safe and never share it. If you did not initiate this setup, contact support immediately.",
    logoUrl,
  });
}

/**
 * Specialized Builder: Staff / User Account Invitation & Credentials
 */
export function buildStaffInvitationEmailHtml({
  name,
  toEmail,
  role = "Staff",
  subRole = "",
  tempPassword,
  loginUrl,
  invitedBy = "Administration",
  logoUrl,
}) {
  const isStaff = role === "Staff";
  const defaultLoginUrl = isStaff ? BRAND_CONFIG.clientDashboardUrl : BRAND_CONFIG.adminDashboardUrl;
  const finalLoginUrl = loginUrl || defaultLoginUrl;
  const displayRole = subRole ? `${role} (${subRole.replace(/_/g, " ")})` : role;

  return buildMasterEmailHtml({
    badge: "ACCOUNT ACCESS INVITATION",
    title: "Welcome to Monsur Ali Travels ERP",
    previewText: `You have been invited to join Monsur Ali Travels ERP as ${displayRole}`,
    greeting: `Hello ${name || "there"},`,
    intro: `You have been invited by <strong>${invitedBy}</strong> to access the Monsur Ali Travels ERP System as <strong>${displayRole}</strong>.`,
    highlightBox: {
      type: "credentials",
      title: "Your Account Login Credentials",
      details: [
        { label: "Login Portal", value: finalLoginUrl, isAccent: false },
        { label: "Email Address", value: toEmail, isAccent: false },
        { label: "Temporary Password", value: tempPassword, isAccent: true },
        { label: "Assigned Role", value: displayRole, isAccent: false },
      ],
      note: "Please log in and update your password immediately upon your first login.",
    },
    button: {
      text: isStaff ? "Open Staff Dashboard" : "Access Admin Dashboard",
      url: finalLoginUrl,
    },
    securityNote:
      "This temporary password expires upon first usage. Never disclose your login credentials to anyone.",
    logoUrl,
  });
}

/**
 * Specialized Builder: Task / Workflow Step Assignment
 */
export function buildTaskAssignmentEmailHtml({
  staffName,
  taskTitle,
  description = "",
  stepNumber = 1,
  caseNumber,
  caseTitle = "Visa Application Processing",
  clientName,
  serviceType,
  deadline,
  assignedBy = "Admin",
  caseUrl = BRAND_CONFIG.clientDashboardUrl,
  logoUrl,
}) {
  const finalCaseUrl = caseUrl || BRAND_CONFIG.clientDashboardUrl;
  const details = [
    { label: "Case Number", value: caseNumber || "N/A", isBold: true },
    { label: "Case Title", value: caseTitle, isAccent: false },
    { label: "Client Name", value: clientName || "N/A", isAccent: false },
    { label: "Service / Visa Type", value: serviceType || "General Processing", isAccent: false },
    { label: "Workflow Stage", value: `Step ${stepNumber}: ${taskTitle}`, isAccent: true },
    { label: "Assigned By", value: assignedBy, isAccent: false },
  ];

  if (deadline) {
    details.push({ label: "Target Deadline", value: deadline, isBold: true });
  }

  return buildMasterEmailHtml({
    badge: "WORKFLOW TASK ASSIGNED",
    title: "New Task Assigned to You",
    previewText: `New task assigned: ${taskTitle} for Case ${caseNumber}`,
    greeting: `Hello ${staffName || "Team Member"},`,
    intro: `A new workflow step has been assigned to you for processing. Please log in to your Staff Dashboard to view and execute this task.`,
    highlightBox: {
      type: "info",
      title: `Task: ${taskTitle}`,
      content: description || "Please review the client documents and execute the assigned workflow stage.",
    },
    detailsTable: details,
    button: {
      text: "Open Staff Dashboard / My Tasks",
      url: finalCaseUrl,
    },
    securityNote:
      "Confidential client documents are linked to this task. Follow agency data protection guidelines.",
    logoUrl,
  });
}

/**
 * Specialized Builder: Case File Status / Milestone Update
 */
export function buildCaseStatusUpdateEmailHtml({
  clientName,
  caseNumber,
  serviceType = "Visa Processing",
  newStatus,
  remarks = "",
  updatedBy = "Monsur Ali Travels Team",
  portalUrl = BRAND_CONFIG.websiteUrl,
  logoUrl,
}) {
  return buildMasterEmailHtml({
    badge: "CASE STATUS UPDATE",
    title: "Update on Your Application",
    previewText: `Case ${caseNumber} status updated to: ${newStatus}`,
    greeting: `Dear ${clientName || "Valued Client"},`,
    intro: `There is a new update regarding your application (<strong>Case #${caseNumber}</strong>) with Monsur Ali Travels.`,
    highlightBox: {
      type: "success",
      title: `Current Status: ${newStatus}`,
      content: remarks ? `<strong>Update Remarks:</strong> ${remarks}` : "Your application has progressed to the next processing milestone.",
    },
    detailsTable: [
      { label: "Case Number", value: caseNumber, isBold: true },
      { label: "Service Type", value: serviceType, isAccent: false },
      { label: "Latest Status", value: newStatus, isAccent: true },
      { label: "Updated On", value: new Date().toLocaleDateString(), isAccent: false },
      { label: "Processing Officer", value: updatedBy, isAccent: false },
    ],
    button: {
      text: "Track Application Online",
      url: portalUrl,
    },
    secondaryContent:
      "If you have any questions or require additional information, our dedicated support team is ready to assist you.",
    logoUrl,
  });
}

/**
 * Specialized Builder: Payment Receipt / Voucher Confirmation
 */
export function buildPaymentReceiptEmailHtml({
  clientName,
  receiptNo,
  amount,
  serviceType,
  purpose,
  paymentMethod = "Cash",
  paymentDate = new Date().toLocaleDateString(),
  receivedBy = "Accounts Dept.",
  remainingDue = 0,
  logoUrl,
}) {
  const details = [
    { label: "Receipt Number", value: receiptNo, isBold: true },
    { label: "Client Name", value: clientName, isAccent: false },
    { label: "Service / Case", value: serviceType || "Visa & Travel Services", isAccent: false },
    { label: "Purpose", value: purpose || "Payment Settlement", isAccent: false },
    { label: "Payment Method", value: paymentMethod, isAccent: false },
    { label: "Payment Date", value: paymentDate, isAccent: false },
    { label: "Received Amount", value: `BDT ${Number(amount).toLocaleString()}`, isAccent: true },
  ];

  if (Number(remainingDue) > 0) {
    details.push({ label: "Remaining Due", value: `BDT ${Number(remainingDue).toLocaleString()}`, isBold: true });
  }

  return buildMasterEmailHtml({
    badge: "PAYMENT RECEIPT",
    title: "Payment Confirmation",
    previewText: `Payment received: BDT ${Number(amount).toLocaleString()} (Receipt #${receiptNo})`,
    greeting: `Dear ${clientName || "Valued Client"},`,
    intro: `Thank you for your payment. We have successfully received and recorded your payment under Receipt <strong>#${receiptNo}</strong>.`,
    highlightBox: {
      type: "otp",
      title: "Amount Received",
      code: `BDT ${Number(amount).toLocaleString()}`,
      note: `Confirmed on ${paymentDate} by ${receivedBy}`,
    },
    detailsTable: details,
    secondaryContent:
      "This electronic receipt serves as official proof of payment. Please preserve this record for your files.",
    logoUrl,
  });
}

/**
 * Specialized Builder: Invoice Delivery
 */
export function buildInvoiceEmailHtml({
  invoiceNumber,
  createdDate,
  dueDate,
  buyerName,
  buyerEmail,
  items = [],
  total,
  subtotal,
  paymentMethod,
  invoiceUrl,
  logoUrl,
}) {
  const rows = items.map((it) => [
    it.description || it.productName || "Service Item",
    String(it.quantity || 1),
    `BDT ${(it.total || it.price || 0).toLocaleString()}`,
  ]);

  const summary = [
    { label: "Subtotal", value: `BDT ${(subtotal || total || 0).toLocaleString()}` },
    { label: "Total Amount", value: `BDT ${(total || 0).toLocaleString()}`, isTotal: true },
  ];

  return buildMasterEmailHtml({
    badge: "INVOICE",
    title: `Invoice #${invoiceNumber}`,
    previewText: `Invoice #${invoiceNumber} for BDT ${(total || 0).toLocaleString()}`,
    greeting: `Dear ${buyerName || "Valued Client"},`,
    intro: `Please find below the invoice details for the services provided by Monsur Ali Travels.`,
    detailsTable: [
      { label: "Invoice Number", value: invoiceNumber, isBold: true },
      { label: "Issue Date", value: createdDate || new Date().toLocaleDateString(), isAccent: false },
      { label: "Payment Due Date", value: dueDate || "Upon Receipt", isBold: true },
      { label: "Payment Mode", value: paymentMethod || "Standard", isAccent: false },
    ],
    itemsTable: {
      headers: ["Service / Description", "Qty", "Amount"],
      rows,
      summary,
    },
    button: invoiceUrl
      ? {
          text: "Download / View PDF Invoice",
          url: invoiceUrl,
        }
      : null,
    secondaryContent:
      "If you have already settled this invoice, please disregard this notice. For inquiries, reply to this email.",
    logoUrl,
  });
}

/**
 * Specialized Builder: Payroll / Salary Slip Email
 */
export function buildPayrollSlipEmailHtml({
  employeeName,
  employeeCode,
  designation,
  monthYear,
  netSalary,
  basicSalary,
  allowances = 0,
  deductions = 0,
  paymentDate = new Date().toLocaleDateString(),
  logoUrl,
}) {
  return buildMasterEmailHtml({
    badge: "PAYROLL NOTIFICATION",
    title: `Salary Slip — ${monthYear}`,
    previewText: `Salary slip for ${monthYear} is available`,
    greeting: `Hello ${employeeName || "Employee"},`,
    intro: `Your salary slip for <strong>${monthYear}</strong> has been processed and credited by Monsur Ali Travels Accounts Administration.`,
    highlightBox: {
      type: "otp",
      title: "Net Disbursed Salary",
      code: `BDT ${Number(netSalary).toLocaleString()}`,
      note: `Disbursed on ${paymentDate}`,
    },
    detailsTable: [
      { label: "Employee Name", value: employeeName, isAccent: false },
      { label: "Employee Code", value: employeeCode || "N/A", isAccent: false },
      { label: "Designation", value: designation || "Staff", isAccent: false },
      { label: "Salary Month", value: monthYear, isBold: true },
      { label: "Basic Salary", value: `BDT ${Number(basicSalary || 0).toLocaleString()}`, isAccent: false },
      { label: "Total Allowances", value: `BDT ${Number(allowances || 0).toLocaleString()}`, isAccent: false },
      { label: "Total Deductions", value: `BDT ${Number(deductions || 0).toLocaleString()}`, isAccent: false },
      { label: "Net Payable", value: `BDT ${Number(netSalary || 0).toLocaleString()}`, isAccent: true },
    ],
    secondaryContent:
      "For questions regarding tax deductions or allowance calculations, please consult the Accounts Department.",
    logoUrl,
  });
}
