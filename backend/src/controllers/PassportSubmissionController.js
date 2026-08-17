import { PassportSubmissionModel, generateUniquePassportTrackingNo } from "../models/passportSubmission.model.js";

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
    const isMongoId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isMongoId ? { _id: id, isActive: { $ne: false } } : { trackingNo: id, isActive: { $ne: false } };

    const submission = await PassportSubmissionModel.findOne(query);
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
    const isMongoId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isMongoId ? { _id: id } : { trackingNo: id };

    const updatedSubmission = await PassportSubmissionModel.findOneAndUpdate(query, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedSubmission) {
      return res.status(404).json({
        status: "error",
        message: "Passport submission record not found",
      });
    }

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
    const isMongoId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isMongoId ? { _id: id } : { trackingNo: id };

    const deletedSubmission = await PassportSubmissionModel.findOneAndUpdate(query, { isActive: false }, { new: true });
    if (!deletedSubmission) {
      return res.status(404).json({
        status: "error",
        message: "Passport submission record not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Passport submission record deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
