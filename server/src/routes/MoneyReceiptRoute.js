import { Router } from 'express';
import MoneyReceiptController from '../controllers/MoneyReceiptController.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import {
  createReceiptSchema,
  confirmReceiptSchema,
  cancelReceiptSchema,
  bankDepositSchema,
  listReceiptsSchema,
} from '../validations/receipt.validation.js';

const receiptRouter = Router();

receiptRouter.use(authenticateToken);

// Special routes before parameterized :id
receiptRouter.get('/summary', MoneyReceiptController.getReceiptSummary);
receiptRouter.get('/lookup', MoneyReceiptController.lookupReceipts);

// Standard CRUD & Workflow Endpoints
receiptRouter.get('/', validate(listReceiptsSchema), MoneyReceiptController.listReceipts);
receiptRouter.post('/', validate(createReceiptSchema), MoneyReceiptController.createReceipt);
receiptRouter.get('/:id', MoneyReceiptController.getReceiptById);
receiptRouter.patch('/:id/confirm', validate(confirmReceiptSchema), MoneyReceiptController.confirmReceipt);
receiptRouter.patch('/:id/cancel', validate(cancelReceiptSchema), MoneyReceiptController.cancelReceipt);
receiptRouter.patch('/:id/bank-deposit', validate(bankDepositSchema), MoneyReceiptController.updateBankDeposit);
receiptRouter.delete('/:id', MoneyReceiptController.deleteReceipt);

export default receiptRouter;
