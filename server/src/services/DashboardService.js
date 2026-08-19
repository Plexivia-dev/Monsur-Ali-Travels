import prisma from '../config/prisma.js';

export class DashboardService {
  /**
   * Aggregates system-wide analytics metrics
   */
  static async getOverviewMetrics() {
    const [
      totalCustomers,
      totalVisas,
      totalPassports,
      totalCases,
      totalInvoices,
      totalReceipts,
      financials,
    ] = await Promise.all([
      prisma.customer.count({ where: { isActive: true } }),
      prisma.indianVisaSubmission.count({ where: { isActive: true } }),
      prisma.passportSubmission.count({ where: { isActive: true } }),
      prisma.caseFile.count({ where: { isActive: true } }),
      prisma.invoice.count({ where: { isActive: true } }),
      prisma.moneyReceipt.count({ where: { isActive: true } }),
      prisma.customer.aggregate({
        where: { isActive: true },
        _sum: {
          totalBilledAmount: true,
          totalPaidAmount: true,
          totalDueAmount: true,
        },
      }),
    ]);

    // Recent 5 activities from across services
    const [recentCustomers, recentReceipts, recentCases] = await Promise.all([
      prisma.customer.findMany({
        where: { isActive: true },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, customerCode: true, fullName: true, phone: true, createdAt: true },
      }),
      prisma.moneyReceipt.findMany({
        where: { isActive: true },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, receiptNo: true, clientName: true, amount: true, status: true, createdAt: true },
      }),
      prisma.caseFile.findMany({
        where: { isActive: true },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, caseNumber: true, applicantName: true, status: true, createdAt: true },
      }),
    ]);

    return {
      counts: {
        customers: totalCustomers,
        visas: totalVisas,
        passports: totalPassports,
        cases: totalCases,
        invoices: totalInvoices,
        receipts: totalReceipts,
      },
      financialLedger: {
        totalBilled: Number(financials._sum.totalBilledAmount || 0),
        totalPaid: Number(financials._sum.totalPaidAmount || 0),
        totalDue: Number(financials._sum.totalDueAmount || 0),
      },
      recentActivity: {
        customers: recentCustomers,
        receipts: recentReceipts,
        cases: recentCases,
      },
    };
  }
}

export default DashboardService;
