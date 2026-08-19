import UserService from '../services/UserService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class UserController {
  /**
   * List all users
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async listUsers(req, res, next) {
    try {
      const { users, pagination } = await UserService.listUsers(req.query);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Users retrieved successfully',
        data: users,
        pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user by ID
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async getUserById(req, res, next) {
    try {
      const user = await UserService.getUserById(req.params.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'User retrieved successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new user
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async createUser(req, res, next) {
    try {
      const newUser = await UserService.createUser(req.body);
      return sendSuccess(res, {
        statusCode: 201,
        message: 'User created successfully',
        data: newUser,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user details
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async updateUser(req, res, next) {
    try {
      const updated = await UserService.updateUser(req.params.id, req.body);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'User updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Soft delete user
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async deleteUser(req, res, next) {
    try {
      const result = await UserService.deleteUser(req.params.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;
