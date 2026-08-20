import { Router } from 'express';
import AuthController from '../controllers/AuthController.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { loginSchema, registerSchema, changePasswordSchema, updateProfileSchema } from '../validations/auth.validation.js';

const authRouter = Router();

// Public routes
authRouter.post('/login', validate(loginSchema), AuthController.login);
authRouter.post('/register', validate(registerSchema), AuthController.register);

// Protected routes
authRouter.get('/me', authenticateToken, AuthController.getMe);
authRouter.put('/profile', authenticateToken, validate(updateProfileSchema), AuthController.updateProfile);
authRouter.post('/change-password', authenticateToken, validate(changePasswordSchema), AuthController.changePassword);

export default authRouter;
