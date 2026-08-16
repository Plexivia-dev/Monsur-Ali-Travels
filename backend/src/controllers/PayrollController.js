import { SalarySlip } from "../models/salarySlip.model.js";

// @desc    Get all salary slips
// @route   GET /api/v1/docs/payrolls
export const getSalarySlips = async (req, res) => {
  try {
    const slips = await SalarySlip.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: slips.length,
      data: slips,
    });
  } catch (error) {
    console.error("Error fetching salary slips:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error: Could not fetch salary slips",
      error: error.message,
    });
  }
};

// @desc    Get single salary slip by ID
// @route   GET /api/v1/docs/payrolls/:id
export const getSalarySlipById = async (req, res) => {
  try {
    const slip = await SalarySlip.findById(req.params.id);
    if (!slip) {
      return res.status(404).json({
        success: false,
        message: "Salary slip not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: slip,
    });
  } catch (error) {
    console.error("Error fetching salary slip by ID:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error: Could not fetch salary slip",
      error: error.message,
    });
  }
};

// @desc    Create new salary slip (Schema automatically generates unique slipNo: 3 uppercase letters + 5 digits)
// @route   POST /api/v1/docs/payrolls
export const createSalarySlip = async (req, res) => {
  try {
    const newSlip = await SalarySlip.create(req.body);

    return res.status(201).json({
      success: true,
      message: "Salary slip created successfully",
      data: newSlip,
    });
  } catch (error) {
    console.error("Error creating salary slip:", error);
    return res.status(400).json({
      success: false,
      message: "Could not create salary slip",
      error: error.message,
    });
  }
};

// @desc    Update existing salary slip
// @route   PUT /api/v1/docs/payrolls/:id
export const updateSalarySlip = async (req, res) => {
  try {
    const updatedSlip = await SalarySlip.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedSlip) {
      return res.status(404).json({
        success: false,
        message: "Salary slip not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Salary slip updated successfully",
      data: updatedSlip,
    });
  } catch (error) {
    console.error("Error updating salary slip:", error);
    return res.status(400).json({
      success: false,
      message: "Could not update salary slip",
      error: error.message,
    });
  }
};

// @desc    Delete salary slip
// @route   DELETE /api/v1/docs/payrolls/:id
export const deleteSalarySlip = async (req, res) => {
  try {
    const deletedSlip = await SalarySlip.findByIdAndDelete(req.params.id);
    if (!deletedSlip) {
      return res.status(404).json({
        success: false,
        message: "Salary slip not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Salary slip deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting salary slip:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error: Could not delete salary slip",
      error: error.message,
    });
  }
};
