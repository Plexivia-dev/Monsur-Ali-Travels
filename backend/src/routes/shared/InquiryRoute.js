import { Router } from "express";
import { NotificationModel } from "../../models/notification.model.js";
import { sendEmail } from "../../services/emailService.js";
import { buildMasterEmailHtml, BRAND_CONFIG } from "../../templates/commonEmailTemplate.js";
import { generateDid } from "../../utils/generateDid.js";

const inquiryRouter = Router();

/**
 * POST /api/v1/inquiries or /api/v1/contact
 * Handles public website inquiries with honeypot spam protection
 */
inquiryRouter.post("/", async (req, res) => {
  try {
    const {
      name,
      fullName,
      email,
      phone,
      service,
      serviceType,
      message,
      website_url_hp,
      phone_hp,
    } = req.body || {};

    // 1. Honeypot check for bots
    if (website_url_hp || phone_hp) {
      return res.status(200).json({
        status: "success",
        success: true,
        message: "Your inquiry has been received.",
      });
    }

    const clientName = (name || fullName || "Website Visitor").trim();
    const clientEmail = (email || "").trim();
    const clientPhone = (phone || "").trim();
    const requestedService = (service || serviceType || "General Inquiry").trim();
    const inquiryMessage = (message || "").trim();

    if (!clientEmail && !clientPhone) {
      return res.status(400).json({
        status: "error",
        success: false,
        message: "Please provide a valid email or phone number.",
      });
    }

    // 2. Create internal Notification for Admins / Owners
    try {
      await NotificationModel.create({
        did: generateDid(),
        title: `New Website Inquiry: ${requestedService}`,
        message: `From: ${clientName} (${clientPhone || clientEmail}) — "${inquiryMessage || "No message"}"`,
        module: "general",
        type: "info",
        recipientRole: "Admin",
        createdBy: clientName,
      });
    } catch (notifErr) {
      console.warn("[InquiryRoute] Notification creation notice:", notifErr.message);
    }

    // 3. Asynchronously send email notification to Monsur Ali Travels Office
    try {
      const emailHtml = buildMasterEmailHtml({
        badge: "NEW WEBSITE INQUIRY",
        title: `New Inquiry — ${requestedService}`,
        previewText: `Inquiry from ${clientName} for ${requestedService}`,
        greeting: "Hello Admin Team,",
        intro: `A new client inquiry has been submitted through the public website portal:`,
        highlightBox: {
          type: "info",
          title: "Inquiry Particulars",
          content: `
            <strong>Client Name:</strong> ${clientName}<br/>
            <strong>Email:</strong> ${clientEmail || "Not provided"}<br/>
            <strong>Phone:</strong> ${clientPhone || "Not provided"}<br/>
            <strong>Service Requested:</strong> ${requestedService}<br/>
            <strong>Timestamp:</strong> ${new Date().toLocaleString()}<br/>
            <strong>Message:</strong> ${inquiryMessage || "N/A"}
          `,
        },
        button: {
          text: "Open Admin Portal",
          url: BRAND_CONFIG.dashboardUrl,
        },
      });

      sendEmail({
        to: BRAND_CONFIG.companyEmail || "info@monsuralitravels.com",
        subject: `🌐 New Website Inquiry: ${clientName} (${requestedService})`,
        text: `New Website Inquiry from ${clientName}\nPhone: ${clientPhone}\nEmail: ${clientEmail}\nService: ${requestedService}\nMessage: ${inquiryMessage}`,
        html: emailHtml,
      }).catch((emailErr) => {
        console.warn("[InquiryRoute] Email dispatch notice:", emailErr.message);
      });
    } catch (emailErr) {
      console.warn("[InquiryRoute] Email trigger notice:", emailErr.message);
    }

    return res.status(200).json({
      status: "success",
      success: true,
      message: "Thank you! Your inquiry has been received. Our travel experts will get back to you shortly.",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      success: false,
      message: error.message || "Failed to submit inquiry. Please try again.",
    });
  }
});

export default inquiryRouter;
