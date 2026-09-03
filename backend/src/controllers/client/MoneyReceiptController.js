import {
  MoneyReceiptModel,
  generateReceiptTokenNo,
  generateReceiptQrCode,
  generateReceiptQrText,
} from "../../models/moneyReceipt.model.js";
import Client from "../../models/client.model.js";
import {
  sendPaymentDocCreatedEmailToAccountants,
  sendPaymentOrBillCreatedEmailToOwners,
} from "../../services/emailNotification.service.js";

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
      .populate("clientId", "fullName phone passportNumber clientCode")
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
      : { $or: [{ receiptNo: id }, { did: id }], isActive: { $ne: false } };

    let receipt = await MoneyReceiptModel.findOne(query)
      .populate("clientId", "fullName phone passportNumber clientCode totalDueAmount")
      .populate("createdBy", "name role")
      .populate("confirmedBy", "name role");

    if (!receipt) {
      return res.status(404).json({
        status: "error",
        message: "Money receipt / voucher not found",
      });
    }

    // Ensure QR code is present
    if (!receipt.qrCode) {
      receipt.qrCode = await generateReceiptQrCode(receipt.receiptNo);
      await receipt.save();
    }

    return res.status(200).json({
      status: "success",
      success: true,
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
        { did: regex },
        { clientPhone: regex },
        { passportNumber: regex },
        { clientName: regex },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(10);

    return res.status(200).json({
      status: "success",
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate standalone QR code by receipt number
// @route   GET /api/v1/receipts/qr-code
export const generateQrEndpoint = async (req, res, next) => {
  try {
    const { receiptNo } = req.query;
    if (!receiptNo) {
      return res.status(400).json({ status: "error", message: "Receipt number is required" });
    }

    const qrCode = await generateReceiptQrCode(receiptNo);
    const qrText = generateReceiptQrText(receiptNo);

    return res.status(200).json({
      status: "success",
      success: true,
      data: {
        receiptNo,
        qrText,
        qrCode,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new money receipt / voucher
// @route   POST /api/v1/receipts
export const createReceipt = async (req, res, next) => {
  try {
    const rawBody = req.body || {};
    const body = { ...rawBody };

    // Clean up empty / null IDs or existing did on create to prevent unique index duplicate errors
    if (!body._id || body._id === "null" || body._id === "undefined") {
      delete body._id;
    }
    if (body.did) {
      const existingDid = await MoneyReceiptModel.findOne({ did: body.did });
      if (existingDid) {
        delete body.did;
      }
    } else {
      delete body.did;
    }

    if (!body.receiptNo) {
      body.receiptNo = generateReceiptTokenNo();
    }

    // Always generate QR code on create
    if (!body.qrCode) {
      body.qrCode = await generateReceiptQrCode(body.receiptNo);
    }

    // Set creator user if present
    if (req.user?.did) {
      body.createdByDid = req.user.did;
      body.createdByName = req.user.name || body.createdByName || "Manager";
    }

    // Auto-link to client if phone or passport matches and clientDid/clientId not provided
    if (!body.clientDid && !body.clientId && (body.passportNumber || body.clientPhone)) {
      const search = [];
      if (body.passportNumber) search.push({ passportNumber: body.passportNumber.trim().toUpperCase() });
      if (body.clientPhone) search.push({ phone: body.clientPhone.trim() });
      const matchedClient = await Client.findOne({ $or: search });
      if (matchedClient) {
        body.clientDid = matchedClient.did;
      }
    } else if (body.clientDid || body.clientId) {
      body.clientDid = body.clientDid || body.clientId;
    }

    const newReceipt = await MoneyReceiptModel.create(body);

    const creatorName = req.user?.name || body.createdByName || "Staff Member";
    const receiptAmount = Number(newReceipt.amount || newReceipt.netReceivedBDT || 0);

    // Action 3: Email Accountant
    sendPaymentDocCreatedEmailToAccountants({
      createdByUserName: creatorName,
      docType: "Money Receipt",
      docNumber: newReceipt.receiptNo,
      amount: receiptAmount,
      clientName: newReceipt.clientName || "",
    }).catch((err) => console.error("[EmailTrigger] sendPaymentDocCreatedEmailToAccountants (Receipt) error:", err.message));

    // Action 4: Email Owners for payment entry
    sendPaymentOrBillCreatedEmailToOwners({
      createdByUserName: creatorName,
      type: "Money Receipt",
      refNumber: newReceipt.receiptNo,
      amount: receiptAmount,
      notes: `Receipt issued to ${newReceipt.clientName || "Client"} (${newReceipt.purpose || "Payment"})`,
    }).catch((err) => console.error("[EmailTrigger] sendPaymentOrBillCreatedEmailToOwners (Receipt) error:", err.message));

    // Asynchronously dispatch payment receipt email
    (async () => {
      try {
        const { sendPaymentReceiptEmail } = await import("../../services/emailService.js");
        let clientEmail = body.clientEmail;
        let clientName = body.clientName;
        if (!clientEmail && newReceipt.clientDid) {
          const client = await Client.findOne({ did: newReceipt.clientDid }).lean();
          if (client?.email) {
            clientEmail = client.email;
            clientName = clientName || client.fullName;
          }
        }

        if (clientEmail) {
          await sendPaymentReceiptEmail({
            toEmail: clientEmail,
            clientName: clientName || "Valued Client",
            receiptNo: newReceipt.receiptNo,
            amount: newReceipt.amount || newReceipt.netReceivedBDT || 0,
            serviceType: newReceipt.serviceType || "Visa & Travel Services",
            purpose: newReceipt.purpose || "Payment Settlement",
            paymentMethod: newReceipt.paymentMethod || "Cash",
            paymentDate: newReceipt.date ? new Date(newReceipt.date).toLocaleDateString() : new Date().toLocaleDateString(),
            receivedBy: newReceipt.createdByName || "Monsur Ali Travels Accounts",
            remainingDue: newReceipt.dueAmount || 0,
          });
        }
      } catch (err) {
        // Silent error for email notification
      }
    })();

    return res.status(201).json({
      status: "success",
      success: true,
      message: "Money receipt created successfully",
      data: newReceipt,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update existing money receipt / voucher
// @route   PUT /api/v1/receipts/:id
export const updateReceipt = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body || {};

    const isMongoId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isMongoId
      ? { _id: id, isActive: { $ne: false } }
      : { $or: [{ receiptNo: id }, { did: id }], isActive: { $ne: false } };

    let receipt = await MoneyReceiptModel.findOne(query);
    if (!receipt) {
      return res.status(404).json({
        status: "error",
        message: "Money receipt not found to update",
      });
    }

    // If receiptNo is modified or qrCode missing, re-generate QR code
    if (body.receiptNo && body.receiptNo !== receipt.receiptNo) {
      body.qrCode = await generateReceiptQrCode(body.receiptNo);
    } else if (!receipt.qrCode) {
      body.qrCode = await generateReceiptQrCode(receipt.receiptNo);
    }

    Object.assign(receipt, body);
    await receipt.save();

    return res.status(200).json({
      status: "success",
      success: true,
      message: "Money receipt updated successfully",
      data: receipt,
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
      : { $or: [{ receiptNo: id }, { did: id }], isActive: { $ne: false } };

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
    receipt.confirmedByDid = req.user?.did || null;
    receipt.confirmedByName = confirmedByName || req.user?.name || "Accountant";
    if (paymentMethod) receipt.paymentMethod = paymentMethod;
    if (notes) {
      receipt.notes = receipt.notes ? `${receipt.notes} | ${notes}` : notes;
    }

    await receipt.save();

    // If linked to client, update client's totalPaidAmount
    if (receipt.clientDid) {
      try {
        const cust = await Client.findOne({ did: receipt.clientDid });
        if (cust) {
          cust.totalPaidAmount = (cust.totalPaidAmount || 0) + Number(receipt.amount || 0);
          cust.totalDueAmount = Math.max(0, (cust.totalBilledAmount || 0) - cust.totalPaidAmount);
          await cust.save();
        }
      } catch (err) {
        console.error("Failed to update client ledger:", err);
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
      : { $or: [{ receiptNo: id }, { did: id }], isActive: { $ne: false } };

    const receipt = await MoneyReceiptModel.findOne(query);
    if (!receipt) {
      return res.status(404).json({
        status: "error",
        message: "Money receipt not found",
      });
    }

    receipt.status = "cancelled";
    if (reason) {
      receipt.notes = receipt.notes ? `${receipt.notes} | Cancellation Reason: ${reason}` : `Cancellation Reason: ${reason}`;
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
      : { $or: [{ receiptNo: id }, { did: id }], isActive: { $ne: false } };

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
    const query = isMongoId ? { _id: id } : { $or: [{ receiptNo: id }, { did: id }] };

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
