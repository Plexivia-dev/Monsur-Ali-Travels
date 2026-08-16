import { IndianVisaSubmissionModel } from "../models/indianVisaSubmission.model.js";

/**
 * Controller for Indian Visa Application Submissions
 */
export class IndianVisaController {
  // GET /api/v1/docs/indian-visas
  static async getAll(req, res) {
    try {
      const docs = await IndianVisaSubmissionModel.find().sort({ createdAt: -1 });
      return res.status(200).json({
        status: "success",
        success: true,
        data: docs,
      });
    } catch (err) {
      console.error("IndianVisaController getAll error:", err);
      return res.status(500).json({
        status: "error",
        success: false,
        message: err.message || "Failed to fetch Indian visa applications.",
      });
    }
  }

  // GET /api/v1/docs/indian-visas/:id
  static async getById(req, res) {
    try {
      const doc = await IndianVisaSubmissionModel.findById(req.params.id);
      if (!doc) {
        return res.status(404).json({
          status: "fail",
          success: false,
          message: "Indian visa submission not found.",
        });
      }
      return res.status(200).json({
        status: "success",
        success: true,
        data: doc,
      });
    } catch (err) {
      console.error("IndianVisaController getById error:", err);
      return res.status(500).json({
        status: "error",
        success: false,
        message: err.message || "Failed to fetch Indian visa submission.",
      });
    }
  }

  // POST /api/v1/docs/indian-visas
  static async create(req, res) {
    try {
      const payload = {
        ...req.body,
        createdBy: req.user?._id || req.user?.id || null,
      };

      const newDoc = new IndianVisaSubmissionModel(payload);
      const savedDoc = await newDoc.save();

      return res.status(201).json({
        status: "success",
        success: true,
        data: savedDoc,
        message: "Indian visa application submitted successfully.",
      });
    } catch (err) {
      console.error("IndianVisaController create error:", err);
      return res.status(400).json({
        status: "fail",
        success: false,
        message: err.message || "Failed to save Indian visa application.",
      });
    }
  }

  // PUT /api/v1/docs/indian-visas/:id
  static async update(req, res) {
    try {
      const updatedDoc = await IndianVisaSubmissionModel.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!updatedDoc) {
        return res.status(404).json({
          status: "fail",
          success: false,
          message: "Indian visa submission not found.",
        });
      }

      return res.status(200).json({
        status: "success",
        success: true,
        data: updatedDoc,
        message: "Indian visa submission updated successfully.",
      });
    } catch (err) {
      console.error("IndianVisaController update error:", err);
      return res.status(400).json({
        status: "fail",
        success: false,
        message: err.message || "Failed to update Indian visa submission.",
      });
    }
  }

  // DELETE /api/v1/docs/indian-visas/:id
  static async delete(req, res) {
    try {
      const deletedDoc = await IndianVisaSubmissionModel.findByIdAndDelete(req.params.id);
      if (!deletedDoc) {
        return res.status(404).json({
          status: "fail",
          success: false,
          message: "Indian visa submission not found.",
        });
      }

      return res.status(200).json({
        status: "success",
        success: true,
        data: null,
        message: "Indian visa submission deleted successfully.",
      });
    } catch (err) {
      console.error("IndianVisaController delete error:", err);
      return res.status(500).json({
        status: "error",
        success: false,
        message: err.message || "Failed to delete Indian visa submission.",
      });
    }
  }
}
