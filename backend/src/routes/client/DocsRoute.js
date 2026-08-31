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
  updatePassportStage,
} from "../../controllers/client/PassportSubmissionController.js";
import { IndianVisaController } from "../../controllers/client/IndianVisaController.js";
import { ClientGuardianController } from "../../controllers/client/ClientGuardianController.js";

import {
  getAllCashVouchers,
  getCashVoucherById,
  createCashVoucher,
  updateCashVoucher,
  deleteCashVoucher,
} from "../../controllers/CashVoucherController.js";
import {
  getAllReceipts,
  getReceiptById,
  createReceipt,
  updateReceipt,
  deleteReceipt,
  confirmReceipt,
  cancelReceipt,
  updateBankDeposit,
} from "../../controllers/client/MoneyReceiptController.js";

const docsRouter = Router();

// /api/v1/docs/employment-agreements, /employment-agreement, /agreements
docsRouter
  .route(["/employment-agreements", "/employment-agreement", "/agreements", "/agreement"])
  .get(getEmploymentAgreements)
  .post(createEmploymentAgreement);

docsRouter
  .route([
    "/employment-agreements/:id",
    "/employment-agreement/:id",
    "/agreements/:id",
    "/agreement/:id",
  ])
  .get(getEmploymentAgreementById)
  .put(updateEmploymentAgreement)
  .delete(deleteEmploymentAgreement);

// /api/v1/docs/salary-slips, /payrolls, /payroll
docsRouter
  .route(["/salary-slips", "/salary-slip", "/payrolls", "/payroll"])
  .get(getSalarySlips)
  .post(createSalarySlip);

docsRouter
  .route([
    "/salary-slips/:id",
    "/salary-slip/:id",
    "/payrolls/:id",
    "/payroll/:id",
  ])
  .get(getSalarySlipById)
  .put(updateSalarySlip)
  .delete(deleteSalarySlip);

// /api/v1/docs/invoices
docsRouter
  .route(["/invoices", "/invoice"])
  .get(getInvoices)
  .post(createInvoice);

docsRouter
  .route(["/invoices/:id", "/invoice/:id"])
  .get(getInvoiceById)
  .put(updateInvoice)
  .delete(deleteInvoice);

// /api/v1/docs/passport-submissions & /api/v1/docs/passports
docsRouter
  .route(["/passport-submissions", "/passport-submission", "/passports", "/passport"])
  .get(getPassportSubmissions)
  .post(createPassportSubmission);

docsRouter
  .route([
    "/passport-submissions/:id",
    "/passport-submission/:id",
    "/passports/:id",
    "/passport/:id",
  ])
  .get(getPassportSubmissionById)
  .put(updatePassportSubmission)
  .delete(deletePassportSubmission);

docsRouter.patch(
  [
    "/passport-submissions/:id/stage",
    "/passport-submission/:id/stage",
    "/passports/:id/stage",
    "/passport/:id/stage",
  ],
  updatePassportStage
);

// /api/v1/docs/indian-visas
docsRouter
  .route(["/indian-visas", "/indian-visa"])
  .get(IndianVisaController.getAll)
  .post(IndianVisaController.create);

docsRouter
  .route(["/indian-visas/:id", "/indian-visa/:id"])
  .get(IndianVisaController.getById)
  .put(IndianVisaController.update)
  .delete(IndianVisaController.delete);

docsRouter.patch(
  ["/indian-visas/:id/stage", "/indian-visa/:id/stage"],
  IndianVisaController.updateStage
);

// /api/v1/docs/client-guardians & /api/v1/docs/customer-guardians & /client-forms
docsRouter
  .route([
    "/client-guardians",
    "/client-guardian",
    "/customer-guardians",
    "/customer-guardian",
    "/client-forms",
    "/client-form",
  ])
  .get(ClientGuardianController.getAll)
  .post(ClientGuardianController.create);

docsRouter
  .route([
    "/client-guardians/:id",
    "/client-guardian/:id",
    "/customer-guardians/:id",
    "/customer-guardian/:id",
    "/client-forms/:id",
    "/client-form/:id",
  ])
  .get(ClientGuardianController.getById)
  .put(ClientGuardianController.update)
  .delete(ClientGuardianController.delete);

docsRouter
  .route([
    "/client-guardians/:id/status",
    "/client-guardian/:id/status",
    "/customer-guardians/:id/status",
    "/customer-guardian/:id/status",
    "/client-forms/:id/status",
    "/client-form/:id/status",
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

// /api/v1/docs/cash-vouchers
docsRouter
  .route(["/cash-vouchers", "/cash-voucher"])
  .get(getAllCashVouchers)
  .post(createCashVoucher);

docsRouter
  .route(["/cash-vouchers/:id", "/cash-voucher/:id"])
  .get(getCashVoucherById)
  .put(updateCashVoucher)
  .delete(deleteCashVoucher);

// /api/v1/docs/receipts & /api/v1/docs/money-receipts
docsRouter
  .route(["/receipts", "/receipt", "/money-receipts", "/money-receipt"])
  .get(getAllReceipts)
  .post(createReceipt);

docsRouter
  .route([
    "/receipts/:id",
    "/receipt/:id",
    "/money-receipts/:id",
    "/money-receipt/:id",
  ])
  .get(getReceiptById)
  .put(updateReceipt)
  .delete(deleteReceipt);

docsRouter.patch(
  ["/receipts/:id/confirm", "/money-receipts/:id/confirm"],
  confirmReceipt
);
docsRouter.patch(
  ["/receipts/:id/cancel", "/money-receipts/:id/cancel"],
  cancelReceipt
);
docsRouter.patch(
  ["/receipts/:id/bank-deposit", "/money-receipts/:id/bank-deposit"],
  updateBankDeposit
);

// Common Dedicated File Upload Endpoints under /api/v1/docs/upload
import uploadRouter from "../shared/UploadRoute.js";
docsRouter.use("/upload", uploadRouter);

export default docsRouter;
