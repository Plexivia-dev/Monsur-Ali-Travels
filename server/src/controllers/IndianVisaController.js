import IndianVisaService from '../services/IndianVisaService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class IndianVisaController {
  /**
   * List visas
   */
  static async listVisas(req, res, next) {
    try {
      const { visas, pagination } = await IndianVisaService.listVisas(req.query);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Indian Visa submissions retrieved successfully',
        data: visas,
        pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single visa
   */
  static async getVisaById(req, res, next) {
    try {
      const visa = await IndianVisaService.getVisaById(req.params.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Indian Visa submission retrieved successfully',
        data: visa,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create visa
   */
  static async createVisa(req, res, next) {
    try {
      const newVisa = await IndianVisaService.createVisa(req.body, req.user?.id);
      return sendSuccess(res, {
        statusCode: 201,
        message: 'Indian Visa submission created and synced to customer profile',
        data: newVisa,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update stage
   */
  static async updateStage(req, res, next) {
    try {
      const updated = await IndianVisaService.updateStage(req.params.id, req.body);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Visa processing stage updated',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update visa
   */
  static async updateVisa(req, res, next) {
    try {
      const updated = await IndianVisaService.updateVisa(req.params.id, req.body);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Visa submission updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete visa
   */
  static async deleteVisa(req, res, next) {
    try {
      const result = await IndianVisaService.deleteVisa(req.params.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default IndianVisaController;
