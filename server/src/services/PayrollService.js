import prisma from '../config/prisma.js';
import { generateDid } from '../utils/generateDid.js';
import { generateUniqueSlipNo } from '../utils/trackingNumbers.js';
import { getPaginationMeta } from '../utils/apiResponse.js';

export class PayrollService {
  /**
   * List salary slips
   */
  static async listSlips({ page = 1, limit = 10, search }) {
    const where = { isActive: true };

    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { slipNo: { contains: term, mode: 'insensitive' } },
        { employeeName: { contains: term, mode: 'insensitive' } },
        { monthYear: { contains: term, mode: 'insensitive' } },
      ];
    }

    const totalCount = await prisma.salarySlip.count({ where });
    const skip = (page - 1) * limit;

    const slips = await prisma.salarySlip.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const pagination = getPaginationMeta(totalCount, page, limit);
    return { slips, pagination };
  }

  /**
   * Get single slip by ID
   */
  static async getSlipById(id) {
    const slip = await prisma.salarySlip.findUnique({
      where: { id, isActive: true },
    });

    if (!slip) {
      const error = new Error('Salary slip not found');
      error.statusCode = 404;
      throw error;
    }

    return slip;
  }

  /**
   * Create salary slip
   */
  static async createSlip(input) {
    const did = generateDid();
    const slipNo = generateUniqueSlipNo();

    const newSlip = await prisma.salarySlip.create({
      data: {
        did,
        slipNo,
        employeeName: input.employeeName.trim(),
        designation: input.designation || '',
        monthYear: input.monthYear,
        earnings: input.earnings || {},
        deductions: input.deductions || {},
        netSalary: input.netSalary,
      },
    });

    return newSlip;
  }

  /**
   * Delete slip
   */
  static async deleteSlip(id) {
    const slip = await prisma.salarySlip.findUnique({ where: { id } });
    if (!slip) {
      const error = new Error('Salary slip not found');
      error.statusCode = 404;
      throw error;
    }

    await prisma.salarySlip.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Salary slip deleted successfully' };
  }
}

export default PayrollService;
