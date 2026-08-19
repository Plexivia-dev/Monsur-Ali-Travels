import { Router } from 'express';
import PayrollController from '../controllers/PayrollController.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import {
  createSalarySlipSchema,
  listDocumentsSchema,
} from '../validations/document.validation.js';

const payrollRouter = Router();

payrollRouter.use(authenticateToken);

payrollRouter.get('/', validate(listDocumentsSchema), PayrollController.listSlips);
payrollRouter.post('/', validate(createSalarySlipSchema), PayrollController.createSlip);
payrollRouter.get('/:id', PayrollController.getSlipById);
payrollRouter.delete('/:id', PayrollController.deleteSlip);

export default payrollRouter;
