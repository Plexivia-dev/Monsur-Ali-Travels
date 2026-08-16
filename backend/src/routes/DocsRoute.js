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
import { IndianVisaController } from "../controllers/IndianVisaController.js";
import { CustomerGuardianController } from "../controllers/CustomerGuardianController.js";

const docsRouter = Router();

// /api/v1/docs/employment-agreement & /api/v1/docs/agreements
docsRouter
  .route(["/employment-agreement", "/agreements"])
  .get(getEmploymentAgreements)
  .post(createEmploymentAgreement);

docsRouter
  .route(["/employment-agreement/:id", "/agreements/:id"])
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

// /api/v1/docs/passport-submissions & /api/v1/docs/passports
docsRouter
  .route(["/passport-submissions", "/passports"])
  .get(getPassportSubmissions)
  .post(createPassportSubmission);

docsRouter
  .route(["/passport-submissions/:id", "/passports/:id"])
  .get(getPassportSubmissionById)
  .put(updatePassportSubmission)
  .delete(deletePassportSubmission);

// /api/v1/docs/indian-visas
docsRouter
  .route("/indian-visas")
  .get(IndianVisaController.getAll)
  .post(IndianVisaController.create);

docsRouter
  .route("/indian-visas/:id")
  .get(IndianVisaController.getById)
  .put(IndianVisaController.update)
  .delete(IndianVisaController.delete);

// /api/v1/docs/customer-guardians & /api/v1/docs/customer-forms
docsRouter
  .route(["/customer-guardians", "/customer-forms"])
  .get(CustomerGuardianController.getAll)
  .post(CustomerGuardianController.create);

docsRouter
  .route(["/customer-guardians/:id", "/customer-forms/:id"])
  .get(CustomerGuardianController.getById)
  .put(CustomerGuardianController.update)
  .delete(CustomerGuardianController.delete);

docsRouter
  .route(["/customer-guardians/:id/status", "/customer-forms/:id/status"])
  .patch(CustomerGuardianController.updateStatus);

// Common Dedicated File Upload Endpoints under /api/v1/docs/upload
import uploadRouter from "./UploadRoute.js";
docsRouter.use("/upload", uploadRouter);

export default docsRouter;
