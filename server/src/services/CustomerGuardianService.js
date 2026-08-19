import prisma from '../config/prisma.js';
import { generateDid } from '../utils/generateDid.js';
import { generateUniqueCustomerAppNo } from '../utils/trackingNumbers.js';
import { getPaginationMeta } from '../utils/apiResponse.js';
import CustomerSyncService from './CustomerSyncService.js';

export class CustomerGuardianService {
  /**
   * List guardian applications
   */
  static async listApplications({ page = 1, limit = 10, search, status }) {
    const where = { isActive: true };

    if (status && status !== 'all') {
      where.status = status;
    }

    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { applicationNo: { contains: term, mode: 'insensitive' } },
        { serviceType: { contains: term, mode: 'insensitive' } },
        { status: { contains: term, mode: 'insensitive' } },
      ];
    }

    const totalCount = await prisma.customerGuardianApplication.count({ where });
    const skip = (page - 1) * limit;

    const applications = await prisma.customerGuardianApplication.findMany({
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
    return { applications, pagination };
  }

  /**
   * Get single application by ID
   */
  static async getApplicationById(id) {
    const app = await prisma.customerGuardianApplication.findUnique({
      where: { id, isActive: true },
      include: { customer: true },
    });

    if (!app) {
      const error = new Error('Customer Guardian Application not found');
      error.statusCode = 404;
      throw error;
    }

    return app;
  }

  /**
   * Create application with customer auto-sync
   */
  static async createApplication(input, createdById = null) {
    const did = generateDid();
    const applicationNo = generateUniqueCustomerAppNo();

    const total = Number(input.payment?.totalAmount || 0);
    const advance = Number(input.payment?.advancePaid || 0);
    const due = Math.max(0, total - advance);

    const payment = {
      ...input.payment,
      totalAmount: total,
      advancePaid: advance,
      dueAmount: due,
      paymentStatus: total > 0 && advance >= total ? 'Paid' : advance > 0 ? 'Partial' : 'Unpaid',
    };

    // Sync Central Customer
    const customer = await CustomerSyncService.syncCustomerProfile({
      fullName: input.customerData.fullName,
      phone: input.customerData.mobileNumber,
      passportNumber: input.customerData.passportNumber,
      nidNumber: input.customerData.nidNumber,
      fatherName: input.customerData.fatherName,
      motherName: input.customerData.motherName,
      email: input.customerData.email,
      guardian: input.guardianData,
      attachments: input.attachments,
      payment: { totalAmount: total, advancePaid: advance },
      createdById,
    });

    const newApp = await prisma.customerGuardianApplication.create({
      data: {
        did,
        applicationNo,
        customerId: customer?.id || null,
        serviceType: input.serviceType || 'ইন্ডিয়ান ভিসা',
        customerData: input.customerData,
        guardianData: input.guardianData,
        requirementDocuments: input.requirementDocuments || [],
        payment,
        attachments: input.attachments || {},
        status: input.status || 'received',
        activityLogs: [
          {
            timestamp: new Date(),
            statusChangedTo: input.status || 'received',
            note: 'Application registered',
          },
        ],
        officeNotes: input.officeNotes || '',
      },
      include: { customer: true },
    });

    return newApp;
  }

  /**
   * Update application
   */
  static async updateApplication(id, input) {
    const app = await prisma.customerGuardianApplication.findUnique({ where: { id, isActive: true } });
    if (!app) {
      const error = new Error('Application not found');
      error.statusCode = 404;
      throw error;
    }

    const updated = await prisma.customerGuardianApplication.update({
      where: { id },
      data: input,
      include: { customer: true },
    });

    return updated;
  }

  /**
   * Delete application
   */
  static async deleteApplication(id) {
    const app = await prisma.customerGuardianApplication.findUnique({ where: { id } });
    if (!app) {
      const error = new Error('Application not found');
      error.statusCode = 404;
      throw error;
    }

    await prisma.customerGuardianApplication.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Application deleted successfully' };
  }
}

export default CustomerGuardianService;
