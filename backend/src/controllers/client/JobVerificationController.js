import { JobVerificationModel, generateUniqueJobVerificationId } from "../../models/jobVerification.model.js";
import { syncClientProfile } from "../../helper/clientSyncHelper.js";
import { logger } from "../../config/logger.js";

export class JobVerificationController {
  // GET /api/v1/client/docs/job-verifications
  static async getAll(req, res) {
    try {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
      const skip = (page - 1) * limit;
      const { search, status } = req.query;

      const query = { isActive: { $ne: false } };

      if (status && status !== "all") {
        query["verificationDetails.status"] = status;
      }

      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), "i");
        query.$or = [
          { verificationId: regex },
          { "clientInfo.clientName": regex },
          { "clientInfo.clientPhone": regex },
          { "clientInfo.clientIdNumber": regex },
          { "jobStayDetails.destinationCountry": regex },
          { "jobStayDetails.jobTitle": regex },
        ];
      }

      const [docs, total] = await Promise.all([
        JobVerificationModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        JobVerificationModel.countDocuments(query),
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
      logger.error("JobVerificationController.getAll error:", err);
      return res.status(500).json({
        success: false,
        status: "error",
        message: err.message || "Failed to fetch job verification records",
      });
    }
  }

  // GET /api/v1/client/docs/job-verifications/:id
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const doc = await JobVerificationModel.findOne({
        $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { did: id }, { verificationId: id }],
        isActive: { $ne: false },
      }).lean();

      if (!doc) {
        return res.status(404).json({
          success: false,
          status: "error",
          message: "Job verification document not found",
        });
      }

      return res.status(200).json({
        success: true,
        status: "success",
        data: doc,
      });
    } catch (err) {
      logger.error("JobVerificationController.getById error:", err);
      return res.status(500).json({
        success: false,
        status: "error",
        message: err.message || "Failed to fetch job verification document",
      });
    }
  }

  // POST /api/v1/client/docs/job-verifications
  static async create(req, res) {
    try {
      const payload = {
        ...req.body,
        createdByDid: req.user?.did || null,
      };

      delete payload._id;
      delete payload.id;

      if (!payload.verificationId) {
        payload.verificationId = generateUniqueJobVerificationId();
      }

      const clientName = payload.clientInfo?.clientName || payload.clientName;
      const clientPhone = payload.clientInfo?.clientPhone || payload.clientPhone;

      if (!clientName || !clientPhone) {
        return res.status(400).json({
          success: false,
          status: "error",
          message: "Client full name and phone number are required.",
        });
      }

      const doc = await JobVerificationModel.create(payload);

      // Auto-sync client profile in central Client database
      let syncedClient = null;
      try {
        syncedClient = await syncClientProfile({
          fullName: clientName,
          phone: clientPhone,
          nidNumber: payload.clientInfo?.clientIdNumber || "",
          passportNumber: payload.clientInfo?.clientIdNumber || "",
          email: payload.clientInfo?.clientEmail || "",
          presentAddress: payload.clientInfo?.clientAddress || "",
          relationType: "agreement",
          relationId: doc.did,
          createdByDid: req.user?.did || null,
        });

        if (syncedClient && !doc.clientDid) {
          doc.clientDid = syncedClient.did;
          await doc.save();
        }
      } catch (syncErr) {
        logger.warn("Job verification client auto-sync notice:", syncErr);
      }

      return res.status(201).json({
        success: true,
        status: "success",
        data: doc,
        clientDid: syncedClient?.did || doc.clientDid || null,
        message: "Job verification document created successfully.",
      });
    } catch (err) {
      logger.error("JobVerificationController.create error:", err);
      return res.status(400).json({
        success: false,
        status: "error",
        message: err.message || "Failed to create job verification document",
      });
    }
  }

  // PUT /api/v1/client/docs/job-verifications/:id
  static async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };
      delete updateData._id;
      delete updateData.id;

      const doc = await JobVerificationModel.findOneAndUpdate(
        {
          $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { did: id }, { verificationId: id }],
          isActive: { $ne: false },
        },
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!doc) {
        return res.status(404).json({
          success: false,
          status: "error",
          message: "Job verification document not found",
        });
      }

      return res.status(200).json({
        success: true,
        status: "success",
        data: doc,
        message: "Job verification document updated successfully.",
      });
    } catch (err) {
      logger.error("JobVerificationController.update error:", err);
      return res.status(400).json({
        success: false,
        status: "error",
        message: err.message || "Failed to update job verification document",
      });
    }
  }

  // DELETE /api/v1/client/docs/job-verifications/:id
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const doc = await JobVerificationModel.findOneAndUpdate(
        {
          $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { did: id }, { verificationId: id }],
        },
        { $set: { isActive: false } },
        { new: true }
      );

      if (!doc) {
        return res.status(404).json({
          success: false,
          status: "error",
          message: "Job verification document not found",
        });
      }

      return res.status(200).json({
        success: true,
        status: "success",
        message: "Job verification document removed successfully.",
      });
    } catch (err) {
      logger.error("JobVerificationController.delete error:", err);
      return res.status(500).json({
        success: false,
        status: "error",
        message: err.message || "Failed to delete job verification document",
      });
    }
  }
}
