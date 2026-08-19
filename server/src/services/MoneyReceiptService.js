import prisma from '../config/prisma.js';
import { generateDid } from '../utils/generateDid.js';
import { generateReceiptTokenNo } from '../utils/trackingNumbers.js';
import { getPaginationMeta } from '../utils/apiResponse.js';

export class MoneyReceiptService {
  /**
   * List money receipts with pagination, status filter, and multi-field search
   * @param {Object} query
   */
  static async listReceipts({
    page = 1,
    limit = 10,
    search,
    status,
    serviceType,
    handedOverToBank,
    startDate,
    endDate,
  }) {
    const where = { isActive: true };

    if (status && status !== 'all') {
      where.status = status;
    }

    if (serviceType && serviceType !== 'all') {
      where.serviceType = { contains: serviceType, mode: 'insensitive' };
    }

    if (handedOverToBank && handedOverToBank !== 'all') {
      where.handedOverToBank = handedOverToBank === 'true';
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { receiptNo: { contains: term, mode: 'insensitive' } },
        { clientName: { contains: term, mode: 'insensitive' } },
        { clientPhone: { contains: term, mode: 'insensitive' } },
        { passportNumber: { contains: term, mode: 'insensitive' } },
        { serviceType: { contains: term, mode: 'insensitive' } },
        { purpose: { contains: term, mode: 'insensitive' } },
        { createdByName: { contains: term, mode: 'insensitive' } },
        { confirmedByName: { contains: term, mode: 'insensitive' } },
      ];
    }

    const totalCount = await prisma.moneyReceipt.count({ where });
    const skip = (page - 1) * limit;

    const receipts = await prisma.moneyReceipt.findMany({
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
    return { receipts, pagination };
  }

  /**
   * Get single receipt by ID
   * @param {string} id
   */
  static async getReceiptById(id) {
    const receipt = await prisma.moneyReceipt.findUnique({
      where: { id, isActive: true },
      include: {
        customer: true,
        createdBy: { select: { id: true, name: true, role: true } },
        confirmedBy: { select: { id: true, name: true, role: true } },
      },
    });

    if (!receipt) {
      const error = new Error('Money receipt not found');
      error.statusCode = 404;
      throw error;
    }

    return receipt;
  }

  /**
   * Create a new Money Receipt / Payment Token
   * @param {Object} input
   * @param {string} [createdById]
   */
  static async createReceipt(input, createdById = null) {
    const did = generateDid();
    const receiptNo = generateReceiptTokenNo();

    // Auto-link to customer if customerId not provided but passport/phone matches
    let customerId = input.customerId || null;
    if (!customerId && (input.passportNumber || input.clientPhone)) {
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          isActive: true,
          OR: [
            input.passportNumber ? { passportNumber: input.passportNumber.trim().toUpperCase() } : {},
            input.clientPhone ? { phone: input.clientPhone.trim() } : {},
          ].filter((c) => Object.keys(c).length > 0),
        },
      });
      if (existingCustomer) {
        customerId = existingCustomer.id;
      }
    }

    const receipt = await prisma.moneyReceipt.create({
      data: {
        did,
        receiptNo,
        clientName: input.clientName.trim(),
        clientPhone: input.clientPhone ? input.clientPhone.trim() : '',
        passportNumber: input.passportNumber ? input.passportNumber.trim().toUpperCase() : '',
        serviceType: input.serviceType || 'অন্যান্য',
        purpose: input.purpose || '',
        amount: input.amount,
        amountInWords: input.amountInWords || '',
        currency: input.currency || 'BDT',
        paymentMethod: input.paymentMethod || 'Cash',
        status: 'pending',
        customerId,
        serviceRef: input.serviceRef || {},
        notes: input.notes || '',
        createdByName: input.createdByName || 'ম্যানেজার',
        createdById,
      },
      include: {
        customer: true,
      },
    });

    return receipt;
  }

  /**
   * Accountant cash seal and confirmation
   * Updates status to 'confirmed' and recalculates Customer ledger
   * @param {string} id
   * @param {Object} input
   * @param {string} [confirmedById]
   */
  static async confirmReceipt(id, input, confirmedById = null) {
    const receipt = await prisma.moneyReceipt.findUnique({
      where: { id, isActive: true },
      include: { customer: true },
    });

    if (!receipt) {
      const error = new Error('Receipt not found');
      error.statusCode = 404;
      throw error;
    }

    if (receipt.status === 'confirmed') {
      const error = new Error('Receipt is already confirmed and sealed');
      error.statusCode = 400;
      throw error;
    }

    const confirmed = await prisma.moneyReceipt.update({
      where: { id },
      data: {
        status: 'confirmed',
        confirmedByName: input.confirmedByName || 'একাউন্ট্যান্ট / ক্যাশিয়ার',
        confirmedById,
        confirmedAt: new Date(),
        paymentMethod: input.paymentMethod || receipt.paymentMethod,
        notes: input.notes ? `${receipt.notes} | ${input.notes}`.trim() : receipt.notes,
      },
      include: { customer: true },
    });

    // Update Central Customer financial ledger if linked
    if (confirmed.customerId) {
      const customer = await prisma.customer.findUnique({ where: { id: confirmed.customerId } });
      if (customer) {
        const currentPaid = Number(customer.totalPaidAmount || 0);
        const currentBilled = Number(customer.totalBilledAmount || 0);
        const receiptAmount = Number(confirmed.amount || 0);

        const newPaid = currentPaid + receiptAmount;
        const newDue = Math.max(0, currentBilled - newPaid);

        await prisma.customer.update({
          where: { id: customer.id },
          data: {
            totalPaidAmount: newPaid,
            totalDueAmount: newDue,
          },
        });
      }
    }

    return confirmed;
  }

  /**
   * Cancel an existing receipt
   * @param {string} id
   * @param {string} reason
   */
  static async cancelReceipt(id, reason = 'Cancelled') {
    const receipt = await prisma.moneyReceipt.findUnique({ where: { id, isActive: true } });
    if (!receipt) {
      const error = new Error('Receipt not found');
      error.statusCode = 404;
      throw error;
    }

    const updated = await prisma.moneyReceipt.update({
      where: { id },
      data: {
        status: 'cancelled',
        notes: receipt.notes ? `${receipt.notes} [Cancelled: ${reason}]` : `[Cancelled: ${reason}]`,
      },
    });

    return updated;
  }

  /**
   * Update Bank Deposit status
   * @param {string} id
   * @param {Object} input
   */
  static async updateBankDeposit(id, { handedOverToBank, bankDepositRef = '', bankDepositDate = null }) {
    const receipt = await prisma.moneyReceipt.findUnique({ where: { id, isActive: true } });
    if (!receipt) {
      const error = new Error('Receipt not found');
      error.statusCode = 404;
      throw error;
    }

    const updated = await prisma.moneyReceipt.update({
      where: { id },
      data: {
        handedOverToBank,
        bankDepositRef,
        bankDepositDate: handedOverToBank ? (bankDepositDate ? new Date(bankDepositDate) : new Date()) : null,
      },
    });

    return updated;
  }

  /**
   * Aggregates live Financial KPI summary
   */
  static async getReceiptSummary() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const [todayConfirmed, pendingTokens, officeCash, bankDeposited] = await Promise.all([
      // 1. Today's confirmed collections
      prisma.moneyReceipt.aggregate({
        where: {
          isActive: true,
          status: 'confirmed',
          confirmedAt: { gte: startOfToday, lte: endOfToday },
        },
        _sum: { amount: true },
        _count: { id: true },
      }),
      // 2. All pending tokens
      prisma.moneyReceipt.aggregate({
        where: { isActive: true, status: 'pending' },
        _sum: { amount: true },
        _count: { id: true },
      }),
      // 3. Cash in office (Confirmed but NOT handed over to bank)
      prisma.moneyReceipt.aggregate({
        where: {
          isActive: true,
          status: 'confirmed',
          handedOverToBank: false,
        },
        _sum: { amount: true },
        _count: { id: true },
      }),
      // 4. Deposited in bank
      prisma.moneyReceipt.aggregate({
        where: {
          isActive: true,
          status: 'confirmed',
          handedOverToBank: true,
        },
        _sum: { amount: true },
        _count: { id: true },
      }),
    ]);

    return {
      todayConfirmedAmount: Number(todayConfirmed._sum.amount || 0),
      todayConfirmedCount: todayConfirmed._count.id || 0,
      pendingTokensAmount: Number(pendingTokens._sum.amount || 0),
      pendingTokensCount: pendingTokens._count.id || 0,
      officeCashBalance: Number(officeCash._sum.amount || 0),
      officeCashCount: officeCash._count.id || 0,
      bankDepositedAmount: Number(bankDeposited._sum.amount || 0),
      bankDepositedCount: bankDeposited._count.id || 0,
    };
  }

  /**
   * Fast autocomplete lookup
   * @param {string} query
   */
  static async lookupReceipts(query) {
    if (!query || !query.trim()) return [];

    const term = query.trim();
    return prisma.moneyReceipt.findMany({
      where: {
        isActive: true,
        OR: [
          { receiptNo: { contains: term, mode: 'insensitive' } },
          { clientName: { contains: term, mode: 'insensitive' } },
          { clientPhone: { contains: term, mode: 'insensitive' } },
          { passportNumber: { contains: term, mode: 'insensitive' } },
        ],
      },
      take: 10,
      select: {
        id: true,
        receiptNo: true,
        clientName: true,
        clientPhone: true,
        passportNumber: true,
        serviceType: true,
        amount: true,
        status: true,
      },
    });
  }

  /**
   * Soft delete a receipt
   * @param {string} id
   */
  static async deleteReceipt(id) {
    const receipt = await prisma.moneyReceipt.findUnique({ where: { id } });
    if (!receipt) {
      const error = new Error('Receipt not found');
      error.statusCode = 404;
      throw error;
    }

    await prisma.moneyReceipt.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Receipt deleted successfully' };
  }
}

export default MoneyReceiptService;
