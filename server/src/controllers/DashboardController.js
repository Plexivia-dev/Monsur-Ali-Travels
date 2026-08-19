import DashboardService from '../services/DashboardService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class DashboardController {
  /**
   * Get dashboard overview analytics
   */
  static async getOverview(req, res, next) {
    try {
      const data = await DashboardService.getOverviewMetrics();
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Dashboard analytics retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default DashboardController;
