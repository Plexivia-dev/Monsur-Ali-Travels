import PassportService from '../services/PassportService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class PassportController {
  /**
   * List passport submissions
   */
  static async listPassports(req, res, next) {
    try {
      const { passports, pagination } = await PassportService.listPassports(req.query);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Passport submissions retrieved successfully',
        data: passports,
        pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single passport
   */
  static async getPassportById(req, res, next) {
    try {
      const passport = await PassportService.getPassportById(req.params.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Passport submission retrieved successfully',
        data: passport,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create passport submission
   */
  static async createPassport(req, res, next) {
    try {
      const newPassport = await PassportService.createPassport(req.body, req.user?.id);
      return sendSuccess(res, {
        statusCode: 201,
        message: 'Passport submission created and synced to customer profile',
        data: newPassport,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update passport submission
   */
  static async updatePassport(req, res, next) {
    try {
      const updated = await PassportService.updatePassport(req.params.id, req.body);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Passport submission updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete passport submission
   */
  static async deletePassport(req, res, next) {
    try {
      const result = await PassportService.deletePassport(req.params.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default PassportController;
