import InvoiceService from '../services/InvoiceService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class InvoiceController {
  /**
   * List invoices
   */
  static async listInvoices(req, res, next) {
    try {
      const { invoices, pagination } = await InvoiceService.listInvoices(req.query);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Invoices retrieved successfully',
        data: invoices,
        pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single invoice
   */
  static async getInvoiceById(req, res, next) {
    try {
      const invoice = await InvoiceService.getInvoiceById(req.params.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Invoice retrieved successfully',
        data: invoice,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create invoice
   */
  static async createInvoice(req, res, next) {
    try {
      const newInvoice = await InvoiceService.createInvoice(req.body, req.user?.id);
      return sendSuccess(res, {
        statusCode: 201,
        message: 'Invoice created and linked to customer profile',
        data: newInvoice,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update invoice
   */
  static async updateInvoice(req, res, next) {
    try {
      const updated = await InvoiceService.updateInvoice(req.params.id, req.body);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Invoice updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete invoice
   */
  static async deleteInvoice(req, res, next) {
    try {
      const result = await InvoiceService.deleteInvoice(req.params.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default InvoiceController;
