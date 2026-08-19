import { Router } from 'express';
import CaseFileController from '../controllers/CaseFileController.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import {
  createCaseSchema,
  updateCaseSchema,
  updateCasePaymentSchema,
  updateCaseStatusSchema,
  listCasesSchema,
} from '../validations/case.validation.js';

const caseRouter = Router();

caseRouter.use(authenticateToken);

caseRouter.get('/', validate(listCasesSchema), CaseFileController.listCases);
caseRouter.post('/', validate(createCaseSchema), CaseFileController.createCase);
caseRouter.get('/:id', CaseFileController.getCaseById);
caseRouter.put('/:id', validate(updateCaseSchema), CaseFileController.updateCase);
caseRouter.patch('/:id/payment', validate(updateCasePaymentSchema), CaseFileController.updatePayment);
caseRouter.patch('/:id/status', validate(updateCaseStatusSchema), CaseFileController.updateStatus);
caseRouter.delete('/:id', CaseFileController.deleteCase);

export default caseRouter;
