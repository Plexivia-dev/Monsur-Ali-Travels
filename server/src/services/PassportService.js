import prisma from '../config/prisma.js';
import { generateDid } from '../utils/generateDid.js';
import { generateUniquePassportTrackingNo } from '../utils/trackingNumbers.js';
import { getPaginationMeta } from '../utils/apiResponse.js';
import CustomerSyncService from './CustomerSyncService.js';

export class PassportService {
  /**
   * List passport submissions
   */
  static async listPassports({ page = 1, limit = 10, search, status, passportType }) {
    const where = { isActive: true };

    if (status && status !== 'all') {
      where.status = status;
    }

    if (passportType && passportType !== 'all') {
      where.passportType = { contains: passportType, mode: 'insensitive' };
    }

    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { trackingNo: { contains: term, mode: 'insensitive' } },
        { applicantName: { contains: term, mode: 'insensitive' } },
        { passportNo: { contains: term, mode: 'insensitive' } },
        { applicantPhone: { contains: term, mode: 'insensitive' } },
      ];
    }

    const totalCount = await prisma.passportSubmission.count({ where });
    const skip = (page - 1) * limit;

    const passports = await prisma.passportSubmission.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: {
            id: true,
            customerCode: true,
            fullName: true,
            phone: true,
            totalDueAmount: true,
          },
        },
      },
    });

    const pagination = getPaginationMeta(totalCount, page, limit);
    return { passports, pagination };
  }

  /**
   * Get single passport submission by ID
   */
  static async getPassportById(id) {
    const passport = await prisma.passportSubmission.findUnique({
      where: { id, isActive: true },
      include: { customer: true },
    });

    if (!passport) {
      const error = new Error('Passport submission not found');
      error.statusCode = 404;
      throw error;
    }

    return passport;
  }

  /**
   * Create passport submission with customer auto-sync
   */
  static async createPassport(input, createdById = null) {
    const did = generateDid();
    const trackingNo = generateUniquePassportTrackingNo();

    // Sync Central Customer
    const customer = await CustomerSyncService.syncCustomerProfile({
      fullName: input.applicantName,
      phone: input.applicantPhone,
      passportNumber: input.passportNo,
      payment: { totalAmount: input.fee, advancePaid: input.fee },
      createdById,
    });

    const newPassport = await prisma.passportSubmission.create({
      data: {
        did,
        trackingNo,
        customerId: customer?.id || null,
        applicantName: input.applicantName.trim(),
        applicantPhone: input.applicantPhone || '',
        passportNo: input.passportNo ? input.passportNo.toUpperCase().trim() : '',
        passportType: input.passportType || 'E-Passport',
        applicationCategory: input.applicationCategory || 'Renewal',
        submissionDate: input.submissionDate ? new Date(input.submissionDate) : new Date(),
        status: input.status || 'Pending',
        fee: input.fee || 0,
        details: input.details || {},
      },
      include: { customer: true },
    });

    return newPassport;
  }

  /**
   * Update passport submission
   */
  static async updatePassport(id, input) {
    const passport = await prisma.passportSubmission.findUnique({ where: { id, isActive: true } });
    if (!passport) {
      const error = new Error('Passport submission not found');
      error.statusCode = 404;
      throw error;
    }

    const updated = await prisma.passportSubmission.update({
      where: { id },
      data: {
        ...input,
        passportNo: input.passportNo ? input.passportNo.toUpperCase().trim() : undefined,
        submissionDate: input.submissionDate ? new Date(input.submissionDate) : undefined,
      },
      include: { customer: true },
    });

    return updated;
  }

  /**
   * Delete passport submission
   */
  static async deletePassport(id) {
    const passport = await prisma.passportSubmission.findUnique({ where: { id } });
    if (!passport) {
      const error = new Error('Passport submission not found');
      error.statusCode = 404;
      throw error;
    }

    await prisma.passportSubmission.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Passport submission deleted successfully' };
  }
}

export default PassportService;
