import PayrollService from '../services/PayrollService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class PayrollController {
  static async listSlips(req, res, next) {
    try {
      const { slips, pagination } = await PayrollService.listSlips(req.query);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Salary slips retrieved successfully',
        data: slips,
        pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSlipById(req, res, next) {
    try {
      const slip = await PayrollService.getSlipById(req.params.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Salary slip retrieved successfully',
        data: slip,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createSlip(req, res, next) {
    try {
      const newSlip = await PayrollService.createSlip(req.body);
      return sendSuccess(res, {
        statusCode: 201,
        message: 'Salary slip created successfully',
        data: newSlip,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteSlip(req, res, next) {
    try {
      const result = await PayrollService.deleteSlip(req.params.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default PayrollController;
