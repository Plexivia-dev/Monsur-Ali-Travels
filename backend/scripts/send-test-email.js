import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const recipient = process.argv[2]?.trim() || "mr.monsur1988@gmail.com";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.hostinger.com",
  port: Number(process.env.SMTP_PORT || 587),
  secure: (process.env.SMTP_ENCRYPTION || "TLS").toLowerCase() === "ssl",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendTestEmail = async () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    throw new Error("SMTP credentials are not configured in the environment");
  }

  await transporter.verify();

  const info = await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: recipient,
    subject: "Test email from Monsur Ali Travels backend",
    text: "This is a test email from the backend.",
    html: "<p>This is a test email from the backend.</p>",
  });

  console.log(`Email sent successfully to ${recipient}`);
  console.log(`Message ID: ${info.messageId}`);
};

sendTestEmail().catch((error) => {
  console.error("Failed to send email:", error.message);
  process.exit(1);
});
