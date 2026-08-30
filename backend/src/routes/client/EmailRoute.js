import { Router } from "express";
import { sendEmail, sendInvoiceEmail } from "../../services/emailService.js";
import { buildMasterEmailHtml, BRAND_CONFIG } from "../../templates/commonEmailTemplate.js";
import { env } from "../../config/env.js";

const emailRouter = Router();

const handleEmailRequest = async (req, res) => {
  const email = String(req.query?.email || req.body?.email || "").trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      status: "error",
      message: "Valid email is required",
    });
  }

  try {
    const html = buildMasterEmailHtml({
      badge: "SYSTEM VERIFICATION",
      title: "Email System Operational",
      previewText: "Test email confirming Monsur Ali Travels email system is fully functional.",
      greeting: "Hello System Administrator,",
      intro: "This is a test email confirming that the Monsur Ali Travels ERP Email Delivery System is fully functional.",
      highlightBox: {
        type: "success",
        title: "SMTP Connection Status: Active",
        content: `Server: <strong>${env.SMTP_HOST}:${env.SMTP_PORT}</strong><br/>Sender: <strong>${env.SMTP_USER}</strong><br/>Timestamp: <strong>${new Date().toLocaleString()}</strong>`,
      },
      button: {
        text: "Open Admin Dashboard",
        url: BRAND_CONFIG.dashboardUrl,
      },
    });

    const emailResult = await sendEmail({
      to: email,
      subject: "✅ Test Email — Monsur Ali Travels Email System",
      text: `Hello,\n\nThis is a verified test email from the Monsur Ali Travels ERP server.\nTimestamp: ${new Date().toISOString()}`,
      html,
    });

    if (!emailResult.delivered) {
      return res.status(500).json({
        status: "error",
        message: "Failed to send email",
        details: emailResult.reason,
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Email sent successfully",
      email,
      messageId: emailResult.messageId,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to send email",
      details: error.message,
    });
  }
};

const handleInvoiceRequest = async (req, res) => {
  const email = String(req.query?.email || req.body?.email || "").trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      status: "error",
      message: "Valid email is required",
    });
  }

  const invoiceNumber = req.body.invoiceNumber || req.query.invoiceNumber || `INV-${Date.now()}`;
  const buyerName = req.body.buyerName || req.query.buyerName || "Valued Client";
  const items = Array.isArray(req.body.items)
    ? req.body.items
    : [
        { description: "Visa Application & Legal Processing", price: 45000, total: 45000, quantity: 1 },
        { description: "Embassy Document Attestation & VFS Submission", price: 15000, total: 15000, quantity: 1 },
      ];
  const total = req.body.total || req.query.total || 60000;
  const subtotal = req.body.subtotal || req.query.subtotal || 60000;
  const paymentMethod = req.body.paymentMethod || req.query.paymentMethod || "Bank Transfer";

  try {
    const emailResult = await sendInvoiceEmail({
      toEmail: email,
      buyerName,
      invoiceNumber,
      createdDate: req.body.createdDate || new Date().toLocaleDateString(),
      dueDate: req.body.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      items,
      total,
      subtotal,
      paymentMethod,
      invoiceUrl: req.body.invoiceUrl || `https://admin.monsuralitravels.com/invoices/${invoiceNumber}`,
    });

    if (!emailResult.delivered) {
      return res.status(500).json({
        status: "error",
        message: "Failed to send invoice email",
        details: emailResult.reason,
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Invoice email sent successfully",
      email,
      invoiceNumber,
      messageId: emailResult.messageId,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to send invoice email",
      details: error.message,
    });
  }
};

emailRouter.get("/", handleEmailRequest);
emailRouter.post("/", handleEmailRequest);
emailRouter.post("/invoice", handleInvoiceRequest);

export default emailRouter;
