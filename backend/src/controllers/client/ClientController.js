import Client from "../../models/client.model.js";

/**
 * Controller for Central Client Management & Relations
 */
class ClientController {
  // GET /api/v1/clients
  async getAll(req, res) {
    try {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = req.query.limit !== undefined ? Math.max(1, parseInt(req.query.limit, 10) || 10) : 10;
      const skip = req.query.skip !== undefined ? Math.max(0, parseInt(req.query.skip, 10)) : (page - 1) * limit;
      const { search, status, clientType } = req.query;

      const query = {};
      query.isActive = { $ne: false };

      if (status && status !== "all") {
        query.status = status;
      }
      if (clientType && clientType !== "all") {
        query.clientType = clientType;
      }

      if (search && search.trim()) {
        const searchRegex = new RegExp(search.trim(), "i");
        query.$or = [
          { fullName: searchRegex },
          { phone: searchRegex },
          { passportNumber: searchRegex },
          { nidNumber: searchRegex },
          { clientCode: searchRegex },
          { email: searchRegex },
        ];
      }

      const totalCount = await Client.countDocuments(query);
      const clients = await Client.find(query)
        .populate("applications", "applicationNo serviceType status dateReceived payment")
        .populate("visaSubmissions", "trackingNo visaType status submissionDate")
        .populate("passportSubmissions", "trackingNo passportType status submissionDate")
        .populate("clientCases", "fileNumber clientName destinationCountry tradeSkill workflowStatus")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const totalPages = Math.ceil(totalCount / limit) || 1;

      return res.status(200).json({
        status: "success",
        success: true,
        data: clients,
        pagination: {
          skip,
          limit,
          totalCount,
          page,
          totalPages,
          hasNextPage: skip + clients.length < totalCount,
          hasPrevPage: skip > 0,
        },
      });
    } catch (err) {
      console.error("ClientController.getAll error:", err);
      return res.status(500).json({
        status: "error",
        success: false,
        message: err.message || "Failed to fetch clients.",
      });
    }
  }

  // GET /api/v1/clients/:id
  async getById(req, res) {
    try {
      const client = await Client.findOne({ did: req.params.id, isActive: { $ne: false } })
        .populate("applications")
        .populate("visaSubmissions")
        .populate("passportSubmissions")
        .populate("clientCases")
        .populate("agreements")
        .populate("invoices");

      if (!client) {
        return res.status(404).json({
          status: "fail",
          success: false,
          message: "Client not found.",
        });
      }

      return res.status(200).json({
        status: "success",
        success: true,
        data: client,
      });
    } catch (err) {
      console.error("ClientController.getById error:", err);
      return res.status(500).json({
        status: "error",
        success: false,
        message: err.message || "Failed to fetch client profile.",
      });
    }
  }

  // POST /api/v1/clients
  async create(req, res) {
    try {
      const clientData = {
        ...req.body,
        createdByDid: req.user?.did || null,
      };

      const client = await Client.create(clientData);

      return res.status(201).json({
        status: "success",
        success: true,
        data: client,
        message: "Client profile created successfully.",
      });
    } catch (err) {
      console.error("ClientController.create error:", err);
      return res.status(400).json({
        status: "error",
        success: false,
        message: err.message || "Failed to create client.",
      });
    }
  }

  // PUT /api/v1/clients/:id
  async update(req, res) {
    try {
      const client = await Client.findOneAndUpdate(
        { did: req.params.id },
        {
          ...req.body,
          updatedByDid: req.user?.did || null,
        },
        { new: true, runValidators: true }
      );

      if (!client) {
        return res.status(404).json({
          status: "fail",
          success: false,
          message: "Client not found.",
        });
      }

      return res.status(200).json({
        status: "success",
        success: true,
        data: client,
        message: "Client updated successfully.",
      });
    } catch (err) {
      console.error("ClientController.update error:", err);
      return res.status(400).json({
        status: "error",
        success: false,
        message: err.message || "Failed to update client.",
      });
    }
  }

  // DELETE /api/v1/clients/:id
  async delete(req, res) {
    try {
      const client = await Client.findOneAndUpdate(
        { did: req.params.id },
        { isActive: false },
        { new: true }
      );
      if (!client) {
        return res.status(404).json({
          status: "fail",
          success: false,
          message: "Client not found.",
        });
      }

      return res.status(200).json({
        status: "success",
        success: true,
        message: "Client profile deleted successfully.",
      });
    } catch (err) {
      console.error("ClientController.delete error:", err);
      return res.status(500).json({
        status: "error",
        success: false,
        message: err.message || "Failed to delete client.",
      });
    }
  }

  // Quick lookup by passport, phone or NID
  // GET /api/v1/clients/lookup?query=...
  async lookup(req, res) {
    try {
      const { query } = req.query;
      if (!query || !query.trim()) {
        return res.status(400).json({
          status: "fail",
          success: false,
          message: "Search query is required.",
        });
      }

      const q = query.trim();
      const regex = new RegExp(q, "i");

      const clients = await Client.find({
        isActive: { $ne: false },
        $or: [
          { passportNumber: q.toUpperCase() },
          { phone: regex },
          { nidNumber: regex },
          { clientCode: regex },
          { fullName: regex },
        ],
      })
        .select("clientCode fullName phone passportNumber nidNumber fatherName motherName guardian attachments")
        .limit(10);

      return res.status(200).json({
        status: "success",
        success: true,
        data: clients,
      });
    } catch (err) {
      console.error("ClientController.lookup error:", err);
      return res.status(500).json({
        status: "error",
        success: false,
        message: err.message || "Failed to lookup client.",
      });
    }
  }
}

export default new ClientController();
