import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";
import { buildOtpEmailHtml } from "../../templates/otpEmailTemplate.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Cached SMTP transport connection instance
let defaultTransport;

// Dynamically retrieve/initialize SMTP transport to avoid race conditions with dotenv load order
function getTransport() {
  if (!defaultTransport) {
    defaultTransport = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.hostinger.com",
      port: Number(process.env.SMTP_PORT || 465),
      secure: (process.env.SMTP_ENCRYPTION || "SSL").toLowerCase() === "ssl",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
  return defaultTransport;
}

export async function sendOtpEmail({
  toEmail,
  otp,
  name,
  type = "registration",
  transport,
  log = console,
}) {
  const activeTransport = transport || getTransport();

  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    return {
      delivered: false,
      reason: "SMTP credentials are not configured",
    };
  }

  const isForgotPassword = type === "forgot-password";
  const subject = isForgotPassword
    ? "Your Monsur Ali Travels Password Reset Code"
    : "Your OTP verification code";
  const text = isForgotPassword
    ? `Hello ${name || "there"},\n\nUse this OTP to reset your Monsur Ali Travels password: ${otp}\nThis code will expire in 3 minutes.\n\nIf you did not request this, please ignore this email.`
    : `Hello ${name || "there"},\n\nYour OTP verification code is ${otp}.\nThis code will expire in 3 minutes.\n\nThank you.`;
  const html = buildOtpEmailHtml({ name, otp, type });

  // Format sender address to display the business name
  const fromName = process.env.SMTP_FROM_NAME || "Monsur Ali Travels BD";
  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
  const fromAddress = `"${fromName}" <${fromEmail}>`;

  try {
    await activeTransport.sendMail({
      from: fromAddress,
      to: toEmail,
      subject,
      text,
      html,
      attachments: [
        {
          filename: 'logo.webp',
          path: path.join(__dirname, '../assets/logo.webp'),
          cid: 'logo' // maps to src="cid:logo" in email HTML
        }
      ]
    });

    return { delivered: true };
  } catch (error) {
    log.warn?.({ error, toEmail }, "OTP email delivery failed");
    return {
      delivered: false,
      reason: error.message || "OTP email delivery failed",
    };
  }
}
