import Customer from "../../models/customer.model.js";

/**
 * Controller for Central Customer Management & Relations
 */
class CustomerController {
  // GET /api/v1/customers
  async getAll(req, res) {
    try {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = req.query.limit !== undefined ? Math.max(1, parseInt(req.query.limit, 10) || 10) : 10;
      const skip = req.query.skip !== undefined ? Math.max(0, parseInt(req.query.skip, 10)) : (page - 1) * limit;
      const { search, status, customerType } = req.query;

      const query = {};
      query.isActive = { $ne: false };

      if (status && status !== "all") {
        query.status = status;
      }
      if (customerType && customerType !== "all") {
        query.customerType = customerType;
      }

      if (search && search.trim()) {
        const searchRegex = new RegExp(search.trim(), "i");
        query.$or = [
          { fullName: searchRegex },
          { phone: searchRegex },
          { passportNumber: searchRegex },
          { nidNumber: searchRegex },
          { customerCode: searchRegex },
          { email: searchRegex },
        ];
      }

      const totalCount = await Customer.countDocuments(query);
      const customers = await Customer.find(query)
        .populate("applications", "applicationNo serviceType status dateReceived payment")
        .populate("visaSubmissions", "trackingNo visaType status submissionDate")
        .populate("passportSubmissions", "trackingNo passportType status submissionDate")
        .populate("candidateCases", "fileNumber candidateName destinationCountry tradeSkill workflowStatus")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const totalPages = Math.ceil(totalCount / limit) || 1;

      return res.status(200).json({
        status: "success",
        success: true,
        data: customers,
        pagination: {
          skip,
          limit,
          totalCount,
          page,
          totalPages,
          hasNextPage: skip + customers.length < totalCount,
          hasPrevPage: skip > 0,
        },
      });
    } catch (err) {
      console.error("CustomerController.getAll error:", err);
      return res.status(500).json({
        status: "error",
        success: false,
        message: err.message || "Failed to fetch customers.",
      });
    }
  }

  // GET /api/v1/customers/:id
  async getById(req, res) {
    try {
      const customer = await Customer.findOne({ _id: req.params.id, isActive: { $ne: false } })
        .populate("applications")
        .populate("visaSubmissions")
        .populate("passportSubmissions")
        .populate("candidateCases")
        .populate("agreements")
        .populate("invoices");

      if (!customer) {
        return res.status(404).json({
          status: "fail",
          success: false,
          message: "Customer not found.",
        });
      }

      return res.status(200).json({
        status: "success",
        success: true,
        data: customer,
      });
    } catch (err) {
      console.error("CustomerController.getById error:", err);
      return res.status(500).json({
        status: "error",
        success: false,
        message: err.message || "Failed to fetch customer profile.",
      });
    }
  }

  // POST /api/v1/customers
  async create(req, res) {
    try {
      const customerData = {
        ...req.body,
        createdBy: req.user?._id || req.user?.id || null,
      };

      const customer = await Customer.create(customerData);

      return res.status(201).json({
        status: "success",
        success: true,
        data: customer,
        message: "Customer profile created successfully.",
      });
    } catch (err) {
      console.error("CustomerController.create error:", err);
      return res.status(400).json({
        status: "error",
        success: false,
        message: err.message || "Failed to create customer.",
      });
    }
  }

  // PUT /api/v1/customers/:id
  async update(req, res) {
    try {
      const customer = await Customer.findByIdAndUpdate(
        req.params.id,
        {
          ...req.body,
          updatedBy: req.user?._id || req.user?.id || null,
        },
        { new: true, runValidators: true }
      );

      if (!customer) {
        return res.status(404).json({
          status: "fail",
          success: false,
          message: "Customer not found.",
        });
      }

      return res.status(200).json({
        status: "success",
        success: true,
        data: customer,
        message: "Customer updated successfully.",
      });
    } catch (err) {
      console.error("CustomerController.update error:", err);
      return res.status(400).json({
        status: "error",
        success: false,
        message: err.message || "Failed to update customer.",
      });
    }
  }

  // DELETE /api/v1/customers/:id
  async delete(req, res) {
    try {
      const customer = await Customer.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );
      if (!customer) {
        return res.status(404).json({
          status: "fail",
          success: false,
          message: "Customer not found.",
        });
      }

      return res.status(200).json({
        status: "success",
        success: true,
        message: "Customer profile deleted successfully.",
      });
    } catch (err) {
      console.error("CustomerController.delete error:", err);
      return res.status(500).json({
        status: "error",
        success: false,
        message: err.message || "Failed to delete customer.",
      });
    }
  }

  // Quick lookup by passport, phone or NID
  // GET /api/v1/customers/lookup?query=...
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

      const customers = await Customer.find({
        isActive: { $ne: false },
        $or: [
          { passportNumber: q.toUpperCase() },
          { phone: regex },
          { nidNumber: regex },
          { customerCode: regex },
          { fullName: regex },
        ],
      })
        .select("customerCode fullName phone passportNumber nidNumber fatherName motherName guardian attachments")
        .limit(10);

      return res.status(200).json({
        status: "success",
        success: true,
        data: customers,
      });
    } catch (err) {
      console.error("CustomerController.lookup error:", err);
      return res.status(500).json({
        status: "error",
        success: false,
        message: err.message || "Failed to lookup customer.",
      });
    }
  }
}

export default new CustomerController();
