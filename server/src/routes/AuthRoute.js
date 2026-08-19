import { Router } from 'express';
import AuthController from '../controllers/AuthController.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { loginSchema, registerSchema, changePasswordSchema } from '../validations/auth.validation.js';

const authRouter = Router();

// Public routes
authRouter.post('/login', validate(loginSchema), AuthController.login);
authRouter.post('/register', validate(registerSchema), AuthController.register);

// Protected routes
authRouter.get('/me', authenticateToken, AuthController.getMe);
authRouter.post('/change-password', authenticateToken, validate(changePasswordSchema), AuthController.changePassword);

export default authRouter;
