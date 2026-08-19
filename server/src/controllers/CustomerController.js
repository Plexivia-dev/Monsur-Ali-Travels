import CustomerService from '../services/CustomerService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class CustomerController {
  /**
   * List customers
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async listCustomers(req, res, next) {
    try {
      const { customers, pagination } = await CustomerService.listCustomers(req.query);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Customers retrieved successfully',
        data: customers,
        pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single customer with full service history
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async getCustomerById(req, res, next) {
    try {
      const customer = await CustomerService.getCustomerById(req.params.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Customer retrieved successfully',
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fast lookup autocomplete
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async lookupCustomers(req, res, next) {
    try {
      const results = await CustomerService.lookupCustomers(req.query.query);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Customer lookup successful',
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create customer
   * @param {import('express').Request & { user?: any }} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async createCustomer(req, res, next) {
    try {
      const newCustomer = await CustomerService.createCustomer(req.body, req.user?.id);
      return sendSuccess(res, {
        statusCode: 201,
        message: 'Customer profile created successfully',
        data: newCustomer,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update customer
   * @param {import('express').Request & { user?: any }} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async updateCustomer(req, res, next) {
    try {
      const updated = await CustomerService.updateCustomer(req.params.id, req.body, req.user?.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Customer updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete customer
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async deleteCustomer(req, res, next) {
    try {
      const result = await CustomerService.deleteCustomer(req.params.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default CustomerController;
