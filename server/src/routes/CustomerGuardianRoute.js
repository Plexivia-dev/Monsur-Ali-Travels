import { Router } from 'express';
import CustomerGuardianController from '../controllers/CustomerGuardianController.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import {
  createGuardianAppSchema,
  updateGuardianAppSchema,
  listGuardianAppSchema,
} from '../validations/guardianApp.validation.js';

const guardianAppRouter = Router();

guardianAppRouter.use(authenticateToken);

guardianAppRouter.get('/', validate(listGuardianAppSchema), CustomerGuardianController.listApplications);
guardianAppRouter.post('/', validate(createGuardianAppSchema), CustomerGuardianController.createApplication);
guardianAppRouter.get('/:id', CustomerGuardianController.getApplicationById);
guardianAppRouter.put('/:id', validate(updateGuardianAppSchema), CustomerGuardianController.updateApplication);
guardianAppRouter.delete('/:id', CustomerGuardianController.deleteApplication);

export default guardianAppRouter;
