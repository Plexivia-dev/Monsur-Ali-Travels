import { Router } from "express";
import {
  getAllReceipts,
  getReceiptById,
  lookupReceipt,
  createReceipt,
  confirmReceipt,
  cancelReceipt,
  updateBankDeposit,
  getReceiptSummary,
  deleteReceipt,
} from "../controllers/MoneyReceiptController.js";

const moneyReceiptRouter = Router();

// Summary & Lookup endpoints (must come before /:id)
moneyReceiptRouter.get("/summary", getReceiptSummary);
moneyReceiptRouter.get("/lookup", lookupReceipt);

// Core CRUD
moneyReceiptRouter.get("/", getAllReceipts);
moneyReceiptRouter.post("/", createReceipt);
moneyReceiptRouter.get("/:id", getReceiptById);
moneyReceiptRouter.delete("/:id", deleteReceipt);

// State transitions & Workflow endpoints
moneyReceiptRouter.patch("/:id/confirm", confirmReceipt);
moneyReceiptRouter.patch("/:id/cancel", cancelReceipt);
moneyReceiptRouter.patch("/:id/bank-deposit", updateBankDeposit);

export default moneyReceiptRouter;
