import {
  CashVoucherModel,
  generateVoucherNo,
  generateVoucherQrCode,
  generateVoucherQrUrl,
} from "../models/cashVoucher.model.js";
import {
  sendPaymentDocCreatedEmailToAccountants,
  sendPaymentOrBillCreatedEmailToOwners,
} from "../services/emailNotification.service.js";

// ─── GET ALL ──────────────────────────────────────────────────────────────────
// @route  GET /api/v1/cash-vouchers
export const getAllVouchers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const skip = (page - 1) * limit;
    const { search, q, status, startDate, endDate } = req.query;

    const query = { isActive: { $ne: false } };

    if (status && status !== "all") query.status = status;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const term = (search || q || "").trim();
    if (term) {
      const rx = new RegExp(term, "i");
      query.$or = [{ voucherNo: rx }, { did: rx }, { preparedBy: rx }, { "items.descriptionEn": rx }];
    }

    const totalCount = await CashVoucherModel.countDocuments(query);
    const vouchers = await CashVoucherModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      status: "success",
      success: true,
      results: vouchers.length,
      data: vouchers,
      pagination: {
        skip,
        limit,
        totalCount,
        page,
        totalPages: Math.ceil(totalCount / limit) || 1,
        hasNextPage: skip + vouchers.length < totalCount,
        hasPrevPage: skip > 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET BY ID / VOUCHER NO / DID ─────────────────────────────────────────────
// @route  GET /api/v1/cash-vouchers/:id
export const getVoucherById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
    const query = isMongoId
      ? { _id: id, isActive: { $ne: false } }
      : { $or: [{ voucherNo: id }, { did: id }], isActive: { $ne: false } };

    let voucher = await CashVoucherModel.findOne(query);
    if (!voucher) {
      return res.status(404).json({ status: "error", message: "Cash voucher not found" });
    }

    // Backfill QR code if missing
    if (!voucher.qrCode) {
      voucher.qrCode = await generateVoucherQrCode(voucher.voucherNo);
      await voucher.save();
    }

    return res.status(200).json({ status: "success", success: true, data: voucher });
  } catch (error) {
    next(error);
  }
};

// ─── CREATE ───────────────────────────────────────────────────────────────────
// @route  POST /api/v1/cash-vouchers
export const createVoucher = async (req, res, next) => {
  try {
    const body = req.body || {};
    if (!body.voucherNo) body.voucherNo = generateVoucherNo();
    if (!body.qrCode)   body.qrCode   = await generateVoucherQrCode(body.voucherNo);

    if (req.user?._id) {
      body.createdBy = req.user._id;
      body.createdByName = req.user.name || body.createdByName || "";
    }

    const voucher = await CashVoucherModel.create(body);

    const creatorName = req.user?.name || body.createdByName || "Staff Member";
    const voucherAmount = Number(voucher.grandTotal || voucher.totalAmount || voucher.amount || 0);

    // Action 3: Email Accountant
    sendPaymentDocCreatedEmailToAccountants({
      createdByUserName: creatorName,
      docType: "Cash Voucher",
      docNumber: voucher.voucherNo,
      amount: voucherAmount,
      clientName: voucher.receivedFrom || "",
    }).catch((err) => console.error("[EmailTrigger] sendPaymentDocCreatedEmailToAccountants (Voucher) error:", err.message));

    // Action 4: Email Owners for payment entry
    sendPaymentOrBillCreatedEmailToOwners({
      createdByUserName: creatorName,
      type: "Cash Voucher",
      refNumber: voucher.voucherNo,
      amount: voucherAmount,
      notes: `Voucher paid to/received from: ${voucher.receivedFrom || "N/A"}`,
    }).catch((err) => console.error("[EmailTrigger] sendPaymentOrBillCreatedEmailToOwners (Voucher) error:", err.message));

    return res.status(201).json({
      status: "success",
      success: true,
      message: "Cash voucher created successfully",
      data: voucher,
    });
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE ───────────────────────────────────────────────────────────────────
// @route  PUT /api/v1/cash-vouchers/:id
export const updateVoucher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
    const query = isMongoId
      ? { _id: id, isActive: { $ne: false } }
      : { $or: [{ voucherNo: id }, { did: id }], isActive: { $ne: false } };

    let voucher = await CashVoucherModel.findOne(query);
    if (!voucher) {
      return res.status(404).json({ status: "error", message: "Cash voucher not found" });
    }

    // Re-generate QR if voucherNo changed or QR is missing
    if (body.voucherNo && body.voucherNo !== voucher.voucherNo) {
      body.qrCode = await generateVoucherQrCode(body.voucherNo);
    } else if (!voucher.qrCode) {
      body.qrCode = await generateVoucherQrCode(voucher.voucherNo);
    }

    Object.assign(voucher, body);
    await voucher.save();

    return res.status(200).json({
      status: "success",
      success: true,
      message: "Cash voucher updated successfully",
      data: voucher,
    });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE (SOFT) ────────────────────────────────────────────────────────────
// @route  DELETE /api/v1/cash-vouchers/:id
export const deleteVoucher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
    const query = isMongoId ? { _id: id } : { $or: [{ voucherNo: id }, { did: id }] };

    const voucher = await CashVoucherModel.findOne(query);
    if (!voucher) {
      return res.status(404).json({ status: "error", message: "Cash voucher not found" });
    }
    voucher.isActive = false;
    await voucher.save();

    return res.status(200).json({ status: "success", success: true, message: "Cash voucher deleted" });
  } catch (error) {
    next(error);
  }
};

// ─── STANDALONE QR CODE ───────────────────────────────────────────────────────
// @route  GET /api/v1/cash-vouchers/qr-code?voucherNo=...
export const generateQrEndpoint = async (req, res, next) => {
  try {
    const { voucherNo } = req.query;
    if (!voucherNo) {
      return res.status(400).json({ status: "error", message: "voucherNo is required" });
    }
    const qrCode = await generateVoucherQrCode(voucherNo);
    const qrUrl  = generateVoucherQrUrl(voucherNo);

    return res.status(200).json({
      status: "success",
      success: true,
      data: { voucherNo, qrUrl, qrCode },
    });
  } catch (error) {
    next(error);
  }
};

// Aliases for route consistency
export const getAllCashVouchers = getAllVouchers;
export const getCashVoucherById = getVoucherById;
export const createCashVoucher = createVoucher;
export const updateCashVoucher = updateVoucher;
export const deleteCashVoucher = deleteVoucher;
