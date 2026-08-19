import prisma from '../config/prisma.js';
import { generateDid } from '../utils/generateDid.js';
import { generateCaseNumber } from '../utils/trackingNumbers.js';
import { getPaginationMeta } from '../utils/apiResponse.js';
import CustomerSyncService from './CustomerSyncService.js';

export class CaseFileService {
  /**
   * List cases with pagination, status/caseType filters, and search
   * @param {Object} query
   */
  static async listCases({ page = 1, limit = 10, search, status, caseType }) {
    const where = { isActive: true };

    if (status && status !== 'all') {
      where.status = status;
    }

    if (caseType && caseType !== 'all') {
      where.caseType = { contains: caseType, mode: 'insensitive' };
    }

    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { caseNumber: { contains: term, mode: 'insensitive' } },
        { applicantName: { contains: term, mode: 'insensitive' } },
        { passportNumber: { contains: term, mode: 'insensitive' } },
        { phone: { contains: term, mode: 'insensitive' } },
        { nidNumber: { contains: term, mode: 'insensitive' } },
      ];
    }

    const totalCount = await prisma.caseFile.count({ where });
    const skip = (page - 1) * limit;

    const cases = await prisma.caseFile.findMany({
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
    return { cases, pagination };
  }

  /**
   * Get single case by ID
   * @param {string} id
   */
  static async getCaseById(id) {
    const caseFile = await prisma.caseFile.findUnique({
      where: { id, isActive: true },
      include: {
        customer: true,
        createdBy: { select: { id: true, name: true, role: true } },
        updatedBy: { select: { id: true, name: true, role: true } },
      },
    });

    if (!caseFile) {
      const error = new Error('Case file not found');
      error.statusCode = 404;
      throw error;
    }

    return caseFile;
  }

  /**
   * Create a new Case File with auto Customer sync
   * @param {Object} input
   * @param {string} [createdById]
   */
  static async createCase(input, createdById = null) {
    const did = generateDid();
    const caseNumber = generateCaseNumber(input.caseType);

    // Compute payment totals
    const step1 = Number(input.step1_advance || 0);
    const step2 = Number(input.step2_offerApproval || 0);
    const step3 = Number(input.step3_delivery || 0);
    const totalPaid = step1 + step2 + step3;
    const totalAgreed = Number(input.totalAgreedAmount || 0);
    const dueAmount = Math.max(0, totalAgreed - totalPaid);
    const isFullyPaid = totalAgreed > 0 && totalPaid >= totalAgreed;

    // Sync or create Central Customer
    const customer = await CustomerSyncService.syncCustomerProfile({
      fullName: input.applicantName,
      phone: input.phone,
      passportNumber: input.passportNumber,
      nidNumber: input.nidNumber,
      payment: { totalAmount: totalAgreed, advancePaid: totalPaid },
      createdById,
    });

    if (!customer) {
      const error = new Error('Unable to create or link customer profile');
      error.statusCode = 400;
      throw error;
    }

    const newCase = await prisma.caseFile.create({
      data: {
        did,
        caseNumber,
        customerId: customer.id,
        applicantName: input.applicantName.trim(),
        passportNumber: input.passportNumber ? input.passportNumber.toUpperCase().trim() : '',
        phone: input.phone ? input.phone.trim() : '',
        nidNumber: input.nidNumber ? input.nidNumber.trim() : '',
        caseType: input.caseType,
        status: input.status || 'ENTRY',
        checklist: input.checklist || {},
        totalAgreedAmount: totalAgreed,
        step1_advance: step1,
        step2_offerApproval: step2,
        step3_delivery: step3,
        totalPaidAmount: totalPaid,
        dueAmount,
        isFullyPaid,
        extraData: input.extraData || {},
        remarks: input.remarks || '',
        createdById,
      },
      include: {
        customer: true,
      },
    });

    return newCase;
  }

  /**
   * Update 3-step payment milestones and recalculate due balance
   * @param {string} id
   * @param {Object} paymentInput
   */
  static async updatePayment(id, paymentInput) {
    const caseFile = await prisma.caseFile.findUnique({ where: { id, isActive: true } });
    if (!caseFile) {
      const error = new Error('Case file not found');
      error.statusCode = 404;
      throw error;
    }

    const totalAgreed = paymentInput.totalAgreedAmount !== undefined ? Number(paymentInput.totalAgreedAmount) : Number(caseFile.totalAgreedAmount);
    const step1 = paymentInput.step1_advance !== undefined ? Number(paymentInput.step1_advance) : Number(caseFile.step1_advance);
    const step2 = paymentInput.step2_offerApproval !== undefined ? Number(paymentInput.step2_offerApproval) : Number(caseFile.step2_offerApproval);
    const step3 = paymentInput.step3_delivery !== undefined ? Number(paymentInput.step3_delivery) : Number(caseFile.step3_delivery);

    const totalPaid = step1 + step2 + step3;
    const dueAmount = Math.max(0, totalAgreed - totalPaid);
    const isFullyPaid = totalAgreed > 0 && totalPaid >= totalAgreed;

    const updated = await prisma.caseFile.update({
      where: { id },
      data: {
        totalAgreedAmount: totalAgreed,
        step1_advance: step1,
        step2_offerApproval: step2,
        step3_delivery: step3,
        totalPaidAmount: totalPaid,
        dueAmount,
        isFullyPaid,
      },
      include: { customer: true },
    });

    return updated;
  }

  /**
   * Update case workflow status
   * @param {string} id
   * @param {Object} input
   */
  static async updateStatus(id, { status, remarks }) {
    const caseFile = await prisma.caseFile.findUnique({ where: { id, isActive: true } });
    if (!caseFile) {
      const error = new Error('Case file not found');
      error.statusCode = 404;
      throw error;
    }

    const updated = await prisma.caseFile.update({
      where: { id },
      data: {
        status,
        remarks: remarks !== undefined ? remarks : caseFile.remarks,
      },
      include: { customer: true },
    });

    return updated;
  }

  /**
   * General case update
   * @param {string} id
   * @param {Object} input
   * @param {string} [updatedById]
   */
  static async updateCase(id, input, updatedById = null) {
    const caseFile = await prisma.caseFile.findUnique({ where: { id, isActive: true } });
    if (!caseFile) {
      const error = new Error('Case file not found');
      error.statusCode = 404;
      throw error;
    }

    const updated = await prisma.caseFile.update({
      where: { id },
      data: {
        ...input,
        passportNumber: input.passportNumber ? input.passportNumber.toUpperCase().trim() : undefined,
        updatedById,
      },
      include: { customer: true },
    });

    return updated;
  }

  /**
   * Soft delete a case
   * @param {string} id
   */
  static async deleteCase(id) {
    const caseFile = await prisma.caseFile.findUnique({ where: { id } });
    if (!caseFile) {
      const error = new Error('Case file not found');
      error.statusCode = 404;
      throw error;
    }

    await prisma.caseFile.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Case file deleted successfully' };
  }
}

export default CaseFileService;
