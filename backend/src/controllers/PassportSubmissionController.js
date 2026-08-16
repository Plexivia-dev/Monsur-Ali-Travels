import { PassportSubmissionModel, generateUniquePassportTrackingNo } from "../models/passportSubmission.model.js";

// @desc    Get all passport submissions
// @route   GET /api/v1/docs/passport-submissions
export const getPassportSubmissions = async (req, res, next) => {
  try {
    const submissions = await PassportSubmissionModel.find().sort({ createdAt: -1 });
    return res.status(200).json({
      status: "success",
      results: submissions.length,
      data: submissions,
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
    const query = isMongoId ? { _id: id } : { trackingNo: id };

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

    const deletedSubmission = await PassportSubmissionModel.findOneAndDelete(query);
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
