import { MarriageCertificateModel, generateUniqueMarriageCertificateNo } from "../../models/marriageCertificate.model.js";
import { syncClientProfile } from "../../helper/clientSyncHelper.js";
import { logger } from "../../config/logger.js";

export class MarriageCertificateController {
  // GET /api/v1/client/docs/marriage-certificates
  static async getAll(req, res) {
    try {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
      const skip = (page - 1) * limit;
      const { search } = req.query;

      const query = { isActive: { $ne: false } };

      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), "i");
        query.$or = [
          { certificateNo: regex },
          { memoNo: regex },
          { "groom.name": regex },
          { "groom.phone": regex },
          { "groom.passportNo": regex },
          { "groom.nidNo": regex },
          { "bride.name": regex },
          { "bride.phone": regex },
          { "bride.passportNo": regex },
          { "bride.nidNo": regex },
          { "registrar.officeName": regex },
          { "registrar.kaziName": regex },
        ];
      }

      const [docs, total] = await Promise.all([
        MarriageCertificateModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        MarriageCertificateModel.countDocuments(query),
      ]);

      return res.status(200).json({
        success: true,
        status: "success",
        data: docs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      });
    } catch (err) {
      logger.error("MarriageCertificateController.getAll error:", err);
      return res.status(500).json({
        success: false,
        status: "error",
        message: err.message || "Failed to fetch marriage certificate records",
      });
    }
  }

  // GET /api/v1/client/docs/marriage-certificates/:id
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const doc = await MarriageCertificateModel.findOne({
        $or: [
          { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
          { did: id },
          { certificateNo: id },
          { memoNo: id },
        ],
        isActive: { $ne: false },
      }).lean();

      if (!doc) {
        return res.status(404).json({
          success: false,
          status: "error",
          message: "Marriage certificate document not found",
        });
      }

      return res.status(200).json({
        success: true,
        status: "success",
        data: doc,
      });
    } catch (err) {
      logger.error("MarriageCertificateController.getById error:", err);
      return res.status(500).json({
        success: false,
        status: "error",
        message: err.message || "Failed to fetch marriage certificate document",
      });
    }
  }

  // POST /api/v1/client/docs/marriage-certificates
  static async create(req, res) {
    try {
      const payload = {
        ...req.body,
        createdByDid: req.user?.did || null,
      };

      delete payload._id;
      delete payload.id;

      if (!payload.certificateNo) {
        payload.certificateNo = generateUniqueMarriageCertificateNo();
      }

      const groomName = payload.groom?.name || payload.groomName;
      const brideName = payload.bride?.name || payload.brideName;

      if (!groomName || !brideName) {
        return res.status(400).json({
          success: false,
          status: "error",
          message: "Groom name and Bride name are required.",
        });
      }

      const doc = await MarriageCertificateModel.create(payload);

      // Auto-sync client profile if phone provided
      const clientPhone = payload.groom?.phone || payload.bride?.phone;
      if (clientPhone) {
        try {
          await syncClientProfile({
            fullName: groomName,
            phone: clientPhone,
            nidNumber: payload.groom?.nidNo || "",
            passportNumber: payload.groom?.passportNo || "",
            presentAddress: payload.groom?.address || "",
            relationType: "marriage-certificate",
            relationId: doc.did,
            createdByDid: req.user?.did || null,
          });
        } catch (syncErr) {
          logger.warn("Marriage certificate client auto-sync notice:", syncErr);
        }
      }

      return res.status(201).json({
        success: true,
        status: "success",
        data: doc,
        message: "Marriage certificate document created successfully.",
      });
    } catch (err) {
      logger.error("MarriageCertificateController.create error:", err);
      return res.status(400).json({
        success: false,
        status: "error",
        message: err.message || "Failed to create marriage certificate document",
      });
    }
  }

  // PUT /api/v1/client/docs/marriage-certificates/:id
  static async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };
      delete updateData._id;
      delete updateData.id;

      const doc = await MarriageCertificateModel.findOneAndUpdate(
        {
          $or: [
            { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
            { did: id },
            { certificateNo: id },
          ],
          isActive: { $ne: false },
        },
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!doc) {
        return res.status(404).json({
          success: false,
          status: "error",
          message: "Marriage certificate document not found",
        });
      }

      return res.status(200).json({
        success: true,
        status: "success",
        data: doc,
        message: "Marriage certificate document updated successfully.",
      });
    } catch (err) {
      logger.error("MarriageCertificateController.update error:", err);
      return res.status(400).json({
        success: false,
        status: "error",
        message: err.message || "Failed to update marriage certificate document",
      });
    }
  }

  // DELETE /api/v1/client/docs/marriage-certificates/:id
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const doc = await MarriageCertificateModel.findOneAndUpdate(
        {
          $or: [
            { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
            { did: id },
            { certificateNo: id },
          ],
        },
        { $set: { isActive: false } },
        { new: true }
      );

      if (!doc) {
        return res.status(404).json({
          success: false,
          status: "error",
          message: "Marriage certificate document not found",
        });
      }

      return res.status(200).json({
        success: true,
        status: "success",
        message: "Marriage certificate document removed successfully.",
      });
    } catch (err) {
      logger.error("MarriageCertificateController.delete error:", err);
      return res.status(500).json({
        success: false,
        status: "error",
        message: err.message || "Failed to delete marriage certificate document",
      });
    }
  }
}

export default MarriageCertificateController;
