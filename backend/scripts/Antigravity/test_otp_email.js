import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import { env } from "../../src/config/env.js";
import { sendOtpEmail } from "../../src/utils/otpDelivery.js";
import { buildTwoFactorQrEmailHtml } from "../../src/templates/twoFactorEmailTemplate.js";
import QRCode from "qrcode";
import { authenticator } from "otplib";

const targetEmail = process.argv[2]?.trim() || "md.ikr4m@gmail.com";

async function run() {
  console.log("==========================================");
  console.log("📧 MONSUR ALI TRAVELS — EMAIL SYSTEM TEST");
  console.log("==========================================");
  console.log(`Target:      ${targetEmail}`);
  console.log(`SMTP Host:   ${env.SMTP_HOST}`);
  console.log(`SMTP Port:   ${env.SMTP_PORT}`);
  console.log(`SMTP User:   ${env.SMTP_USER}`);
  console.log("------------------------------------------\n");

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: String(env.SMTP_ENCRYPTION).toLowerCase() === "ssl" || Number(env.SMTP_PORT) === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
    },
  });

  console.log("1️⃣ Verifying SMTP connection...");
  await transporter.verify();
  console.log("   ✅ Connection verified successfully!\n");

  console.log("2️⃣ Sending General Test Email...");
  const info1 = await transporter.sendMail({
    from: `"${env.SMTP_FROM_NAME || 'Monsur Ali Travels'}" <${env.SMTP_FROM || env.SMTP_USER}>`,
    to: targetEmail,
    subject: "✅ Test Email — Monsur Ali Travels ERP System",
    text: `Hello,\n\nThis is a verified test email from Monsur Ali Travels backend server.\nTime: ${new Date().toISOString()}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff;">
        <h2 style="color: #0284c7; margin-top: 0;">Monsur Ali Travels ERP</h2>
        <p style="font-size: 16px; color: #1f2937;">Hello <strong>Ikramul</strong>,</p>
        <p style="color: #4b5563;">This is a test email confirming that the <strong>Monsur Ali Travels Email Delivery System</strong> is 100% active and functioning properly.</p>
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 12px; margin: 16px 0; color: #166534;">
          ✔ <strong>SMTP Host:</strong> ${env.SMTP_HOST}:${env.SMTP_PORT}<br/>
          ✔ <strong>Sender:</strong> ${env.SMTP_USER}<br/>
          ✔ <strong>Status:</strong> Active & Connected<br/>
          ✔ <strong>Timestamp:</strong> ${new Date().toLocaleString()}
        </div>
      </div>
    `,
  });
  console.log(`   ✅ General Email delivered! ID: ${info1.messageId}\n`);

  console.log("3️⃣ Sending 2FA Verification OTP Email (Branded Template)...");
  const otpResult = await sendOtpEmail({
    toEmail: targetEmail,
    otp: "749201",
    name: "Md Ikramul",
    type: "two-factor",
  });
  if (otpResult.delivered) {
    console.log("   ✅ 2FA OTP Email delivered successfully!\n");
  } else {
    console.error("   ❌ 2FA OTP Email delivery failed:", otpResult.reason);
  }

  console.log("4️⃣ Sending Google Authenticator QR Code Setup Email...");
  const mockSecret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(targetEmail, "Monsur Ali Travels BD", mockSecret);
  const qrCodeBuffer = await QRCode.toBuffer(otpauth, { width: 220, margin: 2 });
  const htmlContent = buildTwoFactorQrEmailHtml({ name: "Md Ikramul", secret: mockSecret });

  const info4 = await transporter.sendMail({
    from: `"${env.SMTP_FROM_NAME || 'Monsur Ali Travels'}" <${env.SMTP_FROM || env.SMTP_USER}>`,
    to: targetEmail,
    subject: "Set Up Two-Factor Authentication — Monsur Ali Travels Dashboard",
    text: `Hello Md Ikramul,\n\nScan the QR code in your Google Authenticator app to set up 2FA.\nCan't scan? Enter this key manually: ${mockSecret}`,
    html: htmlContent,
    attachments: [
      {
        filename: "qrcode.png",
        content: qrCodeBuffer,
        cid: "qrcode",
      },
    ],
  });
  console.log(`   ✅ 2FA QR Code Setup Email delivered! ID: ${info4.messageId}\n`);

  console.log("==========================================");
  console.log("🎉 ALL EMAIL SYSTEM TESTS PASSED SUCCESSFULLY!");
  console.log("==========================================");
}

run().catch((err) => {
  console.error("❌ Test Failed:", err);
  process.exit(1);
});

