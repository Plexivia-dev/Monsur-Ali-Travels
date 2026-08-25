import { ClientGuardianModel } from "../../models/clientGuardianApplication.model.js";
import { syncClientProfile } from "../../helper/clientSyncHelper.js";

/**
 * Controller for Client & Guardian Application Form Submissions
 */
export class ClientGuardianController {
  // GET /api/v1/docs/client-guardians
  static async getAll(req, res) {
    try {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = req.query.limit !== undefined ? Math.max(1, parseInt(req.query.limit, 10) || 10) : 10;
      const skip = req.query.skip !== undefined ? Math.max(0, parseInt(req.query.skip, 10)) : (page - 1) * limit;
      const { search, status, serviceType } = req.query;

      const query = {};
      query.isActive = { $ne: false };

      if (status && status !== "all") {
        query.status = status;
      }

      if (serviceType && serviceType !== "all") {
        query.serviceType = serviceType;
      }

      if (search && search.trim()) {
        const searchRegex = new RegExp(search.trim(), "i");
        query.$or = [
          { applicationNo: searchRegex },
          { "client.fullName": searchRegex },
          { "client.nidNumber": searchRegex },
          { "client.passportNumber": searchRegex },
          { "client.mobileNumber": searchRegex },
          { "guardian.fullName": searchRegex },
          { "guardian.mobileNumber": searchRegex },
        ];
      }

      const totalCount = await ClientGuardianModel.countDocuments(query);
      const docs = await ClientGuardianModel.find(query)
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
      console.error("ClientGuardianController getAll error:", err);
      return res.status(500).json({
        status: "error",
        success: false,
        message: err.message || "Failed to fetch client applications.",
      });
    }
  }

  // GET /api/v1/docs/client-guardians/:id
  static async getById(req, res) {
    try {
      const doc = await ClientGuardianModel.findOne({ did: req.params.id, isActive: { $ne: false } });
      if (!doc) {
        return res.status(404).json({
          status: "fail",
          success: false,
          message: "Client application not found.",
        });
      }
      return res.status(200).json({
        status: "success",
        success: true,
        data: doc,
      });
    } catch (err) {
      console.error("ClientGuardianController getById error:", err);
      return res.status(500).json({
        status: "error",
        success: false,
        message: err.message || "Failed to fetch client application.",
      });
    }
  }

  // POST /api/v1/docs/client-guardians
  static async create(req, res) {
    try {
      const payload = {
        ...req.body,
        createdByDid: req.user?.did || null,
      };

      if (payload.payment) {
        const total = Number(payload.payment.totalAmount) || 0;
        const advance = Number(payload.payment.advancePaid) || 0;
        payload.payment.dueAmount = Math.max(0, total - advance);
      }

      // Add initial activity log
      payload.activityLogs = [
        {
          timestamp: new Date(),
          statusChangedTo: payload.status || "received",
          note: "Application file created and received in office.",
          updatedBy: req.user?.name || payload.verifiedBy || "Admin",
        },
      ];

      const doc = await ClientGuardianModel.create(payload);

      // Automatically sync with central Client collection (relational link)
      const syncedClient = await syncClientProfile({
        fullName: payload.client?.fullName,
        phone: payload.client?.mobileNumber,
        nidNumber: payload.client?.nidNumber,
        passportNumber: payload.client?.passportNumber,
        fatherName: payload.client?.fatherName,
        motherName: payload.client?.motherName,
        email: payload.client?.email,
        guardian: payload.guardian,
        attachments: payload.attachments,
        relationType: "application",
        relationId: doc.did,
        payment: payload.payment,
        createdByDid: req.user?.did || null,
      });

      if (syncedClient && !doc.clientDid) {
        doc.clientDid = syncedClient.did;
        await doc.save();
      }

      return res.status(201).json({
        status: "success",
        success: true,
        data: doc,
        clientDid: syncedClient?.did || null,
        message: "Client application created and synced successfully.",
      });
    } catch (err) {
      console.error("ClientGuardianController create error:", err);
      return res.status(400).json({
        status: "error",
        success: false,
        message: err.message || "Failed to create client application.",
      });
    }
  }

  // PUT /api/v1/docs/client-guardians/:id
  static async update(req, res) {
    try {
      const existing = await ClientGuardianModel.findOne({ did: req.params.id });
      if (!existing) {
        return res.status(404).json({
          status: "fail",
          success: false,
          message: "Client application not found.",
        });
      }

      const updateData = { ...req.body };

      if (updateData.payment) {
        const total = Number(updateData.payment.totalAmount) || 0;
        const advance = Number(updateData.payment.advancePaid) || 0;
        updateData.payment.dueAmount = Math.max(0, total - advance);
      }

      // If status changed, record an activity log
      if (updateData.status && updateData.status !== existing.status) {
        const newLog = {
          timestamp: new Date(),
          statusChangedTo: updateData.status,
          note: updateData.statusNote || `Status updated from ${existing.status} to ${updateData.status}.`,
          updatedBy: req.user?.name || "Admin",
        };
        updateData.$push = { activityLogs: newLog };
      }

      const updatedDoc = await ClientGuardianModel.findOneAndUpdate(
        { did: req.params.id },
        updateData,
        { new: true, runValidators: true }
      );

      return res.status(200).json({
        status: "success",
        success: true,
        data: updatedDoc,
        message: "Client application updated successfully.",
      });
    } catch (err) {
      console.error("ClientGuardianController update error:", err);
      return res.status(400).json({
        status: "error",
        success: false,
        message: err.message || "Failed to update client application.",
      });
    }
  }

  // PATCH /api/v1/docs/client-guardians/:id/status
  static async updateStatus(req, res) {
    try {
      const { status, note } = req.body;
      if (!status) {
        return res.status(400).json({
          status: "fail",
          success: false,
          message: "Status is required.",
        });
      }

      const existing = await ClientGuardianModel.findOne({ did: req.params.id });
      if (!existing) {
        return res.status(404).json({
          status: "fail",
          success: false,
          message: "Client application not found.",
        });
      }

      const newLog = {
        timestamp: new Date(),
        statusChangedTo: status,
        note: note || `File status changed to ${status}.`,
        updatedBy: req.user?.name || "Admin",
      };

      existing.status = status;
      existing.activityLogs.push(newLog);
      await existing.save();

      return res.status(200).json({
        status: "success",
        success: true,
        data: existing,
        message: `Status updated to ${status} successfully.`,
      });
    } catch (err) {
      console.error("ClientGuardianController updateStatus error:", err);
      return res.status(400).json({
        status: "error",
        success: false,
        message: err.message || "Failed to update status.",
      });
    }
  }

  // DELETE /api/v1/docs/client-guardians/:id
  static async delete(req, res) {
    try {
      const doc = await ClientGuardianModel.findOneAndUpdate(
        { did: req.params.id },
        { isActive: false },
        { new: true }
      );
      if (!doc) {
        return res.status(404).json({
          status: "fail",
          success: false,
          message: "Client application not found.",
        });
      }
      return res.status(200).json({
        status: "success",
        success: true,
        message: "Client application deleted successfully.",
      });
    } catch (err) {
      console.error("ClientGuardianController delete error:", err);
      return res.status(500).json({
        status: "error",
        success: false,
        message: err.message || "Failed to delete client application.",
      });
    }
  }
}

export const ClientGuardianController = ClientGuardianController;
export default ClientGuardianController;

