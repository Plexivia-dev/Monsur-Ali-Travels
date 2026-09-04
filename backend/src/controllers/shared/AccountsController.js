import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MoneyReceiptModel } from "../../models/moneyReceipt.model.js";
import { InvoiceModel } from "../../models/invoice.model.js";
import { SalarySlipModel } from "../../models/salarySlip.model.js";
import { CashVoucherModel } from "../../models/cashVoucher.model.js";
import { BillModel } from "../../models/bill.model.js";
import { SystemLogModel } from "../../models/systemLog.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// VPS Storage Directory for Archived CSV Exports
function getExportDir() {
  const preferredDir = path.resolve(__dirname, "../../../storage/exports/reports");
  try {
    if (!fs.existsSync(preferredDir)) {
      fs.mkdirSync(preferredDir, { recursive: true });
    }
    return preferredDir;
  } catch (_err) {
    const fallbackDir = path.join(os.tmpdir(), "exports/reports");
    if (!fs.existsSync(fallbackDir)) {
      fs.mkdirSync(fallbackDir, { recursive: true });
    }
    return fallbackDir;
  }
}

// ── Helper: Date Range Filter Builder ──────────────────────────────────────────
function buildDateFilter(period, startDate, endDate, dateField = "createdAt") {
  const now = new Date();
  let start = null;
  let end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  switch (period) {
    case "today":
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      break;

    case "this_week": {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday start
      start = new Date(now.getFullYear(), now.getMonth(), diff, 0, 0, 0, 0);
      break;
    }

    case "last_week": {
      const day = now.getDay();
      const diff = now.getDate() - day - 6;
      start = new Date(now.getFullYear(), now.getMonth(), diff, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), diff + 6, 23, 59, 59, 999);
      break;
    }

    case "this_month":
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      break;

    case "last_month":
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      break;

    case "this_quarter": {
      const qMonth = Math.floor(now.getMonth() / 3) * 3;
      start = new Date(now.getFullYear(), qMonth, 1, 0, 0, 0, 0);
      break;
    }

    case "this_year":
      start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      break;

    case "custom":
      if (startDate) start = new Date(startDate);
      if (endDate) {
        const e = new Date(endDate);
        e.setHours(23, 59, 59, 999);
        end = e;
      }
      break;

    default:
      if (startDate || endDate) {
        if (startDate) start = new Date(startDate);
        if (endDate) {
          const e = new Date(endDate);
          e.setHours(23, 59, 59, 999);
          end = e;
        }
      }
      break;
  }

  const query = {};
  if (start && end) {
    query[dateField] = { $gte: start, $lte: end };
  } else if (start) {
    query[dateField] = { $gte: start };
  } else if (end) {
    query[dateField] = { $lte: end };
  }
  return { query, start, end };
}

// ── 1. GET /api/v1/accounts/payments ──────────────────────────────────────────
export const getPayments = async (req, res, next) => {
  try {
    const {
      search = "",
      status = "",
      paymentMethod = "",
      period = "",
      startDate = "",
      endDate = "",
      page = 1,
      limit = 25,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const { query: dateQuery } = buildDateFilter(period, startDate, endDate, "createdAt");
    const filter = { ...dateQuery };

    if (status && status !== "all") {
      filter.status = new RegExp(`^${status}$`, "i");
    }
    if (paymentMethod && paymentMethod !== "all") {
      filter.paymentMethod = new RegExp(`^${paymentMethod}$`, "i");
    }
    if (search) {
      filter.$or = [
        { receiptNo: { $regex: search, $options: "i" } },
        { clientName: { $regex: search, $options: "i" } },
        { clientPhone: { $regex: search, $options: "i" } },
        { passportNumber: { $regex: search, $options: "i" } },
        { purpose: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const take = Math.min(100, parseInt(limit, 10) || 25);
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [items, total] = await Promise.all([
      MoneyReceiptModel.find(filter).sort(sort).skip(skip).limit(take).lean(),
      MoneyReceiptModel.countDocuments(filter),
    ]);

    const totalAmount = await MoneyReceiptModel.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    res.json({
      status: "success",
      data: items,
      meta: {
        total,
        page: parseInt(page, 10),
        limit: take,
        totalPages: Math.ceil(total / take) || 1,
        totalAmount: totalAmount[0]?.total || 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── 2. Company Expense Bills: GET, POST, PUT, DELETE /api/v1/accounts/bills ──
export const getBills = async (req, res, next) => {
  try {
    const {
      search = "",
      category = "",
      paymentStatus = "",
      period = "",
      startDate = "",
      endDate = "",
      page = 1,
      limit = 25,
      sortBy = "billDate",
      sortOrder = "desc",
    } = req.query;

    const { query: dateQuery } = buildDateFilter(period, startDate, endDate, "billDate");
    const filter = { ...dateQuery };

    if (category && category !== "all") {
      filter.category = new RegExp(`^${category}$`, "i");
    }
    if (paymentStatus && paymentStatus !== "all") {
      filter.paymentStatus = new RegExp(`^${paymentStatus}$`, "i");
    }
    if (search) {
      filter.$or = [
        { billNumber: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
        { payee: { $regex: search, $options: "i" } },
        { payeePhone: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } },
        { did: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const take = Math.min(100, parseInt(limit, 10) || 25);
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [items, total] = await Promise.all([
      BillModel.find(filter).sort(sort).skip(skip).limit(take).lean(),
      BillModel.countDocuments(filter),
    ]);

    const totalStats = await BillModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          totalPaid: { $sum: "$paidAmount" },
          totalDue: { $sum: "$dueAmount" },
        },
      },
    ]);

    res.json({
      status: "success",
      data: items,
      meta: {
        total,
        page: parseInt(page, 10),
        limit: take,
        totalPages: Math.ceil(total / take) || 1,
        totalAmount: totalStats[0]?.totalAmount || 0,
        totalPaid: totalStats[0]?.totalPaid || 0,
        totalDue: totalStats[0]?.totalDue || 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const createBill = async (req, res, next) => {
  try {
    const {
      title,
      category,
      payee,
      payeePhone,
      amount,
      paidAmount,
      billDate,
      dueDate,
      paymentStatus,
      paymentMethod,
      bankAccount,
      documentUrl,
      documentName,
      documentSize,
      notes,
    } = req.body || {};

    if (!title || !title.trim()) {
      return res.status(400).json({ status: "error", message: "Bill Title / Description is required" });
    }
    if (!payee || !payee.trim()) {
      return res.status(400).json({ status: "error", message: "Paid To / Payee Name is required" });
    }
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ status: "error", message: "Valid Bill Amount is required" });
    }

    const resolvedPaid =
      paymentStatus === "Paid"
        ? numAmount
        : paymentStatus === "Unpaid"
        ? 0
        : Number(paidAmount) || 0;

    const newBill = await BillModel.create({
      title: title.trim(),
      category: category || "Other Office Expense",
      payee: payee.trim(),
      payeePhone: payeePhone ? payeePhone.trim() : "",
      amount: numAmount,
      paidAmount: resolvedPaid,
      dueAmount: Math.max(0, numAmount - resolvedPaid),
      billDate: billDate ? new Date(billDate) : new Date(),
      dueDate: dueDate ? new Date(dueDate) : null,
      paymentStatus: paymentStatus || "Paid",
      paymentMethod: paymentMethod || "Cash",
      bankAccount: bankAccount || "",
      documentUrl: documentUrl || "",
      documentName: documentName || "",
      documentSize: documentSize || "",
      notes: notes ? notes.trim() : "",
      createdByDid: req.user?.did || "",
      createdByName: req.user?.name || "Accounts Officer",
    });

    res.status(201).json({
      status: "success",
      message: `Bill "${newBill.title}" (${newBill.billNumber}) recorded successfully`,
      data: newBill,
    });
  } catch (err) {
    next(err);
  }
};

export const getBillById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bill = await BillModel.findOne({
      $or: [{ _id: id }, { did: id }, { billNumber: id }],
    }).lean();

    if (!bill) {
      return res.status(404).json({ status: "error", message: "Bill not found" });
    }

    res.json({
      status: "success",
      data: bill,
    });
  } catch (err) {
    next(err);
  }
};

export const updateBill = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body || {};

    const bill = await BillModel.findOne({
      $or: [{ _id: id }, { did: id }, { billNumber: id }],
    });

    if (!bill) {
      return res.status(404).json({ status: "error", message: "Bill not found" });
    }

    if (updates.title) bill.title = updates.title.trim();
    if (updates.category) bill.category = updates.category;
    if (updates.payee) bill.payee = updates.payee.trim();
    if (updates.payeePhone !== undefined) bill.payeePhone = updates.payeePhone;
    if (updates.amount !== undefined) bill.amount = Number(updates.amount);
    if (updates.paidAmount !== undefined) bill.paidAmount = Number(updates.paidAmount);
    if (updates.paymentStatus) bill.paymentStatus = updates.paymentStatus;
    if (updates.paymentMethod) bill.paymentMethod = updates.paymentMethod;
    if (updates.billDate) bill.billDate = new Date(updates.billDate);
    if (updates.dueDate !== undefined) bill.dueDate = updates.dueDate ? new Date(updates.dueDate) : null;
    if (updates.documentUrl !== undefined) bill.documentUrl = updates.documentUrl;
    if (updates.documentName !== undefined) bill.documentName = updates.documentName;
    if (updates.documentSize !== undefined) bill.documentSize = updates.documentSize;
    if (updates.notes !== undefined) bill.notes = updates.notes;

    await bill.save();

    res.json({
      status: "success",
      message: `Bill ${bill.billNumber} updated successfully`,
      data: bill,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteBill = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await BillModel.findOneAndDelete({
      $or: [{ _id: id }, { did: id }, { billNumber: id }],
    });

    if (!deleted) {
      return res.status(404).json({ status: "error", message: "Bill not found" });
    }

    res.json({
      status: "success",
      message: `Bill ${deleted.billNumber} deleted successfully`,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Settle / Pay Due Bill (Full or Partial)
// @route   POST /api/v1/accounts/bills/:id/settle
export const settleBillPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, paymentMethod, bankAccount, paidDate, notes } = req.body || {};

    const isMongoId = Boolean(id.match(/^[0-9a-fA-F]{24}$/));
    const bill = await BillModel.findOne({
      $or: [
        ...(isMongoId ? [{ _id: id }] : []),
        { did: id },
        { billNumber: id },
      ],
    });

    if (!bill) {
      return res.status(404).json({ status: "error", message: "Bill not found" });
    }

    const payAmount = Number(amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      return res.status(400).json({ status: "error", message: "Valid payment amount is required" });
    }

    const currentDue = Number(bill.dueAmount) || Math.max(0, (bill.amount || 0) - (bill.paidAmount || 0));
    if (payAmount > currentDue) {
      return res.status(400).json({
        status: "error",
        message: `Payment amount (৳${payAmount.toLocaleString("en-BD")}) exceeds remaining due (৳${currentDue.toLocaleString("en-BD")})`,
      });
    }

    const newPaidAmount = (Number(bill.paidAmount) || 0) + payAmount;
    const newDueAmount = Math.max(0, (Number(bill.amount) || 0) - newPaidAmount);
    const newStatus = newDueAmount === 0 ? "Paid" : "Partial";

    const historyEntry = {
      amount: payAmount,
      paymentMethod: paymentMethod || bill.paymentMethod || "Cash",
      bankAccount: bankAccount || bill.bankAccount || "",
      paidDate: paidDate ? new Date(paidDate) : new Date(),
      notes: notes ? notes.trim() : "",
      recordedBy: req.user?.name || "Accounts Officer",
      createdAt: new Date(),
    };

    bill.paidAmount = newPaidAmount;
    bill.dueAmount = newDueAmount;
    bill.paymentStatus = newStatus;
    if (paymentMethod) bill.paymentMethod = paymentMethod;
    if (bankAccount) bill.bankAccount = bankAccount;
    if (!bill.paymentHistory) bill.paymentHistory = [];
    bill.paymentHistory.push(historyEntry);

    await bill.save();

    res.status(200).json({
      status: "success",
      message: `Payment of ৳${payAmount.toLocaleString("en-BD")} recorded successfully for Bill ${bill.billNumber}`,
      data: bill,
    });
  } catch (err) {
    next(err);
  }
};


// ── 3. GET /api/v1/accounts/salaries ──────────────────────────────────────────
export const getSalaries = async (req, res, next) => {
  try {
    const {
      search = "",
      month = "",
      period = "",
      startDate = "",
      endDate = "",
      page = 1,
      limit = 25,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const { query: dateQuery } = buildDateFilter(period, startDate, endDate, "createdAt");
    const filter = { ...dateQuery };

    if (month && month !== "all") {
      filter.salaryMonth = new RegExp(`^${month}$`, "i");
    }
    if (search) {
      filter.$or = [
        { slipNo: { $regex: search, $options: "i" } },
        { employeeName: { $regex: search, $options: "i" } },
        { employeeId: { $regex: search, $options: "i" } },
        { designation: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
        { salaryMonth: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const take = Math.min(100, parseInt(limit, 10) || 25);
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [items, total] = await Promise.all([
      SalarySlipModel.find(filter).sort(sort).skip(skip).limit(take).lean(),
      SalarySlipModel.countDocuments(filter),
    ]);

    const totals = await SalarySlipModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalGross: { $sum: { $ifNull: ["$grossEarnings", 0] } },
          totalDeductions: { $sum: { $ifNull: ["$totalDeduction", 0] } },
          totalNetPayable: { $sum: { $ifNull: ["$netSalaryPayable", 0] } },
        },
      },
    ]);

    res.json({
      status: "success",
      data: items,
      meta: {
        total,
        page: parseInt(page, 10),
        limit: take,
        totalPages: Math.ceil(total / take) || 1,
        totalGross: totals[0]?.totalGross || 0,
        totalDeductions: totals[0]?.totalDeductions || 0,
        totalNetPayable: totals[0]?.totalNetPayable || 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── 4. GET /api/v1/accounts/expenses ──────────────────────────────────────────
export const getExpenses = async (req, res, next) => {
  try {
    const {
      search = "",
      status = "",
      period = "",
      startDate = "",
      endDate = "",
      page = 1,
      limit = 25,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const { query: dateQuery } = buildDateFilter(period, startDate, endDate, "createdAt");
    const filter = { ...dateQuery };

    if (status && status !== "all") {
      filter.status = new RegExp(`^${status}$`, "i");
    }
    if (search) {
      filter.$or = [
        { voucherNo: { $regex: search, $options: "i" } },
        { preparedBy: { $regex: search, $options: "i" } },
        { receivedBy: { $regex: search, $options: "i" } },
        { "items.descriptionBn": { $regex: search, $options: "i" } },
        { "items.descriptionEn": { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const take = Math.min(100, parseInt(limit, 10) || 25);
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [items, total] = await Promise.all([
      CashVoucherModel.find(filter).sort(sort).skip(skip).limit(take).lean(),
      CashVoucherModel.countDocuments(filter),
    ]);

    const totalExpense = await CashVoucherModel.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: { $ifNull: ["$grandTotal", "$subtotal"] } } } },
    ]);

    res.json({
      status: "success",
      data: items,
      meta: {
        total,
        page: parseInt(page, 10),
        limit: take,
        totalPages: Math.ceil(total / take) || 1,
        totalExpenseAmount: totalExpense[0]?.total || 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── 5. GET /api/v1/accounts/cash-book ──────────────────────────────────────────
export const getCashBook = async (req, res, next) => {
  try {
    const { period = "this_month", startDate = "", endDate = "" } = req.query;
    const { query: dateQuery } = buildDateFilter(period, startDate, endDate, "createdAt");

    // Inflow: Cash Money Receipts
    const cashReceiptsFilter = {
      ...dateQuery,
      paymentMethod: { $regex: /^cash$/i },
    };

    // Outflow 1: Cash Money Vouchers / Expenses
    const cashVouchersFilter = {
      ...dateQuery,
      status: { $ne: "cancelled" },
    };

    // Outflow 2: Company Bills Paid via Cash
    const cashBillsFilter = {
      ...dateQuery,
      paidAmount: { $gt: 0 },
      paymentMethod: { $regex: /^cash$/i },
    };

    const [cashReceipts, cashVouchers, cashBills] = await Promise.all([
      MoneyReceiptModel.find(cashReceiptsFilter).sort({ createdAt: -1 }).lean(),
      CashVoucherModel.find(cashVouchersFilter).sort({ createdAt: -1 }).lean(),
      BillModel.find(cashBillsFilter).sort({ createdAt: -1 }).lean(),
    ]);

    const totalCashIn = cashReceipts.reduce((sum, r) => sum + Number(r.amount || 0), 0);
    const totalVouchersOut = cashVouchers.reduce((sum, v) => sum + Number(v.grandTotal || v.subtotal || 0), 0);
    const totalBillsOut = cashBills.reduce((sum, b) => sum + Number(b.paidAmount || 0), 0);
    const totalCashOut = totalVouchersOut + totalBillsOut;
    const netCashBalance = totalCashIn - totalCashOut;

    // Combined timeline ledger
    const transactions = [
      ...cashReceipts.map((r) => ({
        id: r._id,
        type: "INFLOW",
        category: "Money Receipt",
        refNo: r.receiptNo,
        party: r.clientName,
        phone: r.clientPhone,
        description: r.purpose || r.serviceType || "Cash Collection",
        amountIn: Number(r.amount || 0),
        amountOut: 0,
        date: r.createdAt || r.date,
        status: r.status || "Confirmed",
      })),
      ...cashVouchers.map((v) => ({
        id: v._id,
        type: "OUTFLOW",
        category: "Cash Voucher",
        refNo: v.voucherNo,
        party: v.receivedBy || v.preparedBy,
        phone: "",
        description: v.items?.[0]?.descriptionEn || v.items?.[0]?.descriptionBn || "Cash Expense",
        amountIn: 0,
        amountOut: Number(v.grandTotal || v.subtotal || 0),
        date: v.createdAt || v.voucherDate,
        status: v.status || "Confirmed",
      })),
      ...cashBills.map((b) => ({
        id: b._id,
        type: "OUTFLOW",
        category: "Company Bill",
        refNo: b.billNumber || b.did,
        party: b.payee,
        phone: b.payeePhone || "",
        description: `${b.category} - ${b.title}`,
        amountIn: 0,
        amountOut: Number(b.paidAmount || 0),
        date: b.billDate || b.createdAt,
        status: b.paymentStatus || "Paid",
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      status: "success",
      data: {
        summary: {
          totalCashIn,
          totalCashOut,
          netCashBalance,
          totalTransactions: transactions.length,
          receiptsCount: cashReceipts.length,
          vouchersCount: cashVouchers.length,
          billsCount: cashBills.length,
        },
        transactions,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── 6. GET /api/v1/accounts/bank-ledger ────────────────────────────────────────
export const getBankLedger = async (req, res, next) => {
  try {
    const { period = "this_month", startDate = "", endDate = "" } = req.query;
    const { query: dateQuery } = buildDateFilter(period, startDate, endDate, "createdAt");

    // Bank / Digital Inflows (Money Receipts)
    const bankInflowFilter = {
      ...dateQuery,
      paymentMethod: { $not: { $regex: /^cash$/i } },
    };

    // Bank / Digital Outflows (Company Bills Paid via Bank, Cheque, bKash, etc.)
    const bankOutflowFilter = {
      ...dateQuery,
      paidAmount: { $gt: 0 },
      paymentMethod: { $not: { $regex: /^cash$/i } },
    };

    const [bankReceipts, bankBills] = await Promise.all([
      MoneyReceiptModel.find(bankInflowFilter).sort({ createdAt: -1 }).lean(),
      BillModel.find(bankOutflowFilter).sort({ createdAt: -1 }).lean(),
    ]);

    const channelSummary = {};
    let totalBankIn = 0;
    let totalBankOut = 0;

    for (const r of bankReceipts) {
      const method = (r.paymentMethod || "Bank Transfer").toLowerCase();
      const amount = Number(r.amount || 0);
      totalBankIn += amount;
      channelSummary[method] = (channelSummary[method] || 0) + amount;
    }

    for (const b of bankBills) {
      const amount = Number(b.paidAmount || 0);
      totalBankOut += amount;
    }

    const netBankBalance = totalBankIn - totalBankOut;

    const transactions = [
      ...bankReceipts.map((r) => ({
        id: r._id,
        type: "INFLOW",
        category: "Client Deposit",
        refNo: r.receiptNo,
        method: r.paymentMethod || "Bank Transfer",
        party: r.clientName,
        phone: r.clientPhone,
        passport: r.passportNumber,
        description: r.purpose || r.serviceType || "Bank / Digital Deposit",
        bankName: r.bankName || "",
        accountNo: r.bankAccountNo || "",
        amountIn: Number(r.amount || 0),
        amountOut: 0,
        amount: Number(r.amount || 0),
        date: r.createdAt || r.date,
        status: r.status || "Confirmed",
      })),
      ...bankBills.map((b) => ({
        id: b._id,
        type: "OUTFLOW",
        category: "Bill / Expense",
        refNo: b.billNumber || b.did,
        method: b.paymentMethod || "Bank Transfer",
        party: b.payee,
        phone: b.payeePhone || "",
        passport: "",
        description: `${b.category} - ${b.title}`,
        bankName: b.bankAccount || "",
        accountNo: "",
        amountIn: 0,
        amountOut: Number(b.paidAmount || 0),
        amount: Number(b.paidAmount || 0),
        date: b.billDate || b.createdAt,
        status: b.paymentStatus || "Paid",
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      status: "success",
      data: {
        summary: {
          totalBankIn,
          totalBankOut,
          netBankBalance,
          totalTransactions: transactions.length,
          inflowsCount: bankReceipts.length,
          outflowsCount: bankBills.length,
          channelBreakdown: Object.entries(channelSummary).map(([channel, amount]) => ({
            channel: channel.toUpperCase(),
            amount,
          })),
        },
        transactions,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── 7. GET /api/v1/accounts/reports/summary ──────────────────────────────────
export const getReportsSummary = async (req, res, next) => {
  try {
    const { period = "this_month", startDate = "", endDate = "" } = req.query;
    const { query: receiptDateQuery, start, end } = buildDateFilter(period, startDate, endDate, "createdAt");
    const { query: invoiceDateQuery } = buildDateFilter(period, startDate, endDate, "createdAt");
    const { query: expenseDateQuery } = buildDateFilter(period, startDate, endDate, "createdAt");

    const [
      receiptTotals,
      methodBreakdown,
      invoiceTotals,
      paymentStatusBreakdown,
      expenseTotals,
      billTotals,
      salaryTotals,
      dailyReceipts,
      dailyInvoices,
    ] = await Promise.all([
      MoneyReceiptModel.aggregate([
        { $match: receiptDateQuery },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
            count: { $sum: 1 },
            confirmedAmount: {
              $sum: {
                $cond: [{ $eq: [{ $toLower: { $ifNull: ["$status", ""] } }, "confirmed"] }, "$amount", 0],
              },
            },
            confirmedCount: {
              $sum: {
                $cond: [{ $eq: [{ $toLower: { $ifNull: ["$status", ""] } }, "confirmed"] }, 1, 0],
              },
            },
          },
        },
      ]),
      MoneyReceiptModel.aggregate([
        { $match: receiptDateQuery },
        {
          $group: {
            _id: { $toLower: { $ifNull: ["$paymentMethod", "cash"] } },
            amount: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]),
      InvoiceModel.aggregate([
        { $match: invoiceDateQuery },
        {
          $group: {
            _id: null,
            totalBilled: { $sum: { $ifNull: ["$grandTotal", "$totalAmount"] } },
            totalPaid: {
              $sum: {
                $cond: [
                  { $eq: [{ $toLower: { $ifNull: ["$paymentStatus", "paid"] } }, "paid"] },
                  { $ifNull: ["$grandTotal", "$totalAmount"] },
                  { $ifNull: ["$paidAmount", 0] },
                ],
              },
            },
            totalDue: {
              $sum: {
                $cond: [
                  { $eq: [{ $toLower: { $ifNull: ["$paymentStatus", "paid"] } }, "paid"] },
                  0,
                  { $ifNull: ["$dueAmount", { $ifNull: ["$grandTotal", "$totalAmount"] }] },
                ],
              },
            },
            count: { $sum: 1 },
          },
        },
      ]),
      InvoiceModel.aggregate([
        { $match: invoiceDateQuery },
        {
          $group: {
            _id: { $toLower: { $ifNull: ["$paymentStatus", "pending"] } },
            amount: { $sum: { $ifNull: ["$grandTotal", "$totalAmount"] } },
            count: { $sum: 1 },
          },
        },
      ]),
      CashVoucherModel.aggregate([
        { $match: { ...expenseDateQuery, status: { $ne: "cancelled" } } },
        {
          $group: {
            _id: null,
            totalExpenses: { $sum: { $ifNull: ["$grandTotal", "$subtotal"] } },
            count: { $sum: 1 },
          },
        },
      ]),
      BillModel.aggregate([
        { $match: expenseDateQuery },
        {
          $group: {
            _id: null,
            totalBillsPaid: { $sum: { $ifNull: ["$paidAmount", 0] } },
            totalBillsDue: { $sum: { $ifNull: ["$dueAmount", 0] } },
            totalBillsAmount: { $sum: { $ifNull: ["$amount", 0] } },
            count: { $sum: 1 },
          },
        },
      ]),
      SalarySlipModel.aggregate([
        { $match: expenseDateQuery },
        {
          $group: {
            _id: null,
            totalSalaries: { $sum: { $ifNull: ["$netSalaryPayable", 0] } },
            count: { $sum: 1 },
          },
        },
      ]),
      MoneyReceiptModel.aggregate([
        { $match: receiptDateQuery },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            amount: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      InvoiceModel.aggregate([
        { $match: invoiceDateQuery },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            amount: { $sum: { $ifNull: ["$grandTotal", "$totalAmount"] } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const totalIncome = receiptTotals[0]?.totalAmount || 0;
    const totalBilled = invoiceTotals[0]?.totalBilled || 0;
    const accountsReceivable = invoiceTotals[0]?.totalDue || 0;
    const totalPaidOnInvoices = invoiceTotals[0]?.totalPaid || 0;

    const totalVouchersExpense = expenseTotals[0]?.totalExpenses || 0;
    const totalBillsPaid = billTotals[0]?.totalBillsPaid || 0;
    const accountsPayable = billTotals[0]?.totalBillsDue || 0;
    const totalSalaries = salaryTotals[0]?.totalSalaries || 0;

    const totalExpenses = totalVouchersExpense + totalBillsPaid;
    const totalOutflow = totalExpenses + totalSalaries;
    const netPosition = totalIncome - totalOutflow;

    res.json({
      status: "success",
      data: {
        filter: {
          period,
          startDate: start?.toISOString() || null,
          endDate: end?.toISOString() || null,
        },
        financials: {
          totalIncome,
          confirmedIncome: receiptTotals[0]?.confirmedAmount || totalIncome,
          receiptsCount: receiptTotals[0]?.count || 0,
          totalBilled,
          totalPaidOnInvoices,
          totalPaidOnBills: totalBillsPaid,
          totalDueOnBills: accountsPayable,
          accountsReceivable,
          accountsPayable,
          invoicesCount: invoiceTotals[0]?.count || 0,
          billsCount: billTotals[0]?.count || 0,
          totalExpenses,
          expensesCount: (expenseTotals[0]?.count || 0) + (billTotals[0]?.count || 0),
          totalSalaries,
          salariesCount: salaryTotals[0]?.count || 0,
          totalOutflow,
          netPosition,
        },
        methods: methodBreakdown.map((m) => ({
          method: m._id || "Other",
          amount: m.amount,
          count: m.count,
        })),
        invoiceStatuses: paymentStatusBreakdown.map((s) => ({
          status: s._id || "Other",
          amount: s.amount,
          count: s.count,
        })),
        timeline: {
          receipts: dailyReceipts.map((r) => ({ date: r._id, amount: r.amount, count: r.count })),
          invoices: dailyInvoices.map((i) => ({ date: i._id, amount: i.amount, count: i.count })),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── Helper: Format CSV field with proper quotes ───────────────────────────────
function formatCsvField(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

// ── 8. POST /api/v1/accounts/reports/export ──────────────────────────────────
export const exportReportCsv = async (req, res, next) => {
  try {
    const { type = "payments", period = "this_month", startDate = "", endDate = "" } = req.body || {};
    const { query: dateQuery, start, end } = buildDateFilter(period, startDate, endDate, "createdAt");

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timestamp = Date.now();
    const fileName = `report-${type}-${period || "custom"}-${dateStr}-${timestamp}.csv`;
    const exportDir = getExportDir();
    const filePath = path.join(exportDir, fileName);

    let csvContent = "";
    let recordCount = 0;
    let totalValue = 0;

    if (type === "payments") {
      const receipts = await MoneyReceiptModel.find(dateQuery).sort({ createdAt: -1 }).lean();
      recordCount = receipts.length;

      const headers = [
        "Receipt No",
        "Date",
        "Client Name",
        "Client Phone",
        "Passport No",
        "Service Type",
        "Purpose",
        "Payment Method",
        "Amount (BDT)",
        "Status",
        "Bank Details",
      ];
      const rows = [headers.map(formatCsvField).join(",")];

      for (const r of receipts) {
        totalValue += r.amount || 0;
        const row = [
          r.receiptNo || "",
          r.createdAt ? new Date(r.createdAt).toISOString().slice(0, 10) : "",
          r.clientName || "",
          r.clientPhone || "",
          r.passportNumber || "",
          r.serviceType || "",
          r.purpose || "",
          r.paymentMethod || "Cash",
          r.amount || 0,
          r.status || "Draft",
          r.bankName ? `${r.bankName} - ${r.bankAccountNo || ""}` : "",
        ];
        rows.push(row.map(formatCsvField).join(","));
      }
      csvContent = rows.join("\r\n");
    } else if (type === "bills") {
      const invoices = await InvoiceModel.find(dateQuery).sort({ createdAt: -1 }).lean();
      recordCount = invoices.length;

      const headers = [
        "Invoice No",
        "Date",
        "Customer Name",
        "Customer Phone",
        "Tracking No",
        "Subtotal",
        "Discount",
        "Tax",
        "Grand Total (BDT)",
        "Paid Amount",
        "Due Amount",
        "Payment Status",
      ];
      const rows = [headers.map(formatCsvField).join(",")];

      for (const inv of invoices) {
        const grand = inv.grandTotal || inv.totalAmount || 0;
        const custName = inv.client?.name || inv.customerName || "Unnamed";
        const custPhone = inv.client?.phone || inv.customerPhone || "";
        const st = String(inv.paymentStatus || "Paid").toLowerCase();
        let paid = inv.paidAmount;
        let due = inv.dueAmount;
        if (paid === undefined || due === undefined) {
          if (st === "paid") { paid = grand; due = 0; }
          else { paid = 0; due = grand; }
        }

        totalValue += grand;
        const row = [
          inv.invoiceNo || "",
          inv.createdAt ? new Date(inv.createdAt).toISOString().slice(0, 10) : "",
          custName,
          custPhone,
          inv.trackingNumber || "",
          inv.subtotal || 0,
          inv.discount || 0,
          inv.tax || 0,
          grand,
          paid,
          due,
          inv.paymentStatus || "Pending",
        ];
        rows.push(row.map(formatCsvField).join(","));
      }
      csvContent = rows.join("\r\n");
    } else if (type === "salaries") {
      const slips = await SalarySlipModel.find(dateQuery).sort({ createdAt: -1 }).lean();
      recordCount = slips.length;

      const headers = [
        "Slip No",
        "Salary Month",
        "Employee ID",
        "Employee Name",
        "Designation",
        "Department",
        "Payment Mode",
        "Gross Earnings (BDT)",
        "Total Deductions (BDT)",
        "Net Salary Payable (BDT)",
        "Date",
      ];
      const rows = [headers.map(formatCsvField).join(",")];

      for (const s of slips) {
        const net = s.netSalaryPayable || 0;
        totalValue += net;
        const row = [
          s.slipNo || "",
          s.salaryMonth || "",
          s.employeeId || "",
          s.employeeName || "",
          s.designation || "",
          s.department || "",
          s.paymentMode || "Cash",
          s.grossEarnings || 0,
          s.totalDeduction || 0,
          net,
          s.createdAt ? new Date(s.createdAt).toISOString().slice(0, 10) : "",
        ];
        rows.push(row.map(formatCsvField).join(","));
      }
      csvContent = rows.join("\r\n");
    } else if (type === "expenses") {
      const vouchers = await CashVoucherModel.find(dateQuery).sort({ createdAt: -1 }).lean();
      recordCount = vouchers.length;

      const headers = [
        "Voucher No",
        "Date",
        "Prepared By",
        "Received By",
        "Primary Description",
        "Subtotal (BDT)",
        "Grand Total (BDT)",
        "Status",
      ];
      const rows = [headers.map(formatCsvField).join(",")];

      for (const v of vouchers) {
        const grand = v.grandTotal || v.subtotal || 0;
        totalValue += grand;
        const desc = v.items?.[0]?.descriptionEn || v.items?.[0]?.descriptionBn || "Expense";
        const row = [
          v.voucherNo || "",
          v.voucherDate || (v.createdAt ? new Date(v.createdAt).toISOString().slice(0, 10) : ""),
          v.preparedBy || "",
          v.receivedBy || "",
          desc,
          v.subtotal || 0,
          grand,
          v.status || "confirmed",
        ];
        rows.push(row.map(formatCsvField).join(","));
      }
      csvContent = rows.join("\r\n");
    } else {
      // Consolidated Financial Report
      const [receipts, invoices, vouchers] = await Promise.all([
        MoneyReceiptModel.find(dateQuery).lean(),
        InvoiceModel.find(dateQuery).lean(),
        CashVoucherModel.find(dateQuery).lean(),
      ]);
      recordCount = receipts.length + invoices.length + vouchers.length;

      const headers = ["Category", "Reference ID", "Date", "Party Name", "Phone", "Description", "Inflow / Income (BDT)", "Outflow / Expense (BDT)", "Status"];
      const rows = [headers.map(formatCsvField).join(",")];

      for (const r of receipts) {
        totalValue += r.amount || 0;
        rows.push(
          [
            "Payment Receipt",
            r.receiptNo || "",
            r.createdAt ? new Date(r.createdAt).toISOString().slice(0, 10) : "",
            r.clientName || "",
            r.clientPhone || "",
            r.purpose || r.serviceType || "",
            r.amount || 0,
            0,
            r.status || "Confirmed",
          ]
            .map(formatCsvField)
            .join(",")
        );
      }

      for (const inv of invoices) {
        const grand = inv.grandTotal || inv.totalAmount || 0;
        rows.push(
          [
            "Invoice / Bill",
            inv.invoiceNo || "",
            inv.createdAt ? new Date(inv.createdAt).toISOString().slice(0, 10) : "",
            inv.client?.name || inv.customerName || "",
            inv.client?.phone || inv.customerPhone || "",
            `Invoice for ${inv.client?.name || inv.customerName || "Customer"}`,
            0,
            grand,
            inv.paymentStatus || "Pending",
          ]
            .map(formatCsvField)
            .join(",")
        );
      }

      for (const v of vouchers) {
        const grand = v.grandTotal || v.subtotal || 0;
        rows.push(
          [
            "Cash Voucher Expense",
            v.voucherNo || "",
            v.voucherDate || (v.createdAt ? new Date(v.createdAt).toISOString().slice(0, 10) : ""),
            v.receivedBy || v.preparedBy || "",
            "",
            v.items?.[0]?.descriptionEn || v.items?.[0]?.descriptionBn || "Cash Expense",
            0,
            grand,
            v.status || "Confirmed",
          ]
            .map(formatCsvField)
            .join(",")
        );
      }
      csvContent = rows.join("\r\n");
    }

    // Save CSV directly to VPS Storage
    fs.writeFileSync(filePath, csvContent, "utf8");
    const fileStats = fs.statSync(filePath);

    // Record Export Audit Log in VPS
    try {
      await SystemLogModel.create({
        action: "REPORT_EXPORT",
        category: "ACCOUNTS",
        details: `Exported ${type.toUpperCase()} CSV report (${recordCount} records, Total: BDT ${totalValue}) for period: ${period}`,
        userDid: req.user?.did || "system",
        userName: req.user?.name || "Admin",
        meta: {
          type,
          period,
          recordCount,
          totalValue,
          fileName,
          fileSize: fileStats.size,
          startDate: start,
          endDate: end,
        },
      });
    } catch (e) {
      console.warn("Could not save export audit log:", e.message);
    }

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("X-Report-Filename", fileName);
    res.setHeader("X-Report-Records", recordCount);
    res.setHeader("X-Report-Total", totalValue);
    return res.send(csvContent);
  } catch (err) {
    next(err);
  }
};

// ── 5. GET /api/v1/accounts/reports/downloads ────────────────────────────────
export const getExportDownloads = async (_req, res, next) => {
  try {
    const exportDir = getExportDir();
    if (!fs.existsSync(exportDir)) {
      return res.json({ status: "success", data: [] });
    }

    const files = fs.readdirSync(exportDir);
    const downloadList = [];

    for (const f of files) {
      if (f.endsWith(".csv")) {
        const fullPath = path.join(exportDir, f);
        const stat = fs.statSync(fullPath);
        downloadList.push({
          fileName: f,
          sizeBytes: stat.size,
          createdAt: stat.birthtime || stat.mtime,
          downloadUrl: `/api/v1/accounts/reports/download/${encodeURIComponent(f)}`,
        });
      }
    }

    // Sort newest first
    downloadList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ status: "success", data: downloadList.slice(0, 50) });
  } catch (err) {
    next(err);
  }
};

// ── 6. GET /api/v1/accounts/reports/download/:fileName ────────────────────────
export const downloadReportFile = async (req, res, next) => {
  try {
    const { fileName } = req.params;
    const sanitized = path.basename(fileName);
    const exportDir = getExportDir();
    const fullPath = path.join(exportDir, sanitized);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ status: "error", message: "Report file not found on VPS storage" });
    }

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${sanitized}"`);
    const fileStream = fs.createReadStream(fullPath);
    fileStream.pipe(res);
  } catch (err) {
    next(err);
  }
};
