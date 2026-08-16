import { Router } from "express";
import {
  getEmploymentAgreements,
  getEmploymentAgreementById,
  createEmploymentAgreement,
  updateEmploymentAgreement,
  deleteEmploymentAgreement,
} from "../controllers/AgreementController.js";
import {
  getSalarySlips,
  getSalarySlipById,
  createSalarySlip,
  updateSalarySlip,
  deleteSalarySlip,
} from "../controllers/PayrollController.js";
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} from "../controllers/InvoiceController.js";
import {
  getPassportSubmissions,
  getPassportSubmissionById,
  createPassportSubmission,
  updatePassportSubmission,
  deletePassportSubmission,
} from "../controllers/PassportSubmissionController.js";

const docsRouter = Router();

// /api/v1/docs/employment-agreement
docsRouter
  .route("/employment-agreement")
  .get(getEmploymentAgreements)
  .post(createEmploymentAgreement);

docsRouter
  .route("/employment-agreement/:id")
  .get(getEmploymentAgreementById)
  .put(updateEmploymentAgreement)
  .delete(deleteEmploymentAgreement);

// /api/v1/docs/payrolls
docsRouter
  .route("/payrolls")
  .get(getSalarySlips)
  .post(createSalarySlip);

docsRouter
  .route("/payrolls/:id")
  .get(getSalarySlipById)
  .put(updateSalarySlip)
  .delete(deleteSalarySlip);

// /api/v1/docs/invoices
docsRouter
  .route("/invoices")
  .get(getInvoices)
  .post(createInvoice);

docsRouter
  .route("/invoices/:id")
  .get(getInvoiceById)
  .put(updateInvoice)
  .delete(deleteInvoice);

// /api/v1/docs/passport-submissions
docsRouter
  .route("/passport-submissions")
  .get(getPassportSubmissions)
  .post(createPassportSubmission);

docsRouter
  .route("/passport-submissions/:id")
  .get(getPassportSubmissionById)
  .put(updatePassportSubmission)
  .delete(deletePassportSubmission);

export default docsRouter;
