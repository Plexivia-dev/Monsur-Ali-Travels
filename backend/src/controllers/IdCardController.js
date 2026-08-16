import mongoose from "mongoose";
import { IdCardModel } from "../models/idCard.model.js";

/**
 * Controller for Employee ID Cards
 */
export class IdCardController {
  // GET /api/v1/docs/id-cards
  static async getAll(req, res) {
    try {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = req.query.limit !== undefined ? Math.max(1, parseInt(req.query.limit, 10) || 10) : 10;
      const skip = req.query.skip !== undefined ? Math.max(0, parseInt(req.query.skip, 10)) : (page - 1) * limit;
      const { search, status } = req.query;

      const query = { isActive: true };

      if (status && status !== "all") {
        query.status = status;
      }

      if (search && search.trim()) {
        const searchRegex = new RegExp(search.trim(), "i");
        query.$or = [
          { fullName: searchRegex },
          { idNumber: searchRegex },
          { role: searchRegex },
          { contactPhone: searchRegex },
          { email: searchRegex },
        ];
      }

      const totalCount = await IdCardModel.countDocuments(query);
      const docs = await IdCardModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const totalPages = Math.ceil(totalCount / limit) || 1;

      return res.status(200).json({
        success: true,
        status: "success",
        data: docs,
        pagination: {
          skip,
          limit,
          totalCount,
          page,
          totalPages,
          hasNextPage: skip + docs.length < totalCount,
          hasPrevPage: skip > 0,
        },
      });
    } catch (err) {
      console.error("IdCardController getAll error:", err);
      return res.status(500).json({
        success: false,
        status: "error",
        message: err.message || "Failed to fetch ID cards.",
      });
    }
  }

  // GET /api/v1/docs/id-cards/:id
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const isMongoId = mongoose.isValidObjectId(id);
      const query = isMongoId ? { _id: id, isActive: true } : { idNumber: id, isActive: true };

      const doc = await IdCardModel.findOne(query);
      if (!doc) {
        return res.status(404).json({
          success: false,
          status: "fail",
          message: "Employee ID card not found.",
        });
      }

      return res.status(200).json({
        success: true,
        status: "success",
        data: doc,
      });
    } catch (err) {
      console.error("IdCardController getById error:", err);
      return res.status(500).json({
        success: false,
        status: "error",
        message: err.message || "Failed to fetch ID card.",
      });
    }
  }

  // POST /api/v1/docs/id-cards
  static async create(req, res) {
    try {
      const payload = {
        ...req.body,
        createdBy: req.user?._id || req.user?.id || null,
      };

      if (!payload.fullName || !payload.fullName.trim()) {
        return res.status(400).json({
          success: false,
          status: "fail",
          message: "কর্মচারীর নাম (Full Name) আবশ্যক।",
        });
      }

      const newDoc = await IdCardModel.create(payload);

      return res.status(201).json({
        success: true,
        status: "success",
        data: newDoc,
        message: "Employee ID card created successfully.",
      });
    } catch (err) {
      console.error("IdCardController create error:", err);
      return res.status(400).json({
        success: false,
        status: "fail",
        message: err.message || "Failed to create ID card.",
      });
    }
  }

  // PUT /api/v1/docs/id-cards/:id
  static async update(req, res) {
    try {
      const { id } = req.params;
      const isMongoId = mongoose.isValidObjectId(id);
      const query = isMongoId ? { _id: id } : { idNumber: id };

      const updatedDoc = await IdCardModel.findOneAndUpdate(query, req.body, {
        new: true,
        runValidators: true,
      });

      if (!updatedDoc) {
        return res.status(404).json({
          success: false,
          status: "fail",
          message: "Employee ID card not found.",
        });
      }

      return res.status(200).json({
        success: true,
        status: "success",
        data: updatedDoc,
        message: "Employee ID card updated successfully.",
      });
    } catch (err) {
      console.error("IdCardController update error:", err);
      return res.status(400).json({
        success: false,
        status: "fail",
        message: err.message || "Failed to update ID card.",
      });
    }
  }

  // DELETE /api/v1/docs/id-cards/:id
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const isMongoId = mongoose.isValidObjectId(id);
      const query = isMongoId ? { _id: id } : { idNumber: id };

      const deletedDoc = await IdCardModel.findOneAndUpdate(query, { isActive: false }, { new: true });
      if (!deletedDoc) {
        return res.status(404).json({
          success: false,
          status: "fail",
          message: "Employee ID card not found.",
        });
      }

      return res.status(200).json({
        success: true,
        status: "success",
        message: "Employee ID card deleted successfully.",
      });
    } catch (err) {
      console.error("IdCardController delete error:", err);
      return res.status(500).json({
        success: false,
        status: "error",
        message: err.message || "Failed to delete ID card.",
      });
    }
  }
}
