import MoneyReceiptService from '../services/MoneyReceiptService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class MoneyReceiptController {
  /**
   * List money receipts
   */
  static async listReceipts(req, res, next) {
    try {
      const { receipts, pagination } = await MoneyReceiptService.listReceipts(req.query);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Money receipts retrieved successfully',
        data: receipts,
        pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single receipt by ID
   */
  static async getReceiptById(req, res, next) {
    try {
      const receipt = await MoneyReceiptService.getReceiptById(req.params.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Money receipt retrieved successfully',
        data: receipt,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create token / receipt
   */
  static async createReceipt(req, res, next) {
    try {
      const newReceipt = await MoneyReceiptService.createReceipt(req.body, req.user?.id);
      return sendSuccess(res, {
        statusCode: 201,
        message: 'Money receipt / token generated successfully',
        data: newReceipt,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Confirm and seal receipt by accountant
   */
  static async confirmReceipt(req, res, next) {
    try {
      const confirmed = await MoneyReceiptService.confirmReceipt(req.params.id, req.body, req.user?.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Money receipt confirmed, sealed and customer ledger updated',
        data: confirmed,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel receipt
   */
  static async cancelReceipt(req, res, next) {
    try {
      const cancelled = await MoneyReceiptService.cancelReceipt(req.params.id, req.body.reason);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Money receipt cancelled',
        data: cancelled,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update bank deposit status
   */
  static async updateBankDeposit(req, res, next) {
    try {
      const updated = await MoneyReceiptService.updateBankDeposit(req.params.id, req.body);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Bank deposit handover status updated',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Financial KPI summary
   */
  static async getReceiptSummary(req, res, next) {
    try {
      const summary = await MoneyReceiptService.getReceiptSummary();
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Financial summary retrieved',
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Autocomplete lookup
   */
  static async lookupReceipts(req, res, next) {
    try {
      const results = await MoneyReceiptService.lookupReceipts(req.query.query);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Receipt lookup successful',
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete receipt
   */
  static async deleteReceipt(req, res, next) {
    try {
      const result = await MoneyReceiptService.deleteReceipt(req.params.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default MoneyReceiptController;
