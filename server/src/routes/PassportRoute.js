import { Router } from 'express';
import PassportController from '../controllers/PassportController.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import {
  createPassportSchema,
  updatePassportSchema,
  listPassportSchema,
} from '../validations/passport.validation.js';

const passportRouter = Router();

passportRouter.use(authenticateToken);

passportRouter.get('/', validate(listPassportSchema), PassportController.listPassports);
passportRouter.post('/', validate(createPassportSchema), PassportController.createPassport);
passportRouter.get('/:id', PassportController.getPassportById);
passportRouter.put('/:id', validate(updatePassportSchema), PassportController.updatePassport);
passportRouter.delete('/:id', PassportController.deletePassport);

export default passportRouter;
