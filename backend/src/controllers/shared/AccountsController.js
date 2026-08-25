import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MoneyReceiptModel } from "../../models/moneyReceipt.model.js";
import { InvoiceModel } from "../../models/invoice.model.js";
import { SystemLogModel } from "../../models/systemLog.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// VPS Storage Directory for Archived CSV Exports
const EXPORT_DIR = path.resolve(__dirname, "../../../storage/exports/reports");
if (!fs.existsSync(EXPORT_DIR)) {
  fs.mkdirSync(EXPORT_DIR, { recursive: true });
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
      filter.status = status;
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

// ── 2. GET /api/v1/accounts/bills ──────────────────────────────────────────────
export const getBills = async (req, res, next) => {
  try {
    const {
      search = "",
      paymentStatus = "",
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

    if (paymentStatus && paymentStatus !== "all") {
      filter.paymentStatus = new RegExp(`^${paymentStatus}$`, "i");
    }
    if (search) {
      filter.$or = [
        { invoiceNo: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
        { customerPhone: { $regex: search, $options: "i" } },
        { trackingNumber: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const take = Math.min(100, parseInt(limit, 10) || 25);
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [items, total] = await Promise.all([
      InvoiceModel.find(filter).sort(sort).skip(skip).limit(take).lean(),
      InvoiceModel.countDocuments(filter),
    ]);

    const totalStats = await InvoiceModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: { $ifNull: ["$grandTotal", "$totalAmount"] } },
          totalPaid: { $sum: { $ifNull: ["$paidAmount", 0] } },
          totalDue: { $sum: { $ifNull: ["$dueAmount", 0] } },
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

// ── 3. GET /api/v1/accounts/reports/summary ──────────────────────────────────
export const getReportsSummary = async (req, res, next) => {
  try {
    const { period = "this_month", startDate = "", endDate = "" } = req.query;
    const { query: receiptDateQuery, start, end } = buildDateFilter(period, startDate, endDate, "createdAt");
    const { query: invoiceDateQuery } = buildDateFilter(period, startDate, endDate, "createdAt");

    // Receipts / Payments summary
    const [receiptTotals, methodBreakdown, invoiceTotals, paymentStatusBreakdown, dailyReceipts, dailyInvoices] =
      await Promise.all([
        MoneyReceiptModel.aggregate([
          { $match: receiptDateQuery },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: "$amount" },
              count: { $sum: 1 },
              confirmedAmount: {
                $sum: { $cond: [{ $eq: ["$status", "Confirmed"] }, "$amount", 0] },
              },
              confirmedCount: {
                $sum: { $cond: [{ $eq: ["$status", "Confirmed"] }, 1, 0] },
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
              totalPaid: { $sum: { $ifNull: ["$paidAmount", 0] } },
              totalDue: { $sum: { $ifNull: ["$dueAmount", 0] } },
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
    const totalPaidOnBills = invoiceTotals[0]?.totalPaid || 0;
    const totalDueOnBills = invoiceTotals[0]?.totalDue || 0;

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
          totalPaidOnBills,
          totalDueOnBills,
          invoicesCount: invoiceTotals[0]?.count || 0,
          netPosition: totalIncome - totalDueOnBills,
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

// ── 4. POST /api/v1/accounts/reports/export ──────────────────────────────────
export const exportReportCsv = async (req, res, next) => {
  try {
    const { type = "payments", period = "this_month", startDate = "", endDate = "" } = req.body || {};
    const { query: dateQuery, start, end } = buildDateFilter(period, startDate, endDate, "createdAt");

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timestamp = Date.now();
    const fileName = `report-${type}-${period || "custom"}-${dateStr}-${timestamp}.csv`;
    const filePath = path.join(EXPORT_DIR, fileName);

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
        totalValue += grand;
        const row = [
          inv.invoiceNo || "",
          inv.createdAt ? new Date(inv.createdAt).toISOString().slice(0, 10) : "",
          inv.customerName || "",
          inv.customerPhone || "",
          inv.trackingNumber || "",
          inv.subtotal || 0,
          inv.discount || 0,
          inv.tax || 0,
          grand,
          inv.paidAmount || 0,
          inv.dueAmount || 0,
          inv.paymentStatus || "Pending",
        ];
        rows.push(row.map(formatCsvField).join(","));
      }
      csvContent = rows.join("\r\n");
    } else {
      // Consolidated Financial Report
      const [receipts, invoices] = await Promise.all([
        MoneyReceiptModel.find(dateQuery).lean(),
        InvoiceModel.find(dateQuery).lean(),
      ]);
      recordCount = receipts.length + invoices.length;

      const headers = ["Category", "Reference ID", "Date", "Party Name", "Phone", "Description", "Income (BDT)", "Billed (BDT)", "Status"];
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
            inv.customerName || "",
            inv.customerPhone || "",
            `Invoice for ${inv.customerName || "Customer"}`,
            0,
            grand,
            inv.paymentStatus || "Pending",
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
    if (!fs.existsSync(EXPORT_DIR)) {
      return res.json({ status: "success", data: [] });
    }

    const files = fs.readdirSync(EXPORT_DIR);
    const downloadList = [];

    for (const f of files) {
      if (f.endsWith(".csv")) {
        const fullPath = path.join(EXPORT_DIR, f);
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
    const fullPath = path.join(EXPORT_DIR, sanitized);

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
