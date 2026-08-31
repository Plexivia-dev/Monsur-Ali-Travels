import mongoose from "mongoose";
import { PassportSubmissionModel, generateUniquePassportTrackingNo } from "../../models/passportSubmission.model.js";
import { NotificationModel } from "../../models/notification.model.js";

// Helper to query passport submission by either MongoDB _id, did, or trackingNo
const findPassportByIdOrTracking = async (id, extraQuery = {}) => {
  if (!id) return null;
  const isObjectId = mongoose.isValidObjectId(id);
  const conditions = [{ did: id }, { trackingNo: id }];
  if (isObjectId) conditions.push({ _id: id });
  return PassportSubmissionModel.findOne({ $or: conditions, ...extraQuery });
};

// @desc    Get all passport submissions
// @route   GET /api/v1/docs/passport-submissions
export const getPassportSubmissions = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = req.query.limit !== undefined ? Math.max(1, parseInt(req.query.limit, 10) || 10) : 10;
    const skip = req.query.skip !== undefined ? Math.max(0, parseInt(req.query.skip, 10)) : (page - 1) * limit;
    const { search, status, passportType } = req.query;

    const query = {};
    query.isActive = { $ne: false };

    if (status && status !== "all") {
      query.status = status;
    }

    if (passportType && passportType !== "all") {
      query.passportType = passportType;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { trackingNo: searchRegex },
        { applicantName: searchRegex },
        { applicantPhone: searchRegex },
        { nidBirthCertNo: searchRegex },
        { previousPassportNo: searchRegex },
        { guardianName: searchRegex },
      ];
    }

    const totalCount = await PassportSubmissionModel.countDocuments(query);
    const submissions = await PassportSubmissionModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalCount / limit) || 1;

    return res.status(200).json({
      status: "success",
      success: true,
      results: submissions.length,
      data: submissions,
      pagination: {
        skip,
        limit,
        totalCount,
        page,
        totalPages,
        hasNextPage: skip + submissions.length < totalCount,
        hasPrevPage: skip > 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single passport submission by ID or trackingNo
// @route   GET /api/v1/docs/passport-submissions/:id
export const getPassportSubmissionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const submission = await findPassportByIdOrTracking(id, { isActive: { $ne: false } });
    if (!submission) {
      return res.status(404).json({
        status: "error",
        message: "Passport submission record not found",
      });
    }
    return res.status(200).json({
      status: "success",
      data: submission,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new passport submission
// @route   POST /api/v1/docs/passport-submissions
export const createPassportSubmission = async (req, res, next) => {
  try {
    const body = req.body ?? {};
    if (!body.trackingNo) {
      body.trackingNo = generateUniquePassportTrackingNo();
    }
    const newSubmission = await PassportSubmissionModel.create(body);

    return res.status(201).json({
      status: "success",
      message: "Passport submission saved successfully",
      data: newSubmission,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update existing passport submission
// @route   PUT /api/v1/docs/passport-submissions/:id
export const updatePassportSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await findPassportByIdOrTracking(id);
    if (!existing) {
      return res.status(404).json({
        status: "error",
        message: "Passport submission record not found",
      });
    }

    const updatedSubmission = await PassportSubmissionModel.findOneAndUpdate(
      { _id: existing._id },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      status: "success",
      message: "Passport submission updated successfully",
      data: updatedSubmission,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete passport submission
// @route   DELETE /api/v1/docs/passport-submissions/:id
export const deletePassportSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await findPassportByIdOrTracking(id);
    if (!existing) {
      return res.status(404).json({
        status: "error",
        message: "Passport submission record not found",
      });
    }

    await PassportSubmissionModel.findOneAndUpdate(
      { _id: existing._id },
      { isActive: false },
      { new: true }
    );

    return res.status(200).json({
      status: "success",
      message: "Passport submission record deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Passport Stage & Add Documents
// @route   PATCH /api/v1/passports/:id/stage
export const updatePassportStage = async (req, res, next) => {
  try {
    const { status, note, document } = req.body;
    const { id } = req.params;

    const doc = await findPassportByIdOrTracking(id);
    if (!doc) {
      return res.status(404).json({
        status: "fail",
        success: false,
        message: "Passport submission not found.",
      });
    }

    if (status) {
      doc.status = status;
    }

    // Add attached document if uploaded during stage update
    if (document && document.fileUrl) {
      doc.attachments = doc.attachments || {};
      doc.attachments.supportingDocs = doc.attachments.supportingDocs || [];
      doc.attachments.supportingDocs.push({
        name: document.name || `Document-${status}`,
        fileUrl: document.fileUrl,
        fileType: document.fileType || "document",
        uploadedAt: new Date(),
      });
    }

    doc.activityLogs = doc.activityLogs || [];
    doc.activityLogs.push({
      timestamp: new Date(),
      statusChangedTo: status || doc.status,
      note: note || `Stage updated to ${status}`,
      updatedBy: req.user?.name || "Staff",
    });

    await doc.save();

    // Create a system notification alert
    try {
      await NotificationModel.create({
        title: `Passport Status: ${status}`,
        message: `Passport file for "${doc.applicantName}" (Passport ID: ${doc.trackingNo}) has been updated to "${status}".`,
        module: "passport",
        type: status === "rejected" ? "danger" : status === "approved" || status === "complete_process" ? "success" : "info",
        refId: doc._id,
        createdBy: req.user?.name || "Staff",
      });
    } catch (notifErr) {
      console.error("Failed to save status update notification:", notifErr);
    }

    return res.status(200).json({
      status: "success",
      success: true,
      data: doc,
      message: `Passport processing status updated to ${status}.`,
    });
  } catch (error) {
    next(error);
  }
};
