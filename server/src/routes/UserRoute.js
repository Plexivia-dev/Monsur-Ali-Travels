import { Router } from 'express';
import UserController from '../controllers/UserController.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticateToken, requireRoles } from '../middlewares/auth.middleware.js';
import { createUserSchema, updateUserSchema, listUsersSchema } from '../validations/user.validation.js';

const userRouter = Router();

// All user routes require authentication and Owner/Admin role
userRouter.use(authenticateToken);
userRouter.use(requireRoles('Owner', 'Admin'));

userRouter.get('/', validate(listUsersSchema), UserController.listUsers);
userRouter.post('/', validate(createUserSchema), UserController.createUser);
userRouter.get('/:id', UserController.getUserById);
userRouter.put('/:id', validate(updateUserSchema), UserController.updateUser);
userRouter.delete('/:id', UserController.deleteUser);

export default userRouter;
