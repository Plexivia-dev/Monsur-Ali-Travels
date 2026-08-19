import prisma from '../config/prisma.js';
import { generateDid } from '../utils/generateDid.js';
import { generateUniqueAgreementId } from '../utils/trackingNumbers.js';
import { getPaginationMeta } from '../utils/apiResponse.js';
import CustomerSyncService from './CustomerSyncService.js';

export class AgreementService {
  /**
   * List employment agreements
   */
  static async listAgreements({ page = 1, limit = 10, search }) {
    const where = { isActive: true };

    const totalCount = await prisma.employmentAgreement.count({ where });
    const skip = (page - 1) * limit;

    const agreements = await prisma.employmentAgreement.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { customer: true },
    });

    const pagination = getPaginationMeta(totalCount, page, limit);
    return { agreements, pagination };
  }

  /**
   * Get single agreement by ID
   */
  static async getAgreementById(id) {
    const agreement = await prisma.employmentAgreement.findUnique({
      where: { id, isActive: true },
      include: { customer: true },
    });

    if (!agreement) {
      const error = new Error('Employment Agreement not found');
      error.statusCode = 404;
      throw error;
    }

    return agreement;
  }

  /**
   * Create new agreement with customer auto-sync
   */
  static async createAgreement(input, createdById = null) {
    const did = generateDid();
    const agreementId = generateUniqueAgreementId();

    const employeeName = input.partyInfo?.কর্মচারীর_পূর্ণ_নাম || '';
    const passportNid = input.partyInfo?.জাতীয়_পরিচয়পত্র_পাসপোর্ট || '';
    const email = input.partyInfo?.কর্মচারীর_ইমেইল || '';
    const address = input.partyInfo?.বর্তমান_স্থায়ী_ঠিকানা || '';

    // Sync Central Customer
    const customer = await CustomerSyncService.syncCustomerProfile({
      fullName: employeeName,
      passportNumber: passportNid.length === 9 ? passportNid : '',
      nidNumber: passportNid.length > 9 ? passportNid : '',
      email,
      presentAddress: address,
      createdById,
    });

    const newAgreement = await prisma.employmentAgreement.create({
      data: {
        did,
        agreementId,
        customerId: customer?.id || null,
        companyInfo: input.companyInfo,
        partyInfo: input.partyInfo,
        guardianInfo: input.guardianInfo || {},
        positionInfo: input.positionInfo || {},
        salaryStructure: input.salaryStructure || {},
        leavePolicy: input.leavePolicy || {},
        witnesses: input.witnesses || {},
        status: input.status || 'active',
      },
      include: { customer: true },
    });

    return newAgreement;
  }

  /**
   * Update agreement
   */
  static async updateAgreement(id, input) {
    const agreement = await prisma.employmentAgreement.findUnique({ where: { id, isActive: true } });
    if (!agreement) {
      const error = new Error('Employment Agreement not found');
      error.statusCode = 404;
      throw error;
    }

    const updated = await prisma.employmentAgreement.update({
      where: { id },
      data: input,
      include: { customer: true },
    });

    return updated;
  }

  /**
   * Delete agreement
   */
  static async deleteAgreement(id) {
    const agreement = await prisma.employmentAgreement.findUnique({ where: { id } });
    if (!agreement) {
      const error = new Error('Employment Agreement not found');
      error.statusCode = 404;
      throw error;
    }

    await prisma.employmentAgreement.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Employment Agreement deleted successfully' };
  }
}

export default AgreementService;
