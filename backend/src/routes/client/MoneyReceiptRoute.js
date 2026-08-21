import { Router } from "express";
import {
  getAllReceipts,
  getReceiptById,
  lookupReceipt,
  createReceipt,
  updateReceipt,
  generateQrEndpoint,
  confirmReceipt,
  cancelReceipt,
  updateBankDeposit,
  getReceiptSummary,
  deleteReceipt,
} from "../../controllers/client/MoneyReceiptController.js";

const moneyReceiptRouter = Router();

// Summary & Lookup & QR endpoints (must come before /:id)
moneyReceiptRouter.get("/summary", getReceiptSummary);
moneyReceiptRouter.get("/lookup", lookupReceipt);
moneyReceiptRouter.get("/qr-code", generateQrEndpoint);

// Core CRUD
moneyReceiptRouter.get("/", getAllReceipts);
moneyReceiptRouter.post("/", createReceipt);
moneyReceiptRouter.get("/:id", getReceiptById);
moneyReceiptRouter.put("/:id", updateReceipt);
moneyReceiptRouter.delete("/:id", deleteReceipt);

// State transitions & Workflow endpoints
moneyReceiptRouter.patch("/:id/confirm", confirmReceipt);
moneyReceiptRouter.patch("/:id/cancel", cancelReceipt);
moneyReceiptRouter.patch("/:id/bank-deposit", updateBankDeposit);

export default moneyReceiptRouter;
