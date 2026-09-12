import { InvoiceModel } from '../../models/invoice.model.js';
import { IndianVisaSubmissionModel } from '../../models/indianVisaSubmission.model.js';
import { PassportSubmissionModel } from '../../models/passportSubmission.model.js';
import { EmploymentAgreementModel } from '../../models/employmentAgreement.model.js';
import { SalarySlipModel } from '../../models/salarySlip.model.js';
import { UserModel } from '../../models/user.model.js';
import { ClientCaseFileModel } from '../../models/clientCaseFile.model.js';
import { NotificationModel } from '../../models/notification.model.js';
import { CashVoucherModel } from '../../models/cashVoucher.model.js';
import CaseFile from '../../models/caseFile.model.js';
import Client from '../../models/client.model.js';
import BillModel from '../../models/bill.model.js';
import MoneyReceiptModel from '../../models/moneyReceipt.model.js';

export const getErpOverviewStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalClients,
      totalCases,
      remainingCases,
      receiptAgg,
      billAgg,
      recentCases,
      recentNotifications,
    ] = await Promise.all([
      UserModel.countDocuments({ isActive: true }),
      Client.countDocuments(),
      CaseFile.countDocuments(),
      CaseFile.countDocuments({
        status: { $nin: ['COMPLETED', 'COMPLETED_DELIVERED', 'REJECTED'] },
      }),
      MoneyReceiptModel.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      BillModel.aggregate([
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      CaseFile.find()
        .sort({ updatedAt: -1, createdAt: -1 })
        .limit(6)
        .select('caseNumber applicantName caseType status updatedAt createdAt phone clientDid'),
      NotificationModel.find().sort({ createdAt: -1 }).limit(15),
    ]);

    const totalReceived = receiptAgg[0]?.total || 0;
    const totalBilled = billAgg[0]?.total || 0;

    return res.json({
      status: 'success',
      data: {
        totalUsers,
        totalClients,
        totalCases,
        filesRemaining: remainingCases,
        totalReceived,
        totalBilled,
        billing: {
          totalBilled,
          totalPaid: totalReceived,
          totalPending: Math.max(0, totalBilled - totalReceived),
        },
        latestUpdates: recentCases,
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
    const OFFSET_MS = 6 * 60 * 60 * 1000; // Dhaka timezone UTC+6
    const nowLocal = new Date(Date.now() + OFFSET_MS);
    const todayLocal = new Date(nowLocal);
    todayLocal.setUTCHours(0, 0, 0, 0);
    const from = new Date(todayLocal.getTime() - (days - 1) * 24 * 60 * 60 * 1000 - OFFSET_MS);

    const [caseAgg, receiptAgg] = await Promise.all([
      CaseFile.aggregate([
        { $match: { createdAt: { $gte: from } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: '+06:00' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      MoneyReceiptModel.aggregate([
        { $match: { createdAt: { $gte: from }, status: { $ne: 'cancelled' } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: '+06:00' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const caseCounts = Object.fromEntries(caseAgg.map((r) => [r._id, r.count]));
    const receiptCounts = Object.fromEntries(receiptAgg.map((r) => [r._id, r.count]));

    const result = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(from.getTime() + i * 24 * 60 * 60 * 1000 + OFFSET_MS);
      const key = d.toISOString().slice(0, 10);
      result.push({
        date: key,
        cases: caseCounts[key] || 0,
        receipts: receiptCounts[key] || 0,
        count: caseCounts[key] || 0, // Fallback for components expecting count
      });
    }

    return res.json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
};

export const getDashboardChartsData = async (req, res, next) => {
  try {
    const now = new Date();
    const months = [];
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Last 6 months boundaries
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push({
        key: monthKey,
        month: monthLabels[d.getMonth()],
        year: d.getFullYear(),
        collections: 0,
        bills: 0,
      });
    }
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [monthlyReceipts, monthlyBills, destinationAgg, statusAgg] = await Promise.all([
      MoneyReceiptModel.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo }, status: { $ne: 'cancelled' } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt', timezone: '+06:00' } },
            total: { $sum: '$amount' },
          },
        },
      ]),
      BillModel.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt', timezone: '+06:00' } },
            total: { $sum: '$amount' },
          },
        },
      ]),
      CaseFile.aggregate([
        {
          $group: {
            _id: { $toLower: { $ifNull: ['$caseType', 'other'] } },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
      CaseFile.aggregate([
        {
          $group: {
            _id: { $ifNull: ['$status', 'INTAKE'] },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),
    ]);

    const receiptMap = Object.fromEntries(monthlyReceipts.map((r) => [r._id, r.total]));
    const billMap = Object.fromEntries(monthlyBills.map((b) => [b._id, b.total]));

    const financialTrend = months.map((m) => ({
      month: m.month,
      collections: receiptMap[m.key] || 0,
      bills: billMap[m.key] || 0,
    }));

    const destinationDistribution = destinationAgg.map((item) => ({
      destination: item._id.toUpperCase(),
      count: item.count,
    }));

    const stageDistribution = statusAgg.map((item) => ({
      stage: item._id,
      count: item.count,
    }));

    return res.json({
      status: 'success',
      data: {
        financialTrend,
        destinationDistribution,
        stageDistribution,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getKpiStats = async (req, res, next) => {
  try {
    const totalCases = await CaseFile.countDocuments();
    const totalClients = await Client.countDocuments();
    const totalBills = await BillModel.countDocuments();
    const totalReceipts = await MoneyReceiptModel.countDocuments();

    return res.json({
      status: 'success',
      data: {
        sales: 0,
        completedOrders: totalCases,
        aov: 0,
        members: totalClients,
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
      receiptAgg,
      billDueAgg,
      cashVoucherAgg,
      salarySlipAgg,
    ] = await Promise.all([
      MoneyReceiptModel.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
      ]),
      BillModel.aggregate([
        { $match: { paymentStatus: { $in: ['Unpaid', 'Partial'] } } },
        { $group: { _id: null, totalDues: { $sum: '$dueAmount' } } },
      ]),
      CashVoucherModel.aggregate([
        { $match: { status: 'confirmed' } },
        { $group: { _id: null, totalExpenses: { $sum: '$grandTotal' } } },
      ]),
      SalarySlipModel.aggregate([
        { $group: { _id: null, totalPayroll: { $sum: '$netSalaryPayable' } } },
      ]),
    ]);

    const totalRevenue = receiptAgg[0]?.totalRevenue || 0;
    const totalDues = billDueAgg[0]?.totalDues || 0;
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

export default {
  getErpOverviewStats,
  dailyOrders,
  getDashboardChartsData,
  getKpiStats,
  getOrderStatusDistribution,
  getAccountingStats,
};
