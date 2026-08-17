import { Router } from "express";
import {
  getSalarySlips,
  getSalarySlipById,
  createSalarySlip,
  updateSalarySlip,
  deleteSalarySlip,
} from "../controllers/PayrollController.js";

const payrollRouter = Router();

// GET /api/v1/payrolls & POST /api/v1/payrolls
payrollRouter
  .route("/")
  .get(getSalarySlips)
  .post(createSalarySlip);

// GET /api/v1/payrolls/:id & PUT/DELETE /api/v1/payrolls/:id
payrollRouter
  .route("/:id")
  .get(getSalarySlipById)
  .put(updateSalarySlip)
  .delete(deleteSalarySlip);

export default payrollRouter;
