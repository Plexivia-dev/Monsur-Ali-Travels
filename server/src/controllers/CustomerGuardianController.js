import CustomerGuardianService from '../services/CustomerGuardianService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class CustomerGuardianController {
  /**
   * List applications
   */
  static async listApplications(req, res, next) {
    try {
      const { applications, pagination } = await CustomerGuardianService.listApplications(req.query);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Customer Guardian applications retrieved successfully',
        data: applications,
        pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single application
   */
  static async getApplicationById(req, res, next) {
    try {
      const application = await CustomerGuardianService.getApplicationById(req.params.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Customer Guardian application retrieved successfully',
        data: application,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create application
   */
  static async createApplication(req, res, next) {
    try {
      const newApp = await CustomerGuardianService.createApplication(req.body, req.user?.id);
      return sendSuccess(res, {
        statusCode: 201,
        message: 'Customer Guardian application created and synced to customer profile',
        data: newApp,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update application
   */
  static async updateApplication(req, res, next) {
    try {
      const updated = await CustomerGuardianService.updateApplication(req.params.id, req.body);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Application updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete application
   */
  static async deleteApplication(req, res, next) {
    try {
      const result = await CustomerGuardianService.deleteApplication(req.params.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default CustomerGuardianController;
