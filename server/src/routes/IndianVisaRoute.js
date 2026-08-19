import { Router } from 'express';
import IndianVisaController from '../controllers/IndianVisaController.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import {
  createVisaSchema,
  updateVisaSchema,
  updateVisaStageSchema,
  listVisaSchema,
} from '../validations/visa.validation.js';

const visaRouter = Router();

visaRouter.use(authenticateToken);

visaRouter.get('/', validate(listVisaSchema), IndianVisaController.listVisas);
visaRouter.post('/', validate(createVisaSchema), IndianVisaController.createVisa);
visaRouter.get('/:id', IndianVisaController.getVisaById);
visaRouter.put('/:id', validate(updateVisaSchema), IndianVisaController.updateVisa);
visaRouter.patch('/:id/stage', validate(updateVisaStageSchema), IndianVisaController.updateStage);
visaRouter.delete('/:id', IndianVisaController.deleteVisa);

export default visaRouter;
