import { MoneyReceiptModel, generateReceiptTokenNo } from "../models/moneyReceipt.model.js";
import Customer from "../models/customer.model.js";

// @desc    Get all money receipts / tokens with pagination and search
// @route   GET /api/v1/receipts
export const getAllReceipts = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = req.query.limit !== undefined ? Math.max(1, parseInt(req.query.limit, 10) || 10) : 10;
    const skip = req.query.skip !== undefined ? Math.max(0, parseInt(req.query.skip, 10)) : (page - 1) * limit;
    const { search, q, status, serviceType, startDate, endDate, handedOverToBank } = req.query;

    const query = { isActive: { $ne: false } };

    // Status filter
    if (status && status !== "all") {
      query.status = status;
    }

    // Service Type filter
    if (serviceType && serviceType !== "all") {
      query.serviceType = new RegExp(serviceType.trim(), "i");
    }

    // Handed over to bank filter
    if (handedOverToBank !== undefined && handedOverToBank !== "all") {
      query.handedOverToBank = handedOverToBank === "true" || handedOverToBank === true;
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    // Text / Regex Search
    const term = (search || q || "").trim();
    if (term) {
      const searchRegex = new RegExp(term, "i");
      query.$or = [
        { receiptNo: searchRegex },
        { clientName: searchRegex },
        { clientPhone: searchRegex },
        { passportNumber: searchRegex },
        { serviceType: searchRegex },
        { purpose: searchRegex },
        { createdByName: searchRegex },
        { confirmedByName: searchRegex },
      ];
    }

    const totalCount = await MoneyReceiptModel.countDocuments(query);
    const receipts = await MoneyReceiptModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("customerId", "fullName phone passportNumber customerCode")
      .populate("createdBy", "name role")
      .populate("confirmedBy", "name role");

    const totalPages = Math.ceil(totalCount / limit) || 1;

    return res.status(200).json({
      status: "success",
      success: true,
      results: receipts.length,
      data: receipts,
      pagination: {
        skip,
        limit,
        totalCount,
        page,
        totalPages,
        hasNextPage: skip + receipts.length < totalCount,
        hasPrevPage: skip > 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single receipt by ID or receiptNo
// @route   GET /api/v1/receipts/:id
export const getReceiptById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isMongoId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isMongoId
      ? { _id: id, isActive: { $ne: false } }
      : { receiptNo: id, isActive: { $ne: false } };

    const receipt = await MoneyReceiptModel.findOne(query)
      .populate("customerId", "fullName phone passportNumber customerCode totalDueAmount")
      .populate("createdBy", "name role")
      .populate("confirmedBy", "name role");

    if (!receipt) {
      return res.status(404).json({
        status: "error",
        message: "Money receipt / token not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: receipt,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Quick lookup search by token number or phone/passport
// @route   GET /api/v1/receipts/lookup
export const lookupReceipt = async (req, res, next) => {
  try {
    const { q, token } = req.query;
    const searchVal = (q || token || "").trim();
    if (!searchVal) {
      return res.status(200).json({ status: "success", data: [] });
    }

    const regex = new RegExp(searchVal, "i");
    const results = await MoneyReceiptModel.find({
      isActive: { $ne: false },
      $or: [
        { receiptNo: regex },
        { clientPhone: regex },
        { passportNumber: regex },
        { clientName: regex },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(10);

    return res.status(200).json({
      status: "success",
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new money receipt / token (Manager Action)
// @route   POST /api/v1/receipts
export const createReceipt = async (req, res, next) => {
  try {
    const body = req.body || {};
    if (!body.receiptNo) {
      body.receiptNo = generateReceiptTokenNo();
    }

    // Set creator user if present
    if (req.user?._id) {
      body.createdBy = req.user._id;
      body.createdByName = req.user.name || body.createdByName || "ম্যানেজার (Manager)";
    }

    // Auto-link to customer if phone or passport matches and customerId not provided
    if (!body.customerId && (body.passportNumber || body.clientPhone)) {
      const search = [];
      if (body.passportNumber) search.push({ passportNumber: body.passportNumber.trim().toUpperCase() });
      if (body.clientPhone) search.push({ phone: body.clientPhone.trim() });
      const matchedCustomer = await Customer.findOne({ $or: search });
      if (matchedCustomer) {
        body.customerId = matchedCustomer._id;
      }
    }

    const newReceipt = await MoneyReceiptModel.create(body);

    return res.status(201).json({
      status: "success",
      message: "Money receipt token created successfully",
      data: newReceipt,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm money receipt & Cash Receipt Seal (Accountant Action)
// @route   PATCH /api/v1/receipts/:id/confirm
export const confirmReceipt = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes, confirmedByName, paymentMethod } = req.body || {};

    const isMongoId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isMongoId
      ? { _id: id, isActive: { $ne: false } }
      : { receiptNo: id, isActive: { $ne: false } };

    const receipt = await MoneyReceiptModel.findOne(query);
    if (!receipt) {
      return res.status(404).json({
        status: "error",
        message: "Money receipt not found",
      });
    }

    if (receipt.status === "confirmed") {
      return res.status(400).json({
        status: "error",
        message: "Receipt is already confirmed and sealed",
        data: receipt,
      });
    }

    receipt.status = "confirmed";
    receipt.confirmedAt = new Date();
    receipt.confirmedBy = req.user?._id || null;
    receipt.confirmedByName = confirmedByName || req.user?.name || "একাউন্টেন্ট (Accountant)";
    if (paymentMethod) receipt.paymentMethod = paymentMethod;
    if (notes) {
      receipt.notes = receipt.notes ? `${receipt.notes} | ${notes}` : notes;
    }

    await receipt.save();

    // If linked to customer, update customer's totalPaidAmount
    if (receipt.customerId) {
      try {
        const cust = await Customer.findById(receipt.customerId);
        if (cust) {
          cust.totalPaidAmount = (cust.totalPaidAmount || 0) + Number(receipt.amount || 0);
          cust.totalDueAmount = Math.max(0, (cust.totalBilledAmount || 0) - cust.totalPaidAmount);
          await cust.save();
        }
      } catch (err) {
        console.error("Failed to update customer ledger:", err);
      }
    }

    return res.status(200).json({
      status: "success",
      message: "Money receipt confirmed and sealed successfully",
      data: receipt,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel money receipt / token
// @route   PATCH /api/v1/receipts/:id/cancel
export const cancelReceipt = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};

    const isMongoId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isMongoId
      ? { _id: id, isActive: { $ne: false } }
      : { receiptNo: id, isActive: { $ne: false } };

    const receipt = await MoneyReceiptModel.findOne(query);
    if (!receipt) {
      return res.status(404).json({
        status: "error",
        message: "Money receipt not found",
      });
    }

    receipt.status = "cancelled";
    if (reason) {
      receipt.notes = receipt.notes ? `${receipt.notes} | বাতিল কারণ: ${reason}` : `বাতিল কারণ: ${reason}`;
    }

    await receipt.save();

    return res.status(200).json({
      status: "success",
      message: "Money receipt cancelled successfully",
      data: receipt,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update bank deposit status (Turnover Handover)
// @route   PATCH /api/v1/receipts/:id/bank-deposit
export const updateBankDeposit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { handedOverToBank, bankDepositRef, notes } = req.body || {};

    const isMongoId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isMongoId
      ? { _id: id, isActive: { $ne: false } }
      : { receiptNo: id, isActive: { $ne: false } };

    const receipt = await MoneyReceiptModel.findOne(query);
    if (!receipt) {
      return res.status(404).json({
        status: "error",
        message: "Money receipt not found",
      });
    }

    receipt.handedOverToBank = handedOverToBank !== undefined ? Boolean(handedOverToBank) : true;
    receipt.bankDepositRef = bankDepositRef || receipt.bankDepositRef || "";
    receipt.bankDepositDate = receipt.handedOverToBank ? new Date() : null;
    if (notes) {
      receipt.notes = receipt.notes ? `${receipt.notes} | ${notes}` : notes;
    }

    await receipt.save();

    return res.status(200).json({
      status: "success",
      message: "Bank deposit status updated",
      data: receipt,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get aggregated financial summary for Cashier/Accountant
// @route   GET /api/v1/receipts/summary
export const getReceiptSummary = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const baseQuery = { isActive: { $ne: false } };

    const [
      totalCount,
      pendingAgg,
      confirmedAgg,
      todayConfirmedAgg,
      bankDepositedAgg,
    ] = await Promise.all([
      MoneyReceiptModel.countDocuments(baseQuery),
      MoneyReceiptModel.aggregate([
        { $match: { ...baseQuery, status: "pending" } },
        { $group: { _id: null, count: { $sum: 1 }, totalAmount: { $sum: "$amount" } } },
      ]),
      MoneyReceiptModel.aggregate([
        { $match: { ...baseQuery, status: "confirmed" } },
        { $group: { _id: null, count: { $sum: 1 }, totalAmount: { $sum: "$amount" } } },
      ]),
      MoneyReceiptModel.aggregate([
        { $match: { ...baseQuery, status: "confirmed", confirmedAt: { $gte: todayStart } } },
        { $group: { _id: null, count: { $sum: 1 }, totalAmount: { $sum: "$amount" } } },
      ]),
      MoneyReceiptModel.aggregate([
        { $match: { ...baseQuery, status: "confirmed", handedOverToBank: true } },
        { $group: { _id: null, count: { $sum: 1 }, totalAmount: { $sum: "$amount" } } },
      ]),
    ]);

    const totalConfirmedAmount = confirmedAgg[0]?.totalAmount || 0;
    const totalBankDeposited = bankDepositedAgg[0]?.totalAmount || 0;
    const cashInOffice = Math.max(0, totalConfirmedAmount - totalBankDeposited);

    return res.status(200).json({
      status: "success",
      data: {
        totalReceipts: totalCount,
        pending: {
          count: pendingAgg[0]?.count || 0,
          amount: pendingAgg[0]?.totalAmount || 0,
        },
        confirmed: {
          count: confirmedAgg[0]?.count || 0,
          amount: totalConfirmedAmount,
        },
        todayConfirmed: {
          count: todayConfirmedAgg[0]?.count || 0,
          amount: todayConfirmedAgg[0]?.totalAmount || 0,
        },
        bankDeposited: {
          count: bankDepositedAgg[0]?.count || 0,
          amount: totalBankDeposited,
        },
        cashInOffice,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft delete money receipt
// @route   DELETE /api/v1/receipts/:id
export const deleteReceipt = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isMongoId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isMongoId ? { _id: id } : { receiptNo: id };

    const deletedReceipt = await MoneyReceiptModel.findOneAndUpdate(
      query,
      { isActive: false },
      { new: true }
    );

    if (!deletedReceipt) {
      return res.status(404).json({
        status: "error",
        message: "Money receipt not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Money receipt deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
