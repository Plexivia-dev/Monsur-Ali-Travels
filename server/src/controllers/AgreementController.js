import AgreementService from '../services/AgreementService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class AgreementController {
  static async listAgreements(req, res, next) {
    try {
      const { agreements, pagination } = await AgreementService.listAgreements(req.query);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Employment agreements retrieved successfully',
        data: agreements,
        pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAgreementById(req, res, next) {
    try {
      const agreement = await AgreementService.getAgreementById(req.params.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Employment agreement retrieved successfully',
        data: agreement,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createAgreement(req, res, next) {
    try {
      const newAgreement = await AgreementService.createAgreement(req.body, req.user?.id);
      return sendSuccess(res, {
        statusCode: 201,
        message: 'Employment agreement created and synced to customer profile',
        data: newAgreement,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateAgreement(req, res, next) {
    try {
      const updated = await AgreementService.updateAgreement(req.params.id, req.body);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Employment agreement updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteAgreement(req, res, next) {
    try {
      const result = await AgreementService.deleteAgreement(req.params.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default AgreementController;
