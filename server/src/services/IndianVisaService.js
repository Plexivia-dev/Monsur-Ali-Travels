import prisma from '../config/prisma.js';
import { generateDid } from '../utils/generateDid.js';
import { generateUniqueIndianVisaTrackingNo } from '../utils/trackingNumbers.js';
import { getPaginationMeta } from '../utils/apiResponse.js';
import CustomerSyncService from './CustomerSyncService.js';

export class IndianVisaService {
  /**
   * List visa submissions
   */
  static async listVisas({ page = 1, limit = 10, search, status, visaType }) {
    const where = { isActive: true };

    if (status && status !== 'all') {
      where.status = status;
    }

    if (visaType && visaType !== 'all') {
      where.visaType = { contains: visaType, mode: 'insensitive' };
    }

    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { trackingNo: { contains: term, mode: 'insensitive' } },
        { applicantName: { contains: term, mode: 'insensitive' } },
        { passportNo: { contains: term, mode: 'insensitive' } },
        { contactNo: { contains: term, mode: 'insensitive' } },
      ];
    }

    const totalCount = await prisma.indianVisaSubmission.count({ where });
    const skip = (page - 1) * limit;

    const visas = await prisma.indianVisaSubmission.findMany({
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
    return { visas, pagination };
  }

  /**
   * Get single visa by ID
   */
  static async getVisaById(id) {
    const visa = await prisma.indianVisaSubmission.findUnique({
      where: { id, isActive: true },
      include: { customer: true },
    });

    if (!visa) {
      const error = new Error('Indian Visa submission not found');
      error.statusCode = 404;
      throw error;
    }

    return visa;
  }

  /**
   * Create new visa submission with customer auto-sync
   */
  static async createVisa(input, createdById = null) {
    const did = generateDid();
    const trackingNo = generateUniqueIndianVisaTrackingNo();

    // Sync Central Customer
    const customer = await CustomerSyncService.syncCustomerProfile({
      fullName: input.applicantName,
      phone: input.contactNo,
      passportNumber: input.passportNo,
      email: input.email,
      payment: { totalAmount: input.fee, advancePaid: input.fee },
      createdById,
    });

    const stageHistory = [
      {
        stage: input.status || 'pending',
        timestamp: new Date(),
        note: 'Initial visa application registered',
      },
    ];

    const newVisa = await prisma.indianVisaSubmission.create({
      data: {
        did,
        trackingNo,
        customerId: customer?.id || null,
        applicantName: input.applicantName.trim(),
        passportNo: input.passportNo.toUpperCase().trim(),
        contactNo: input.contactNo || '',
        email: input.email ? input.email.toLowerCase().trim() : '',
        visaType: input.visaType || 'Tourist',
        status: input.status || 'pending',
        fee: input.fee || 0,
        applicantData: input.applicantData || {},
        documents: input.documents || [],
        stageHistory,
      },
      include: { customer: true },
    });

    return newVisa;
  }

  /**
   * Update visa stage
   */
  static async updateStage(id, { status, note }) {
    const visa = await prisma.indianVisaSubmission.findUnique({ where: { id, isActive: true } });
    if (!visa) {
      const error = new Error('Visa submission not found');
      error.statusCode = 404;
      throw error;
    }

    const currentHistory = Array.isArray(visa.stageHistory) ? visa.stageHistory : [];
    currentHistory.push({
      stage: status,
      timestamp: new Date(),
      note: note || `Status updated to ${status}`,
    });

    const updated = await prisma.indianVisaSubmission.update({
      where: { id },
      data: {
        status,
        stageHistory: currentHistory,
      },
      include: { customer: true },
    });

    return updated;
  }

  /**
   * Update visa details
   */
  static async updateVisa(id, input) {
    const visa = await prisma.indianVisaSubmission.findUnique({ where: { id, isActive: true } });
    if (!visa) {
      const error = new Error('Visa submission not found');
      error.statusCode = 404;
      throw error;
    }

    const updated = await prisma.indianVisaSubmission.update({
      where: { id },
      data: {
        ...input,
        passportNo: input.passportNo ? input.passportNo.toUpperCase().trim() : undefined,
      },
      include: { customer: true },
    });

    return updated;
  }

  /**
   * Delete visa submission
   */
  static async deleteVisa(id) {
    const visa = await prisma.indianVisaSubmission.findUnique({ where: { id } });
    if (!visa) {
      const error = new Error('Visa submission not found');
      error.statusCode = 404;
      throw error;
    }

    await prisma.indianVisaSubmission.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Indian Visa submission deleted successfully' };
  }
}

export default IndianVisaService;
