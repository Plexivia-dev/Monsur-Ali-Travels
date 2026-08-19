import CaseFileService from '../services/CaseFileService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class CaseFileController {
  /**
   * List cases
   */
  static async listCases(req, res, next) {
    try {
      const { cases, pagination } = await CaseFileService.listCases(req.query);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Cases retrieved successfully',
        data: cases,
        pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single case by ID
   */
  static async getCaseById(req, res, next) {
    try {
      const caseFile = await CaseFileService.getCaseById(req.params.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Case file retrieved successfully',
        data: caseFile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create case
   */
  static async createCase(req, res, next) {
    try {
      const newCase = await CaseFileService.createCase(req.body, req.user?.id);
      return sendSuccess(res, {
        statusCode: 201,
        message: 'Case file created successfully and linked to customer profile',
        data: newCase,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update payment milestones
   */
  static async updatePayment(req, res, next) {
    try {
      const updated = await CaseFileService.updatePayment(req.params.id, req.body);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Case payment milestones updated',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update case status
   */
  static async updateStatus(req, res, next) {
    try {
      const updated = await CaseFileService.updateStatus(req.params.id, req.body);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Case status updated',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update case details
   */
  static async updateCase(req, res, next) {
    try {
      const updated = await CaseFileService.updateCase(req.params.id, req.body, req.user?.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Case updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete case
   */
  static async deleteCase(req, res, next) {
    try {
      const result = await CaseFileService.deleteCase(req.params.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default CaseFileController;
