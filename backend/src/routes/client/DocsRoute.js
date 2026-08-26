import { Router } from "express";
import {
  getEmploymentAgreements,
  getEmploymentAgreementById,
  createEmploymentAgreement,
  updateEmploymentAgreement,
  deleteEmploymentAgreement,
} from "../../controllers/client/AgreementController.js";
import {
  getSalarySlips,
  getSalarySlipById,
  createSalarySlip,
  updateSalarySlip,
  deleteSalarySlip,
} from "../../controllers/client/PayrollController.js";
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} from "../../controllers/client/InvoiceController.js";
import {
  getPassportSubmissions,
  getPassportSubmissionById,
  createPassportSubmission,
  updatePassportSubmission,
  deletePassportSubmission,
} from "../../controllers/client/PassportSubmissionController.js";
import { IndianVisaController } from "../../controllers/client/IndianVisaController.js";
import { ClientGuardianController } from "../../controllers/client/ClientGuardianController.js";

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

// /api/v1/docs/client-guardians & /api/v1/docs/client-forms
docsRouter
  .route(["/client-guardians", "/client-forms", "/client-guardians", "/client-forms"])
  .get(ClientGuardianController.getAll)
  .post(ClientGuardianController.create);

docsRouter
  .route(["/client-guardians/:id", "/client-forms/:id", "/client-guardians/:id", "/client-forms/:id"])
  .get(ClientGuardianController.getById)
  .put(ClientGuardianController.update)
  .delete(ClientGuardianController.delete);

docsRouter
  .route([
    "/client-guardians/:id/status",
    "/client-forms/:id/status",
    "/client-guardians/:id/status",
    "/client-forms/:id/status",
  ])
  .patch(ClientGuardianController.updateStatus);

import { JobVerificationController } from "../../controllers/client/JobVerificationController.js";

// /api/v1/docs/job-verifications
docsRouter
  .route(["/job-verifications", "/job-verification"])
  .get(JobVerificationController.getAll)
  .post(JobVerificationController.create);

docsRouter
  .route(["/job-verifications/:id", "/job-verification/:id"])
  .get(JobVerificationController.getById)
  .put(JobVerificationController.update)
  .delete(JobVerificationController.delete);

// Common Dedicated File Upload Endpoints under /api/v1/docs/upload
import uploadRouter from "../shared/UploadRoute.js";
docsRouter.use("/upload", uploadRouter);

export default docsRouter;
