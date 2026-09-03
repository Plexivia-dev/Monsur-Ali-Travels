import { CharacterCertificateModel, generateUniqueCharacterCertificateNo } from "../../models/characterCertificate.model.js";
import { syncClientProfile } from "../../helper/clientSyncHelper.js";
import { logger } from "../../config/logger.js";

export class CharacterCertificateController {
  // GET /api/v1/client/docs/character-certificates
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
          { "client.fullName": regex },
          { "client.phone": regex },
          { "client.passportNo": regex },
          { "client.nidNo": regex },
          { "client.fatherName": regex },
          { "authority.organizationName": regex },
          { "signatory.name": regex },
        ];
      }

      const [docs, total] = await Promise.all([
        CharacterCertificateModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        CharacterCertificateModel.countDocuments(query),
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
      logger.error("CharacterCertificateController.getAll error:", err);
      return res.status(500).json({
        success: false,
        status: "error",
        message: err.message || "Failed to fetch character certificate records",
      });
    }
  }

  // GET /api/v1/client/docs/character-certificates/:id
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const doc = await CharacterCertificateModel.findOne({
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
          message: "Character certificate document not found",
        });
      }

      return res.status(200).json({
        success: true,
        status: "success",
        data: doc,
      });
    } catch (err) {
      logger.error("CharacterCertificateController.getById error:", err);
      return res.status(500).json({
        success: false,
        status: "error",
        message: err.message || "Failed to fetch character certificate document",
      });
    }
  }

  // POST /api/v1/client/docs/character-certificates
  static async create(req, res) {
    try {
      const payload = {
        ...req.body,
        createdByDid: req.user?.did || null,
      };

      delete payload._id;
      delete payload.id;

      if (!payload.certificateNo) {
        payload.certificateNo = generateUniqueCharacterCertificateNo();
      }

      const clientName = payload.client?.fullName || payload.clientName;
      const clientPhone = payload.client?.phone || payload.clientPhone;

      if (!clientName) {
        return res.status(400).json({
          success: false,
          status: "error",
          message: "Candidate full name is required.",
        });
      }

      const doc = await CharacterCertificateModel.create(payload);

      // Auto-sync client profile if phone provided
      if (clientPhone) {
        try {
          await syncClientProfile({
            fullName: clientName,
            phone: clientPhone,
            nidNumber: payload.client?.nidNo || "",
            passportNumber: payload.client?.passportNo || "",
            presentAddress: payload.client?.presentAddress || "",
            relationType: "character-certificate",
            relationId: doc.did,
            createdByDid: req.user?.did || null,
          });
        } catch (syncErr) {
          logger.warn("Character certificate client auto-sync notice:", syncErr);
        }
      }

      return res.status(201).json({
        success: true,
        status: "success",
        data: doc,
        message: "Character certificate document created successfully.",
      });
    } catch (err) {
      logger.error("CharacterCertificateController.create error:", err);
      return res.status(400).json({
        success: false,
        status: "error",
        message: err.message || "Failed to create character certificate document",
      });
    }
  }

  // PUT /api/v1/client/docs/character-certificates/:id
  static async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };
      delete updateData._id;
      delete updateData.id;

      const doc = await CharacterCertificateModel.findOneAndUpdate(
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
          message: "Character certificate document not found",
        });
      }

      return res.status(200).json({
        success: true,
        status: "success",
        data: doc,
        message: "Character certificate document updated successfully.",
      });
    } catch (err) {
      logger.error("CharacterCertificateController.update error:", err);
      return res.status(400).json({
        success: false,
        status: "error",
        message: err.message || "Failed to update character certificate document",
      });
    }
  }

  // DELETE /api/v1/client/docs/character-certificates/:id
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const doc = await CharacterCertificateModel.findOneAndUpdate(
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
          message: "Character certificate document not found",
        });
      }

      return res.status(200).json({
        success: true,
        status: "success",
        message: "Character certificate document removed successfully.",
      });
    } catch (err) {
      logger.error("CharacterCertificateController.delete error:", err);
      return res.status(500).json({
        success: false,
        status: "error",
        message: err.message || "Failed to delete character certificate document",
      });
    }
  }
}

export default CharacterCertificateController;
