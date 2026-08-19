import AuthService from '../services/AuthService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class AuthController {
  /**
   * Handles user login
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async login(req, res, next) {
    try {
      const result = await AuthService.login(req.body);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles user registration
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async register(req, res, next) {
    try {
      const result = await AuthService.register(req.body);
      return sendSuccess(res, {
        statusCode: 201,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles password change
   * @param {import('express').Request & { user?: any }} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async changePassword(req, res, next) {
    try {
      const result = await AuthService.changePassword(req.user.id, req.body);
      return sendSuccess(res, {
        statusCode: 200,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Returns current authenticated user profile
   * @param {import('express').Request & { user?: any }} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async getMe(req, res, next) {
    try {
      const user = await AuthService.getMe(req.user.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'User profile retrieved',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
