import mongoose from "mongoose";
import { IndianVisaSubmissionModel } from "../../models/indianVisaSubmission.model.js";
import { syncClientProfile } from "../../helper/clientSyncHelper.js";
import { NotificationModel } from "../../models/notification.model.js";

// Helper to query visa application by either MongoDB _id, did, or trackingNo
const findVisaByIdOrDid = async (id, extraQuery = {}) => {
  if (!id) return null;
  const isObjectId = mongoose.isValidObjectId(id);
  const conditions = [{ did: id }, { trackingNo: id }];
  if (isObjectId) conditions.push({ _id: id });
  return IndianVisaSubmissionModel.findOne({ $or: conditions, ...extraQuery });
};

/**
 * Controller for Indian Visa Application Submissions
 */
export class IndianVisaController {
  // GET /api/v1/docs/indian-visas
  static async getAll(req, res) {
    try {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = req.query.limit !== undefined ? Math.max(1, parseInt(req.query.limit, 10) || 10) : 10;
      const skip = req.query.skip !== undefined ? Math.max(0, parseInt(req.query.skip, 10)) : (page - 1) * limit;
      const { search, status, visaType } = req.query;

      const query = {};
      query.isActive = { $ne: false };

      if (status && status !== "all") {
        query.status = status;
      }

      if (visaType && visaType !== "all") {
        query.visaType = visaType;
      }

      if (search && search.trim()) {
        const searchRegex = new RegExp(search.trim(), "i");
        query.$or = [
          { trackingNo: searchRegex },
          { applicantName: searchRegex },
          { passportNo: searchRegex },
          { applicantPhone: searchRegex },
          { nidBirthCertNo: searchRegex },
          { entryPort: searchRegex },
        ];
      }

      const totalCount = await IndianVisaSubmissionModel.countDocuments(query);
      const docs = await IndianVisaSubmissionModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const totalPages = Math.ceil(totalCount / limit) || 1;

      return res.status(200).json({
        status: "success",
        success: true,
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
      const doc = await findVisaByIdOrDid(req.params.id, { isActive: { $ne: false } });
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
        createdByDid: req.user?.did || null,
      };

      // Initial activity log
      payload.activityLogs = [
        {
          timestamp: new Date(),
          statusChangedTo: payload.status || "pending",
          note: "Indian visa submission created.",
          updatedBy: req.user?.name || "Staff",
        },
      ];

      const newDoc = new IndianVisaSubmissionModel(payload);
      const savedDoc = await newDoc.save();

      // Automatically sync with Central Client Collection
      const syncedClient = await syncClientProfile({
        fullName: payload.applicantName,
        phone: payload.applicantPhone,
        nidNumber: payload.nidBirthCertNo,
        passportNumber: payload.passportNo,
        presentAddress: payload.address,
        email: payload.applicantEmail,
        attachments: payload.attachments,
        relationType: "visa",
        relationId: savedDoc.did,
        createdByDid: req.user?.did || null,
      });

      if (syncedClient && !savedDoc.clientDid) {
        savedDoc.clientDid = syncedClient.did;
        await savedDoc.save();
      }

      return res.status(201).json({
        status: "success",
        success: true,
        data: savedDoc,
        clientDid: syncedClient?.did || null,
        message: "Indian visa application submitted and client synced successfully.",
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

  // PATCH /api/v1/docs/indian-visas/:id/stage
  // Update Stage & Add Stage Documents
  static async updateStage(req, res) {
    try {
      const { status, note, document } = req.body;
      const doc = await findVisaByIdOrDid(req.params.id);

      if (!doc) {
        return res.status(404).json({
          status: "fail",
          success: false,
          message: "Indian visa submission not found.",
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
          title: `Visa Status: ${status}`,
          message: `Visa file for "${doc.applicantName}" (Passport: ${doc.passportNo}) has been updated to "${status}".`,
          module: "visa",
          type: status === "rejected" ? "danger" : status === "approved" || status === "complete_process" ? "success" : "info",
          refDid: doc.did,
          createdBy: req.user?.name || "Staff",
        });
      } catch (notifErr) {
        console.error("Failed to save status update notification:", notifErr);
      }

      return res.status(200).json({
        status: "success",
        success: true,
        data: doc,
        message: `Visa processing status updated to ${status}.`,
      });
    } catch (err) {
      console.error("IndianVisaController updateStage error:", err);
      return res.status(400).json({
        status: "error",
        success: false,
        message: err.message || "Failed to update visa stage.",
      });
    }
  }

  // PUT /api/v1/docs/indian-visas/:id
  static async update(req, res) {
    try {
      const existing = await findVisaByIdOrDid(req.params.id);
      if (!existing) {
        return res.status(404).json({
          status: "fail",
          success: false,
          message: "Indian visa submission not found.",
        });
      }

      const updatedDoc = await IndianVisaSubmissionModel.findOneAndUpdate(
        { _id: existing._id },
        req.body,
        { new: true, runValidators: true }
      );

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
      const existing = await findVisaByIdOrDid(req.params.id);
      if (!existing) {
        return res.status(404).json({
          status: "fail",
          success: false,
          message: "Indian visa submission not found.",
        });
      }

      const deletedDoc = await IndianVisaSubmissionModel.findOneAndUpdate(
        { _id: existing._id },
        { isActive: false },
        { new: true }
      );

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

export default IndianVisaController;
