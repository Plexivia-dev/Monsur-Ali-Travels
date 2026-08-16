import { Router } from "express";
import {
  getEmploymentAgreements,
  getEmploymentAgreementById,
  createEmploymentAgreement,
  updateEmploymentAgreement,
  deleteEmploymentAgreement,
} from "../controllers/AgreementController.js";

const agreementRouter = Router();

// GET /api/v1/agreements & POST /api/v1/agreements
agreementRouter
  .route("/")
  .get(getEmploymentAgreements)
  .post(createEmploymentAgreement);

// GET /api/v1/agreements/:id & PUT/DELETE /api/v1/agreements/:id
agreementRouter
  .route("/:id")
  .get(getEmploymentAgreementById)
  .put(updateEmploymentAgreement)
  .delete(deleteEmploymentAgreement);

export default agreementRouter;
