import CaseFile from "../../models/caseFile.model.js";
import Customer from "../../models/customer.model.js";

/**
 * Generic Query Builder Helper (like .NET IQueryable filter builder)
 */
function buildGenericCaseQuery(queryParams) {
  const {
    caseType,
    type,
    status,
    search,
    q,
    hasDue,
    dueMin,
    dueMax,
    followUpOnly,
    startDate,
    endDate,
    customerId,
  } = queryParams;

  const filter = {};

  // 1. Generic CaseType filter ($in support for comma-separated or single)
  const resolvedType = caseType || type;
  if (resolvedType && resolvedType !== "all") {
    const typesArray = String(resolvedType)
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    filter.caseType = typesArray.length === 1 ? typesArray[0] : { $in: typesArray };
  }

  // 2. Generic Status filter ($in support for multiple statuses)
  if (status && status !== "all") {
    const statusesArray = String(status)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    filter.status = statusesArray.length === 1 ? statusesArray[0] : { $in: statusesArray };
  }

  // 3. Customer ID filter
  if (customerId) {
    filter.customerId = customerId;
  }

  // 4. Follow-up Call Reminder filter
  if (followUpOnly === "true" || followUpOnly === true) {
    filter["checklist.followUpCallRequired"] = true;
  }

  // 5. Due range filters
  if (hasDue === "true" || hasDue === true) {
    filter["paymentLedger.dueAmount"] = { $gt: 0 };
  } else if (dueMin !== undefined || dueMax !== undefined) {
    filter["paymentLedger.dueAmount"] = {};
    if (dueMin !== undefined) filter["paymentLedger.dueAmount"].$gte = Number(dueMin);
    if (dueMax !== undefined) filter["paymentLedger.dueAmount"].$lte = Number(dueMax);
  }

  // 6. Date Range Filtering on createdAt
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }

  // 7. Generic Global Text/Regex Search
  const keyword = (search || q || "").trim();
  if (keyword) {
    const searchRegex = new RegExp(keyword, "i");
    filter.$or = [
      { applicantName: searchRegex },
      { passportNumber: searchRegex },
      { phone: searchRegex },
      { caseNumber: searchRegex },
      { nidNumber: searchRegex },
    ];
  }

  return filter;
}

// 1. Generic GET All (Universal Filtering, Sorting & Pagination)
export const getAllCases = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
      fields = "",
    } = req.query;

    const filter = buildGenericCaseQuery(req.query);

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    let queryBuilder = CaseFile.find(filter)
      .populate("customerId", "customerCode fullName phone passportNumber photo")
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    if (fields) {
      queryBuilder = queryBuilder.select(fields.split(",").join(" "));
    }

    const [cases, total] = await Promise.all([
      queryBuilder.exec(),
      CaseFile.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: cases,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNextPage: pageNum * limitNum < total,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch case collection",
    });
  }
};

// 2. Generic Fast Lookup Endpoint
export const lookupCase = async (req, res) => {
  try {
    const { q = "", passport = "", phone = "", limit = 10 } = req.query;
    const term = (q || passport || phone).trim();

    if (!term) {
      return res.status(400).json({
        success: false,
        message: "Search term or passport is required",
      });
    }

    const searchRegex = new RegExp(term, "i");
    const cases = await CaseFile.find({
      $or: [
        { passportNumber: searchRegex },
        { phone: searchRegex },
        { applicantName: searchRegex },
        { caseNumber: searchRegex },
      ],
    })
      .populate("customerId", "fullName phone passportNumber customerCode")
      .sort({ createdAt: -1 })
      .limit(Number(limit) || 10);

    return res.status(200).json({
      success: true,
      data: cases,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Lookup failed",
    });
  }
};

// 3. Generic GET Single Case By ID
export const getCaseById = async (req, res) => {
  try {
    const { id } = req.params;
    const caseDoc = await CaseFile.findById(id).populate("customerId");

    if (!caseDoc) {
      return res.status(404).json({
        success: false,
        message: "Case file not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: caseDoc,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch case",
    });
  }
};

// 4. Generic POST Create Case (Auto-links / Creates Customer)
export const createCase = async (req, res) => {
  try {
    const {
      customerId,
      applicantName,
      passportNumber,
      phone,
      nidNumber,
      caseType,
      type,
      status = "ENTRY",
      checklist = {},
      paymentLedger = {},
      extraData = {},
      remarks = "",
    } = req.body;

    const resolvedType = caseType || type;
    if (!resolvedType) {
      return res.status(400).json({
        success: false,
        message: "caseType (e.g. greece, n-macedonia, indian-bsf) is required",
      });
    }

    let resolvedCustomerId = customerId;

    // If customerId is not given, resolve or auto-create Customer
    if (!resolvedCustomerId && passportNumber) {
      let existingCustomer = await Customer.findOne({
        passportNumber: passportNumber.trim().toUpperCase(),
      });

      if (!existingCustomer && phone) {
        existingCustomer = await Customer.findOne({ phone: phone.trim() });
      }

      if (!existingCustomer) {
        existingCustomer = await Customer.create({
          fullName: applicantName || "Unknown Applicant",
          passportNumber: passportNumber.trim().toUpperCase(),
          phone: phone || "N/A",
          nidNumber: nidNumber || "",
        });
      }
      resolvedCustomerId = existingCustomer._id;
    }

    if (!resolvedCustomerId) {
      return res.status(400).json({
        success: false,
        message: "Customer reference or Applicant Passport/Phone is required",
      });
    }

    const newCase = await CaseFile.create({
      customerId: resolvedCustomerId,
      applicantName,
      passportNumber: passportNumber ? passportNumber.trim().toUpperCase() : "",
      phone,
      nidNumber,
      caseType: String(resolvedType).toLowerCase(),
      status,
      checklist,
      paymentLedger,
      extraData,
      remarks,
      createdBy: req.user?._id || null,
    });

    // Add case reference to Customer
    await Customer.findByIdAndUpdate(resolvedCustomerId, {
      $addToSet: { cases: newCase._id },
    }).catch(() => {});

    return res.status(201).json({
      success: true,
      message: "Case created successfully",
      data: newCase,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create case",
    });
  }
};

// 5. Generic PUT Update Case (Status, Payments, Checklists, ExtraData)
export const updateCase = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const caseDoc = await CaseFile.findById(id);
    if (!caseDoc) {
      return res.status(404).json({
        success: false,
        message: "Case file not found",
      });
    }

    if (updates.applicantName) caseDoc.applicantName = updates.applicantName;
    if (updates.passportNumber) caseDoc.passportNumber = updates.passportNumber.trim().toUpperCase();
    if (updates.phone) caseDoc.phone = updates.phone;
    if (updates.nidNumber !== undefined) caseDoc.nidNumber = updates.nidNumber;
    if (updates.caseType || updates.type) caseDoc.caseType = String(updates.caseType || updates.type).toLowerCase();
    if (updates.status) caseDoc.status = updates.status;
    if (updates.remarks !== undefined) caseDoc.remarks = updates.remarks;

    if (updates.checklist) {
      caseDoc.checklist = { ...caseDoc.checklist.toObject(), ...updates.checklist };
    }

    if (updates.paymentLedger) {
      const p1 = Number(updates.paymentLedger.step1_advance ?? caseDoc.paymentLedger.step1_advance) || 0;
      const p2 = Number(updates.paymentLedger.step2_offerApproval ?? caseDoc.paymentLedger.step2_offerApproval) || 0;
      const p3 = Number(updates.paymentLedger.step3_delivery ?? caseDoc.paymentLedger.step3_delivery) || 0;
      const totalAgreed = Number(updates.paymentLedger.totalAgreedAmount ?? caseDoc.paymentLedger.totalAgreedAmount) || 0;
      const totalPaid = p1 + p2 + p3;
      
      const manualDue = updates.paymentLedger.dueAmount !== undefined
        ? Number(updates.paymentLedger.dueAmount)
        : Math.max(0, totalAgreed - totalPaid);

      caseDoc.paymentLedger = {
        totalAgreedAmount: totalAgreed,
        step1_advance: p1,
        step2_offerApproval: p2,
        step3_delivery: p3,
        totalPaidAmount: totalPaid,
        dueAmount: manualDue,
        isFullyPaid: totalPaid >= totalAgreed && totalAgreed > 0,
      };
    }

    if (updates.extraData) {
      caseDoc.extraData = { ...caseDoc.extraData, ...updates.extraData };
    }

    caseDoc.updatedBy = req.user?._id || null;
    await caseDoc.save();

    return res.status(200).json({
      success: true,
      message: "Case updated successfully",
      data: caseDoc,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update case",
    });
  }
};

// 6. Generic DELETE Case
export const deleteCase = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await CaseFile.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Case deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete case",
    });
  }
};

// 7. Generic Aggregation / Summary Analytics ($group query)
export const getDueSummary = async (req, res) => {
  try {
    const filter = buildGenericCaseQuery(req.query);

    const [byType, overall] = await Promise.all([
      CaseFile.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$caseType",
            totalCases: { $sum: 1 },
            totalAgreed: { $sum: "$paymentLedger.totalAgreedAmount" },
            totalPaid: { $sum: "$paymentLedger.totalPaidAmount" },
            totalDue: { $sum: "$paymentLedger.dueAmount" },
            pendingFollowUps: {
              $sum: { $cond: ["$checklist.followUpCallRequired", 1, 0] },
            },
          },
        },
      ]),
      CaseFile.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalCases: { $sum: 1 },
            totalAgreed: { $sum: "$paymentLedger.totalAgreedAmount" },
            totalPaid: { $sum: "$paymentLedger.totalPaidAmount" },
            totalDue: { $sum: "$paymentLedger.dueAmount" },
            pendingFollowUps: {
              $sum: { $cond: ["$checklist.followUpCallRequired", 1, 0] },
            },
          },
        },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        byType,
        overall: overall[0] || {
          totalCases: 0,
          totalAgreed: 0,
          totalPaid: 0,
          totalDue: 0,
          pendingFollowUps: 0,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to calculate summary",
    });
  }
};

// 8. Generic Bulk Import
export const bulkImportCases = async (req, res) => {
  try {
    const { cases = [] } = req.body;
    if (!Array.isArray(cases) || cases.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Array of cases is required for bulk import",
      });
    }

    const insertedIds = [];
    for (const item of cases) {
      if (!item.passportNumber && !item.applicantName) continue;

      let customer = await Customer.findOne({
        passportNumber: item.passportNumber?.trim().toUpperCase(),
      });

      if (!customer) {
        customer = await Customer.create({
          fullName: item.applicantName || "Unknown Applicant",
          passportNumber: item.passportNumber?.trim().toUpperCase() || "",
          phone: item.phone || "N/A",
          nidNumber: item.nidNumber || "",
        });
      }

      const newCase = await CaseFile.create({
        customerId: customer._id,
        applicantName: item.applicantName,
        passportNumber: item.passportNumber?.trim().toUpperCase() || "",
        phone: item.phone || "",
        nidNumber: item.nidNumber || "",
        caseType: String(item.caseType || item.type || "greece").toLowerCase(),
        status: item.status || "ENTRY",
        checklist: item.checklist || {},
        paymentLedger: {
          totalAgreedAmount: Number(item.totalAgreedAmount) || 0,
          step1_advance: Number(item.step1_advance) || 0,
          step2_offerApproval: Number(item.step2_offerApproval) || 0,
          step3_delivery: Number(item.step3_delivery) || 0,
          dueAmount: Number(item.dueAmount) || 0,
        },
        extraData: item.extraData || {},
        remarks: item.remarks || "Bulk imported",
      });

      insertedIds.push(newCase._id);
    }

    return res.status(201).json({
      success: true,
      message: `Successfully imported ${insertedIds.length} cases`,
      count: insertedIds.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Bulk import failed",
    });
  }
};


// 8. Update Workflow Status & Handoff
export const updateWorkflowStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { workflowStatus, assignedTo, remarks } = req.body;
    const updatedBy = req.user?._id || req.user?.id;

    const caseDoc = await CaseFile.findById(id);
    if (!caseDoc) {
      return res.status(404).json({ success: false, message: "Case file not found" });
    }

    // Update fields
    if (workflowStatus) caseDoc.workflowStatus = workflowStatus;
    if (assignedTo) caseDoc.assignedTo = assignedTo;

    // Push to history
    caseDoc.statusHistory.push({
      status: workflowStatus || caseDoc.workflowStatus,
      remarks: remarks || "",
      updatedBy: updatedBy,
      assignedTo: assignedTo || caseDoc.assignedTo,
      date: new Date()
    });

    await caseDoc.save();

    // Trigger Notification
    const Notification = (await import("../../models/notification.model.js")).NotificationModel;
    
    let notificationTitle = "Case File Updated";
    let notificationMsg = `Case ${caseDoc.caseNumber} status updated to ${workflowStatus}.`;
    let recipientId = assignedTo || null;

    if (assignedTo && assignedTo.toString() !== caseDoc.assignedTo?.toString()) {
      notificationTitle = "Case Handed Over";
      notificationMsg = `Case ${caseDoc.caseNumber} has been handed over to you.`;
    } else if (workflowStatus === "Approved") {
      notificationTitle = "Case Approved";
      notificationMsg = `Case ${caseDoc.caseNumber} (${caseDoc.applicantName}) is approved. Please prepare for Indian Visa.`;
      recipientId = null; // Broadcast or frontdesk team (can be handled differently)
    }

    await Notification.create({
      title: notificationTitle,
      message: notificationMsg,
      module: "visa",
      type: "info",
      refId: caseDoc._id,
      recipientId: recipientId,
      createdBy: req.user?.name || "System"
    });

    return res.status(200).json({
      success: true,
      message: "Workflow updated successfully",
      data: caseDoc,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update workflow",
    });
  }
};
