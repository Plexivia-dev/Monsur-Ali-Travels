import prisma from '../config/prisma.js';
import { generateDid } from '../utils/generateDid.js';
import { generateCustomerCode } from '../utils/trackingNumbers.js';
import { getPaginationMeta } from '../utils/apiResponse.js';

export class CustomerService {
  /**
   * List customers with pagination, status filters, and multi-field search
   * @param {Object} query
   */
  static async listCustomers({ page = 1, limit = 10, search, status, customerType }) {
    const where = { isActive: true };

    if (status && status !== 'all') {
      where.status = status;
    }

    if (customerType && customerType !== 'all') {
      where.customerType = customerType;
    }

    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { fullName: { contains: term, mode: 'insensitive' } },
        { phone: { contains: term, mode: 'insensitive' } },
        { passportNumber: { contains: term, mode: 'insensitive' } },
        { nidNumber: { contains: term, mode: 'insensitive' } },
        { customerCode: { contains: term, mode: 'insensitive' } },
        { fatherName: { contains: term, mode: 'insensitive' } },
      ];
    }

    const totalCount = await prisma.customer.count({ where });
    const skip = (page - 1) * limit;

    const customers = await prisma.customer.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            cases: true,
            visaSubmissions: true,
            passportSubmissions: true,
            applications: true,
            invoices: true,
            receipts: true,
          },
        },
      },
    });

    const pagination = getPaginationMeta(totalCount, page, limit);
    return { customers, pagination };
  }

  /**
   * Get single customer with full relational service history
   * @param {string} id
   */
  static async getCustomerById(id) {
    const customer = await prisma.customer.findUnique({
      where: { id, isActive: true },
      include: {
        cases: { orderBy: { createdAt: 'desc' } },
        visaSubmissions: { orderBy: { createdAt: 'desc' } },
        passportSubmissions: { orderBy: { createdAt: 'desc' } },
        applications: { orderBy: { createdAt: 'desc' } },
        invoices: { orderBy: { createdAt: 'desc' } },
        receipts: { orderBy: { createdAt: 'desc' } },
        agreements: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!customer) {
      const error = new Error('Customer not found');
      error.statusCode = 404;
      throw error;
    }

    return customer;
  }

  /**
   * Create a new Central Customer manually
   * @param {Object} input
   * @param {string} [createdById]
   */
  static async createCustomer(input, createdById = null) {
    const did = generateDid();
    const customerCode = generateCustomerCode();

    const customer = await prisma.customer.create({
      data: {
        ...input,
        did,
        customerCode,
        passportNumber: input.passportNumber ? input.passportNumber.toUpperCase().trim() : '',
        createdById,
      },
    });

    return customer;
  }

  /**
   * Update an existing Customer
   * @param {string} id
   * @param {Object} input
   * @param {string} [updatedById]
   */
  static async updateCustomer(id, input, updatedById = null) {
    const customer = await prisma.customer.findUnique({ where: { id, isActive: true } });
    if (!customer) {
      const error = new Error('Customer not found');
      error.statusCode = 404;
      throw error;
    }

    const updated = await prisma.customer.update({
      where: { id },
      data: {
        ...input,
        passportNumber: input.passportNumber !== undefined ? input.passportNumber.toUpperCase().trim() : undefined,
        updatedById,
      },
    });

    return updated;
  }

  /**
   * Fast autocomplete lookup across Name, Phone, Passport, NID, Customer Code
   * @param {string} query
   */
  static async lookupCustomers(query) {
    if (!query || !query.trim()) return [];

    const term = query.trim();
    return prisma.customer.findMany({
      where: {
        isActive: true,
        OR: [
          { fullName: { contains: term, mode: 'insensitive' } },
          { phone: { contains: term, mode: 'insensitive' } },
          { passportNumber: { contains: term, mode: 'insensitive' } },
          { nidNumber: { contains: term, mode: 'insensitive' } },
          { customerCode: { contains: term, mode: 'insensitive' } },
        ],
      },
      take: 10,
      select: {
        id: true,
        customerCode: true,
        fullName: true,
        phone: true,
        passportNumber: true,
        nidNumber: true,
        totalDueAmount: true,
        fatherName: true,
      },
    });
  }

  /**
   * Soft delete a Customer
   * @param {string} id
   */
  static async deleteCustomer(id) {
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      const error = new Error('Customer not found');
      error.statusCode = 404;
      throw error;
    }

    await prisma.customer.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Customer profile deleted successfully' };
  }
}

export default CustomerService;
