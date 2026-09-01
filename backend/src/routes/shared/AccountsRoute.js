import { Router } from "express";
import {
  getPayments,
  getBills,
  createBill,
  getBillById,
  updateBill,
  deleteBill,
  getSalaries,
  getExpenses,
  getCashBook,
  getBankLedger,
  getReportsSummary,
  exportReportCsv,
  getExportDownloads,
  downloadReportFile,
} from "../../controllers/shared/AccountsController.js";

const accountsRouter = Router();

// Accounts Data Endpoints
accountsRouter.get("/payments", getPayments);

// Company Expense Bills
accountsRouter.get("/bills", getBills);
accountsRouter.post("/bills", createBill);
accountsRouter.get("/bills/:id", getBillById);
accountsRouter.put("/bills/:id", updateBill);
accountsRouter.delete("/bills/:id", deleteBill);

accountsRouter.get("/salaries", getSalaries);
accountsRouter.get("/expenses", getExpenses);
accountsRouter.get("/cash-book", getCashBook);
accountsRouter.get("/bank-ledger", getBankLedger);

// Reports Summary & VPS Storage CSV Exports
accountsRouter.get("/reports/summary", getReportsSummary);
accountsRouter.post("/reports/export", exportReportCsv);
accountsRouter.get("/reports/downloads", getExportDownloads);
accountsRouter.get("/reports/download/:fileName", downloadReportFile);

export default accountsRouter;
