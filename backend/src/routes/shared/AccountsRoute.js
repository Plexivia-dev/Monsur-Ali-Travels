import { Router } from "express";
import { authorizeRoles } from "../../middlewares/auth.middleware.js";
import {
  getPayments,
  getBills,
  createBill,
  getBillById,
  updateBill,
  deleteBill,
  settleBillPayment,
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

// Strict RBAC: Only Owner and Accountant (and Superadmin) can access accounts & ledger functions
accountsRouter.use(authorizeRoles("Owner", "Superadmin", "Accountant", "Accounts"));

// Accounts Data Endpoints
accountsRouter.get("/payments", getPayments);

// Company Expense Bills
accountsRouter.get("/bills", getBills);
accountsRouter.post("/bills", createBill);
accountsRouter.get("/bills/:id", getBillById);
accountsRouter.put("/bills/:id", updateBill);
accountsRouter.delete("/bills/:id", deleteBill);
accountsRouter.post("/bills/:id/settle", settleBillPayment);

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
