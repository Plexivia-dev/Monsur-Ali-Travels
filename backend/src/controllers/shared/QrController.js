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
import EmployeeModel from "../../models/employee.model.js";
import { UserModel } from "../../models/user.model.js";
import MoneyReceiptModel from "../../models/moneyReceipt.model.js";
import CaseFile from "../../models/caseFile.model.js";
import EmploymentAgreementModel from "../../models/employmentAgreement.model.js";

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

/**
  * Public Verification Endpoint
  * Route: GET /api/v1/qr/verify/:identifier & GET /api/v1/qr/verify?id=...
  */
export const verifyRecord = async (req, res, next) => {
  try {
    const rawId = req.params.identifier || req.query.id || req.query.identifier || req.query.q;
    if (!rawId || !String(rawId).trim()) {
      return res.status(400).json({
        status: "error",
        success: false,
        message: "Identifier query or param is required for verification.",
      });
    }

    const id = String(rawId).trim();
    const isMongoId = id.match(/^[0-9a-fA-F]{24}$/);
    const searchRegex = new RegExp(`^${id}$`, "i");

    // 1. Check Employee / Staff ID Card
    const employee = await EmployeeModel.findOne({
      $or: [
        { did: id },
        { employeeCode: searchRegex },
        ...(isMongoId ? [{ _id: id }] : []),
      ],
    }).lean();

    if (employee) {
      let linkedUser = null;
      if (employee.userDid) {
        linkedUser = await UserModel.findOne({ did: employee.userDid }, "name email phone role subRole").lean();
      }
      return res.status(200).json({
        status: "success",
        success: true,
        verified: true,
        entityType: "Employee ID Card",
        data: {
          title: "Official Employee ID Card Verification",
          employeeCode: employee.employeeCode,
          name: employee.name || linkedUser?.name || "Official Staff",
          designation: employee.designation || "Executive",
          department: employee.department || "Operations",
          bloodGroup: employee.bloodGroup || "—",
          joinDate: employee.joinDate || employee.createdAt,
          status: employee.status || (employee.isActive ? "ACTIVE" : "INACTIVE"),
          agency: "Monsur Ali Travels",
          verifiedAt: new Date().toISOString(),
        },
      });
    }

    // 2. Check Money Receipt / Payment Voucher
    const receipt = await MoneyReceiptModel.findOne({
      $or: [
        { did: id },
        { receiptNo: searchRegex },
        ...(isMongoId ? [{ _id: id }] : []),
      ],
    }).lean();

    if (receipt) {
      return res.status(200).json({
        status: "success",
        success: true,
        verified: true,
        entityType: "Money Receipt Voucher",
        data: {
          title: "Official Money Receipt Voucher Verification",
          receiptNo: receipt.receiptNo,
          clientName: receipt.clientName,
          clientPhone: receipt.clientPhone ? `${receipt.clientPhone.slice(0, 4)}****${receipt.clientPhone.slice(-3)}` : "—",
          passportNumber: receipt.passportNumber || "—",
          serviceType: receipt.serviceType,
          amount: receipt.amount,
          currency: receipt.currency || "BDT",
          paymentMethod: receipt.paymentMethod,
          status: receipt.status || "confirmed",
          confirmedAt: receipt.confirmedAt || receipt.createdAt,
          issuedBy: receipt.createdByName || "Authorized Accounts Officer",
          agency: "Monsur Ali Travels",
          verifiedAt: new Date().toISOString(),
        },
      });
    }

    // 3. Check Case File / Work Permit Dossier
    const caseDoc = await CaseFile.findOne({
      $or: [
        { did: id },
        { caseNumber: searchRegex },
        { passportNumber: searchRegex },
        ...(isMongoId ? [{ _id: id }] : []),
      ],
    }).lean();

    if (caseDoc) {
      return res.status(200).json({
        status: "success",
        success: true,
        verified: true,
        entityType: "Case Processing Dossier",
        data: {
          title: "Overseas Visa & Work Permit Case Verification",
          caseNumber: caseDoc.caseNumber || caseDoc.did,
          applicantName: caseDoc.applicantName,
          destinationCountry: caseDoc.destinationCountry || caseDoc.caseType,
          tradeSkill: caseDoc.tradeSkill || "General",
          passportNumber: caseDoc.passportNumber || "—",
          status: caseDoc.status || "PROCESSING",
          workflowStatus: caseDoc.workflowStatus || "Active",
          agency: "Monsur Ali Travels",
          verifiedAt: new Date().toISOString(),
        },
      });
    }

    // 4. Check Invoice
    const invoice = await InvoiceModel.findOne({
      $or: [
        { did: id },
        { invoiceNo: searchRegex },
        ...(isMongoId ? [{ _id: id }] : []),
      ],
    }).lean();

    if (invoice) {
      return res.status(200).json({
        status: "success",
        success: true,
        verified: true,
        entityType: "Tax Invoice",
        data: {
          title: "Official Commercial Invoice Verification",
          invoiceNo: invoice.invoiceNo,
          clientName: invoice.client?.name || "Client",
          issueDate: invoice.issueDate,
          grandTotal: invoice.grandTotal,
          currency: invoice.currency || "BDT",
          paymentStatus: invoice.paymentStatus || "Paid",
          agency: "Monsur Ali Travels",
          verifiedAt: new Date().toISOString(),
        },
      });
    }

    // 5. Check Employment Agreement
    const agreement = await EmploymentAgreementModel.findOne({
      $or: [
        { did: id },
        { agreementNumber: searchRegex },
        ...(isMongoId ? [{ _id: id }] : []),
      ],
    }).lean();

    if (agreement) {
      return res.status(200).json({
        status: "success",
        success: true,
        verified: true,
        entityType: "Employment Agreement",
        data: {
          title: "Bilateral Candidate Employment Contract Verification",
          agreementNumber: agreement.agreementNumber || agreement.did,
          employeeName: agreement.parties?.employeeName || "Candidate",
          designation: agreement.position?.designation || "Worker",
          department: agreement.position?.department || "Overseas",
          agreementDate: agreement.parties?.agreementDate,
          agency: "Monsur Ali Travels",
          verifiedAt: new Date().toISOString(),
        },
      });
    }

    return res.status(404).json({
      status: "error",
      success: false,
      verified: false,
      message: `No authentic record found matching verification identifier: "${id}".`,
    });
  } catch (error) {
    next(error);
  }
};

