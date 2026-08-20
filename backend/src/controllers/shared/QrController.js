import {
  getAgencyInfo,
  formatAgencyQrText,
  formatInvoiceQrText,
  generateQrBuffer,
  generateQrSvg,
  generateQrDataUrl,
  getCachedAgencyQr
} from "../../utils/qrHelper.js";
import { InvoiceModel } from "../../models/invoice.model.js";

/**
 * Universal Dynamic QR Code Generator
 * Route: GET /api/v1/qr & POST /api/v1/qr
 */
export const generateUniversalQr = async (req, res, next) => {
  try {
    const params = req.method === "POST" ? { ...req.query, ...req.body } : req.query;
    const {
      data,
      text,
      type = "custom",
      mode = "text",
      format = "dataurl",
      size = 300,
      width,
      margin = 2,
      ec = "M",
      color,
      dark,
      bgcolor,
      light
    } = params;

    let payloadText = text || data;

    // If type is agency or payload text is missing and type is agency, use agency info
    if (type === "agency" || (!payloadText && type !== "custom")) {
      payloadText = formatAgencyQrText(mode);
    }

    if (!payloadText) {
      return res.status(400).json({
        status: "error",
        message: "Missing 'data' or 'text' query/body parameter."
      });
    }

    const qrOptions = {
      size: width || size,
      margin,
      ec,
      color: dark || color,
      bgcolor: light || bgcolor
    };

    // Long-lived cache for idempotent requests
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

    switch (format.toLowerCase()) {
      case "svg": {
        const svg = await generateQrSvg(payloadText, qrOptions);
        res.setHeader("Content-Type", "image/svg+xml");
        return res.send(svg);
      }

      case "png": {
        const buffer = await generateQrBuffer(payloadText, qrOptions);
        res.setHeader("Content-Type", "image/png");
        return res.send(buffer);
      }

      case "dataurl":
      case "json":
      default: {
        const dataUrl = await generateQrDataUrl(payloadText, qrOptions);
        return res.status(200).json({
          status: "success",
          success: true,
          type,
          format: "dataurl",
          dataUrl,
          payload: payloadText
        });
      }
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get Agency Branding QR Code (Cached)
 * Route: GET /api/v1/qr/agency
 */
export const getAgencyQr = async (req, res, next) => {
  try {
    const {
      format = "dataurl",
      mode = "text",
      size = 300,
      width,
      margin = 2,
      ec = "M",
      color,
      bgcolor
    } = req.query;

    const qrOptions = {
      size: width || size,
      margin,
      ec,
      color,
      bgcolor
    };

    const agencyInfo = getAgencyInfo();
    const payloadText = formatAgencyQrText(mode, agencyInfo);

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");

    if (format.toLowerCase() === "svg") {
      const svg = await getCachedAgencyQr("svg", mode, qrOptions);
      res.setHeader("Content-Type", "image/svg+xml");
      return res.send(svg);
    }

    if (format.toLowerCase() === "png") {
      const buffer = await getCachedAgencyQr("png", mode, qrOptions);
      res.setHeader("Content-Type", "image/png");
      return res.send(buffer);
    }

    const dataUrl = await getCachedAgencyQr("dataurl", mode, qrOptions);
    return res.status(200).json({
      status: "success",
      success: true,
      agency: agencyInfo.agencyName,
      mode,
      format: "dataurl",
      dataUrl,
      payload: payloadText
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Specific Invoice Verification QR Code
 * Route: GET /api/v1/qr/invoice/:id
 */
export const getInvoiceQr = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      format = "dataurl",
      size = 300,
      width,
      margin = 2,
      ec = "M",
      color,
      bgcolor
    } = req.query;

    const isMongoId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isMongoId ? { _id: id, isActive: { $ne: false } } : { invoiceNo: id, isActive: { $ne: false } };

    const invoice = await InvoiceModel.findOne(query);
    if (!invoice) {
      return res.status(404).json({
        status: "error",
        message: "Invoice not found"
      });
    }

    const payloadText = formatInvoiceQrText(invoice);
    const qrOptions = {
      size: width || size,
      margin,
      ec,
      color,
      bgcolor
    };

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "public, max-age=86400");

    if (format.toLowerCase() === "svg") {
      const svg = await generateQrSvg(payloadText, qrOptions);
      res.setHeader("Content-Type", "image/svg+xml");
      return res.send(svg);
    }

    if (format.toLowerCase() === "png") {
      const buffer = await generateQrBuffer(payloadText, qrOptions);
      res.setHeader("Content-Type", "image/png");
      return res.send(buffer);
    }

    const dataUrl = await generateQrDataUrl(payloadText, qrOptions);
    return res.status(200).json({
      status: "success",
      success: true,
      invoiceNo: invoice.invoiceNo,
      format: "dataurl",
      dataUrl,
      payload: payloadText
    });
  } catch (error) {
    next(error);
  }
};
