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

export default docsRouter;
