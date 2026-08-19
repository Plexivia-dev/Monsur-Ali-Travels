import { Router } from 'express';
import AgreementController from '../controllers/AgreementController.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import {
  createAgreementSchema,
  listDocumentsSchema,
} from '../validations/document.validation.js';

const agreementRouter = Router();

agreementRouter.use(authenticateToken);

agreementRouter.get('/', validate(listDocumentsSchema), AgreementController.listAgreements);
agreementRouter.post('/', validate(createAgreementSchema), AgreementController.createAgreement);
agreementRouter.get('/:id', AgreementController.getAgreementById);
agreementRouter.put('/:id', AgreementController.updateAgreement);
agreementRouter.delete('/:id', AgreementController.deleteAgreement);

export default agreementRouter;
