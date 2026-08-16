import { InvoiceModel, generateUniqueInvoiceNo } from "../models/invoice.model.js";

// @desc    Get all invoices
// @route   GET /api/v1/docs/invoices
export const getInvoices = async (req, res, next) => {
  try {
    const invoices = await InvoiceModel.find().sort({ createdAt: -1 });
    return res.status(200).json({
      status: "success",
      results: invoices.length,
      data: invoices,
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
    const query = isMongoId ? { _id: id } : { invoiceNo: id };

    const invoice = await InvoiceModel.findOne(query);
    if (!invoice) {
      return res.status(404).json({
        status: "error",
        message: "Invoice not found",
      });
    }
    return res.status(200).json({
      status: "success",
      data: invoice,
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
    const newInvoice = await InvoiceModel.create(body);

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

    const deletedInvoice = await InvoiceModel.findOneAndDelete(query);
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
