import { InvoiceModel, generateUniqueInvoiceNo } from "../../models/invoice.model.js";
import { formatInvoiceQrText, generateQrDataUrl } from "../../utils/qrHelper.js";
import {
  sendPaymentDocCreatedEmailToAccountants,
  sendPaymentOrBillCreatedEmailToOwners,
} from "../../services/emailNotification.service.js";

// @desc    Get all invoices
// @route   GET /api/v1/docs/invoices
export const getInvoices = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = req.query.limit !== undefined ? Math.max(1, parseInt(req.query.limit, 10) || 10) : 10;
    const skip = req.query.skip !== undefined ? Math.max(0, parseInt(req.query.skip, 10)) : (page - 1) * limit;
    const { search, status } = req.query;

    const query = {};
    query.isActive = { $ne: false };

    if (status && status !== "all") {
      query.paymentStatus = status;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { invoiceNo: searchRegex },
        { "client.name": searchRegex },
        { "client.phone": searchRegex },
        { "client.email": searchRegex },
        { "client.contactPerson": searchRegex },
      ];
    }

    const totalCount = await InvoiceModel.countDocuments(query);
    const invoices = await InvoiceModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const enrichedInvoices = await Promise.all(
      invoices.map(async (inv) => {
        const obj = inv.toObject();
        if (!obj.qrCode) {
          try {
            const qrText = formatInvoiceQrText(obj);
            obj.qrCode = await generateQrDataUrl(qrText, { size: 250, margin: 1 });
          } catch (err) {}
        }
        return obj;
      })
    );

    const totalPages = Math.ceil(totalCount / limit) || 1;

    return res.status(200).json({
      status: "success",
      success: true,
      results: enrichedInvoices.length,
      data: enrichedInvoices,
      pagination: {
        skip,
        limit,
        totalCount,
        page,
        totalPages,
        hasNextPage: skip + invoices.length < totalCount,
        hasPrevPage: skip > 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single invoice by ID or invoiceNo
// @route   GET /api/v1/docs/invoices/:id
export const getInvoiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isMongoId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isMongoId ? { _id: id, isActive: { $ne: false } } : { invoiceNo: id, isActive: { $ne: false } };

    const invoice = await InvoiceModel.findOne(query);
    if (!invoice) {
      return res.status(404).json({
        status: "error",
        message: "Invoice not found",
      });
    }

    let invoiceData = invoice.toObject();
    if (!invoiceData.qrCode) {
      try {
        const qrText = formatInvoiceQrText(invoiceData);
        invoiceData.qrCode = await generateQrDataUrl(qrText, { size: 250, margin: 1 });
      } catch (err) {
        // silent fallback
      }
    }

    return res.status(200).json({
      status: "success",
      data: invoiceData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new invoice
// @route   POST /api/v1/docs/invoices
export const createInvoice = async (req, res, next) => {
  try {
    const body = req.body ?? {};
    if (!body.invoiceNo) {
      body.invoiceNo = generateUniqueInvoiceNo();
    }

    if (!body.qrCode) {
      try {
        const qrText = formatInvoiceQrText(body);
        body.qrCode = await generateQrDataUrl(qrText, { size: 250, margin: 1 });
      } catch (err) {
        console.warn("QR code generation error on invoice create:", err.message);
      }
    }

    const newInvoice = await InvoiceModel.create(body);

    const creatorName = req.user?.name || "Staff Member";
    const invoiceGrandTotal = newInvoice.items?.reduce((acc, it) => acc + (Number(it.quantity || 1) * Number(it.unitPrice || 0)), 0) || 0;

    // Action 3: Email Accountant
    sendPaymentDocCreatedEmailToAccountants({
      createdByUserName: creatorName,
      docType: "Invoice",
      docNumber: newInvoice.invoiceNo,
      amount: invoiceGrandTotal,
      clientName: newInvoice.client?.name || "",
    }).catch((err) => console.error("[EmailTrigger] sendPaymentDocCreatedEmailToAccountants (Invoice) error:", err.message));

    // Action 4: Email Owners for new bill/invoice
    sendPaymentOrBillCreatedEmailToOwners({
      createdByUserName: creatorName,
      type: "Invoice / Bill",
      refNumber: newInvoice.invoiceNo,
      amount: invoiceGrandTotal,
      notes: `Invoice billed to ${newInvoice.client?.name || "Client"}`,
    }).catch((err) => console.error("[EmailTrigger] sendPaymentOrBillCreatedEmailToOwners (Invoice) error:", err.message));

    return res.status(201).json({
      status: "success",
      message: "Invoice created successfully",
      data: newInvoice,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update existing invoice
// @route   PUT /api/v1/docs/invoices/:id
export const updateInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isMongoId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isMongoId ? { _id: id } : { invoiceNo: id };

    if (req.body) {
      try {
        const qrText = formatInvoiceQrText(req.body);
        req.body.qrCode = await generateQrDataUrl(qrText, { size: 250, margin: 1 });
      } catch (err) {
        console.warn("QR code generation error on invoice update:", err.message);
      }
    }

    const updatedInvoice = await InvoiceModel.findOneAndUpdate(query, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedInvoice) {
      return res.status(404).json({
        status: "error",
        message: "Invoice not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Invoice updated successfully",
      data: updatedInvoice,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete invoice
// @route   DELETE /api/v1/docs/invoices/:id
export const deleteInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isMongoId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isMongoId ? { _id: id } : { invoiceNo: id };

    const deletedInvoice = await InvoiceModel.findOneAndUpdate(query, { isActive: false }, { new: true });
    if (!deletedInvoice) {
      return res.status(404).json({
        status: "error",
        message: "Invoice not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send Invoice via Email
// @route   POST /api/v1/docs/invoices/:id/send-email
export const sendInvoiceByEmail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isMongoId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isMongoId ? { _id: id, isActive: { $ne: false } } : { invoiceNo: id, isActive: { $ne: false } };

    const invoice = await InvoiceModel.findOne(query);
    if (!invoice) {
      return res.status(404).json({ status: "error", message: "Invoice not found" });
    }

    const targetEmail = (req.body?.email || invoice.client?.email || "").trim();
    if (!targetEmail || !targetEmail.includes("@")) {
      return res.status(400).json({ status: "error", message: "A valid recipient email is required" });
    }

    const { sendInvoiceEmail } = await import("../../services/emailService.js");
    const emailResult = await sendInvoiceEmail({
      toEmail: targetEmail,
      buyerName: invoice.client?.name || "Valued Client",
      invoiceNumber: invoice.invoiceNo,
      createdDate: invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : new Date().toLocaleDateString(),
      dueDate: invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "Upon Receipt",
      items: invoice.items || [],
      total: invoice.grandTotal || invoice.totalAmount || 0,
      subtotal: invoice.subTotal || 0,
      paymentMethod: invoice.paymentMethod || "Standard",
    });

    return res.status(200).json({
      status: emailResult.delivered ? "success" : "error",
      message: emailResult.delivered ? `Invoice sent successfully to ${targetEmail}` : `Failed to send email: ${emailResult.reason}`,
      data: { emailDelivered: emailResult.delivered, recipient: targetEmail },
    });
  } catch (error) {
    next(error);
  }
};

