import { Router } from 'express';
import InvoiceController from '../controllers/InvoiceController.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import {
  createInvoiceSchema,
  updateInvoiceSchema,
  listInvoiceSchema,
} from '../validations/invoice.validation.js';

const invoiceRouter = Router();

invoiceRouter.use(authenticateToken);

invoiceRouter.get('/', validate(listInvoiceSchema), InvoiceController.listInvoices);
invoiceRouter.post('/', validate(createInvoiceSchema), InvoiceController.createInvoice);
invoiceRouter.get('/:id', InvoiceController.getInvoiceById);
invoiceRouter.put('/:id', validate(updateInvoiceSchema), InvoiceController.updateInvoice);
invoiceRouter.delete('/:id', InvoiceController.deleteInvoice);

export default invoiceRouter;
