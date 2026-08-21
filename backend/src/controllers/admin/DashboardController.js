import { InvoiceModel } from '../../models/invoice.model.js';
import { IndianVisaSubmissionModel } from '../../models/indianVisaSubmission.model.js';
import { PassportSubmissionModel } from '../../models/passportSubmission.model.js';
import { EmploymentAgreementModel } from '../../models/employmentAgreement.model.js';
import { SalarySlipModel } from '../../models/salarySlip.model.js';
import { UserModel } from '../../models/user.model.js';
import { CandidateCaseFileModel } from '../../models/candidateCaseFile.model.js';
import { NotificationModel } from '../../models/notification.model.js';

export const getErpOverviewStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalCandidates,
      totalInvoices,
      totalVisas,
      totalPassports,
      totalAgreements,
      totalSalarySlips,
      invoiceAgg,
      recentNotifications,
    ] = await Promise.all([
      UserModel.countDocuments({ isActive: true }),
      CandidateCaseFileModel.countDocuments(),
      InvoiceModel.countDocuments(),
      IndianVisaSubmissionModel.countDocuments(),
      PassportSubmissionModel.countDocuments(),
      EmploymentAgreementModel.countDocuments(),
      SalarySlipModel.countDocuments(),
      InvoiceModel.aggregate([
        {
          $group: {
            _id: null,
            totalBilled: { $sum: '$grandTotal' },
            totalCount: { $sum: 1 },
          },
        },
      ]),
      NotificationModel.find().sort({ createdAt: -1 }).limit(15),
    ]);

    const billingStats = invoiceAgg[0] || {
      totalBilled: 0,
      totalPaid: 0,
      totalPending: 0,
      billCount: totalInvoices,
    };

    return res.json({
      status: 'success',
      data: {
        totalUsers,
        totalCandidates,
        totalInvoices,
        totalVisas,
        totalPassports,
        totalAgreements,
        totalSalarySlips,
        billing: billingStats,
        payments: [],
        notifications: recentNotifications || [],
      },
    });
  } catch (err) {
    next(err);
  }
};

export const dailyOrders = async (req, res, next) => {
  try {
    const days = Math.max(1, parseInt(req.query.days || '30', 10));
    const OFFSET_MS = 6 * 60 * 60 * 1000;
    const nowLocal = new Date(Date.now() + OFFSET_MS);
    const todayLocal = new Date(nowLocal);
    todayLocal.setUTCHours(0, 0, 0, 0);
    const from = new Date(todayLocal.getTime() - (days - 1) * 24 * 60 * 60 * 1000 - OFFSET_MS);

    const agg = await InvoiceModel.aggregate([
      { $match: { createdAt: { $gte: from } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: '+06:00' } }, count: { $sum: 1 } } },
      { $sort: { '_id': 1 } },
    ]);
    const countsByDate = Object.fromEntries(agg.map((r) => [r._id, r.count]));

    const result = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(from.getTime() + i * 24 * 60 * 60 * 1000 + OFFSET_MS);
      const key = d.toISOString().slice(0, 10);
      result.push({ date: key, count: countsByDate[key] || 0 });
    }

    return res.json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
};

export const getKpiStats = async (req, res, next) => {
  try {
    const totalInvoices = await InvoiceModel.countDocuments();
    const totalVisas = await IndianVisaSubmissionModel.countDocuments();
    const totalAgreements = await EmploymentAgreementModel.countDocuments();
    const totalPassports = await PassportSubmissionModel.countDocuments();

    return res.json({
      status: 'success',
      data: {
        sales: 0,
        completedOrders: totalInvoices,
        aov: 0,
        members: totalVisas + totalPassports + totalAgreements,
        trends: {
          sales: '0.0',
          orders: '0.0',
          aov: '0.0',
          members: '0.0',
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getOrderStatusDistribution = async (req, res, next) => {
  try {
    const counts = {
      processing: 0,
      shipped: 0,
      completed: 0,
      cancelled: 0,
    };

    return res.json({
      status: 'success',
      data: {
        statusCounts: counts,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getAccountingStats = async (req, res, next) => {
  try {
    const [
      invoiceAgg,
      invoiceDueAgg,
      cashVoucherAgg,
      salarySlipAgg,
    ] = await Promise.all([
      InvoiceModel.aggregate([
        { $group: { _id: null, totalRevenue: { $sum: '$grandTotal' } } }
      ]),
      InvoiceModel.aggregate([
        { $match: { paymentStatus: { $in: ['Pending', 'Overdue'] } } },
        { $group: { _id: null, totalDues: { $sum: '$grandTotal' } } }
      ]),
      import('../../models/cashVoucher.model.js').then(({ CashVoucherModel }) => 
        CashVoucherModel.aggregate([
          { $match: { status: 'confirmed' } },
          { $group: { _id: null, totalExpenses: { $sum: '$grandTotal' } } }
        ])
      ),
      SalarySlipModel.aggregate([
        { $group: { _id: null, totalPayroll: { $sum: '$netSalaryPayable' } } }
      ]),
    ]);

    const totalRevenue = invoiceAgg[0]?.totalRevenue || 0;
    const totalDues = invoiceDueAgg[0]?.totalDues || 0;
    const totalExpenses = cashVoucherAgg[0]?.totalExpenses || 0;
    const totalPayroll = salarySlipAgg[0]?.totalPayroll || 0;

    return res.json({
      status: 'success',
      data: {
        totalRevenue,
        totalDues,
        officeExpenses: totalExpenses,
        payroll: totalPayroll,
        netProfit: totalRevenue - (totalExpenses + totalPayroll),
      },
    });
  } catch (err) {
    next(err);
  }
};

export default { getErpOverviewStats, dailyOrders, getKpiStats, getOrderStatusDistribution, getAccountingStats };
