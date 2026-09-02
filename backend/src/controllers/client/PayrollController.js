import mongoose from "mongoose";
import { SalarySlip } from "../../models/salarySlip.model.js";

const findSalarySlipByIdOrCustomId = async (id, extraQuery = {}) => {
  if (!id) return null;
  const isMongoId = mongoose.isValidObjectId(id);
  const conditions = [{ did: id }, { slipNo: id }];
  if (isMongoId) conditions.push({ _id: id });
  return SalarySlip.findOne({ $or: conditions, ...extraQuery });
};

// @desc    Get all salary slips
// @route   GET /api/v1/docs/payrolls
export const getSalarySlips = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = req.query.limit !== undefined ? Math.max(1, parseInt(req.query.limit, 10) || 10) : 10;
    const skip = req.query.skip !== undefined ? Math.max(0, parseInt(req.query.skip, 10)) : (page - 1) * limit;
    const { search, month } = req.query;

    const query = {};
    query.isActive = { $ne: false };

    if (month && month !== "all") {
      query.salaryMonth = new RegExp(month.trim(), "i");
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { slipNo: searchRegex },
        { employeeName: searchRegex },
        { employeeId: searchRegex },
        { designation: searchRegex },
        { department: searchRegex },
      ];
    }

    const totalCount = await SalarySlip.countDocuments(query);
    const slips = await SalarySlip.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalCount / limit) || 1;

    return res.status(200).json({
      success: true,
      status: "success",
      count: slips.length,
      data: slips,
      pagination: {
        skip,
        limit,
        totalCount,
        page,
        totalPages,
        hasNextPage: skip + slips.length < totalCount,
        hasPrevPage: skip > 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single salary slip by ID, did, or slipNo
// @route   GET /api/v1/docs/payrolls/:id
export const getSalarySlipById = async (req, res, next) => {
  try {
    const slip = await findSalarySlipByIdOrCustomId(req.params.id, { isActive: { $ne: false } });
    if (!slip) {
      return res.status(404).json({
        success: false,
        status: "error",
        message: "Salary slip not found",
      });
    }
    return res.status(200).json({
      success: true,
      status: "success",
      data: slip,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new salary slip
// @route   POST /api/v1/docs/payrolls
export const createSalarySlip = async (req, res, next) => {
  try {
    const newSlip = await SalarySlip.create(req.body);

    return res.status(201).json({
      success: true,
      status: "success",
      message: "Salary slip created successfully",
      data: newSlip,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update existing salary slip
// @route   PUT /api/v1/docs/payrolls/:id
export const updateSalarySlip = async (req, res, next) => {
  try {
    const existing = await findSalarySlipByIdOrCustomId(req.params.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        status: "error",
        message: "Salary slip not found",
      });
    }

    const updatedSlip = await SalarySlip.findOneAndUpdate(
      { _id: existing._id },
      req.body,
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      status: "success",
      message: "Salary slip updated successfully",
      data: updatedSlip,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete salary slip
// @route   DELETE /api/v1/docs/payrolls/:id
export const deleteSalarySlip = async (req, res, next) => {
  try {
    const existing = await findSalarySlipByIdOrCustomId(req.params.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        status: "error",
        message: "Salary slip not found",
      });
    }

    await SalarySlip.findOneAndUpdate({ _id: existing._id }, { isActive: false }, { new: true });

    return res.status(200).json({
      success: true,
      status: "success",
      message: "Salary slip deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
