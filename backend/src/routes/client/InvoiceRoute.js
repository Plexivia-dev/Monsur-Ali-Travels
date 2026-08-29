import { Router } from "express";
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  sendInvoiceByEmail,
} from "../../controllers/client/InvoiceController.js";

const invoiceRouter = Router();

// GET /api/v1/invoices & POST /api/v1/invoices
invoiceRouter
  .route("/")
  .get(getInvoices)
  .post(createInvoice);

// POST /api/v1/invoices/:id/send-email
invoiceRouter.post("/:id/send-email", sendInvoiceByEmail);

// GET /api/v1/invoices/:id & PUT/DELETE /api/v1/invoices/:id
invoiceRouter
  .route("/:id")
  .get(getInvoiceById)
  .put(updateInvoice)
  .delete(deleteInvoice);

export default invoiceRouter;
