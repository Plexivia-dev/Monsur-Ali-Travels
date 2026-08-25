import { Router } from "express";
import {
  getPayments,
  getBills,
  getReportsSummary,
  exportReportCsv,
  getExportDownloads,
  downloadReportFile,
} from "../../controllers/shared/AccountsController.js";

const accountsRouter = Router();

// Accounts Data Endpoints
accountsRouter.get("/payments", getPayments);
accountsRouter.get("/bills", getBills);

// Reports Summary & VPS Storage CSV Exports
accountsRouter.get("/reports/summary", getReportsSummary);
accountsRouter.post("/reports/export", exportReportCsv);
accountsRouter.get("/reports/downloads", getExportDownloads);
accountsRouter.get("/reports/download/:fileName", downloadReportFile);

export default accountsRouter;
