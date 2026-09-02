import mongoose from "mongoose";
import { ClientCaseFileModel } from "../../models/clientCaseFile.model.js";
import { logger } from "../../config/logger.js";

// GET /clients - List all client case files
export const getClients = async (req, res, next) => {
  try {
    const { search, workflowType, country, status } = req.query;

    const query = { isActive: true };

    if (workflowType && workflowType !== "all") {
      query.workflowType = workflowType;
    }

    if (country) {
      query.destinationCountry = new RegExp(country, "i");
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { clientName: searchRegex },
        { fileNumber: searchRegex },
        { passportNumber: searchRegex },
        { tradeSkill: searchRegex },
        { destinationCountry: searchRegex },
      ];
    }

    const clients = await ClientCaseFileModel.find(query).sort({ createdAt: -1 });

    res.json({
      status: "success",
      results: clients.length,
      data: clients,
    });
  } catch (err) {
    next(err);
  }
};

// GET /clients/:id - Get single client by ID or fileNumber
export const getClientById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const client = await ClientCaseFileModel.findOne({
      $or: [{ _id: mongoose.isValidObjectId(id) ? id : null }, { fileNumber: id }],
      isActive: true,
    });

    if (!client) {
      return res.status(404).json({ status: "error", message: "Client Case File not found" });
    }

    res.json({
      status: "success",
      data: client,
    });
  } catch (err) {
    next(err);
  }
};

// POST /clients - Create new client case file
export const createClient = async (req, res, next) => {
  try {
    const body = req.body ?? {};

    if (!body.clientName || !body.passportNumber) {
      return res.status(400).json({
        status: "error",
        message: "Client Name and Passport Number are required.",
      });
    }

    const fileNumber = body.fileNumber || `MP-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const defaultSteps = [
      { id: 1, title: "Client Profiling", status: "completed", targetDays: 7, description: "Skill verification & passport intake" },
      { id: 2, title: "Client Selection", status: "in_progress", targetDays: 10, description: "CV submission & job offer signed" },
      { id: 3, title: "Medical & Police Clearance", status: "pending", targetDays: 14, description: "GAMCA medical & PCC attestation" },
      { id: 4, title: "Visa Stamping", status: "pending", targetDays: 18, description: "Embassy attestation & work permit" },
      { id: 5, title: "Flight & Deployment", status: "pending", targetDays: 5, description: "Ticket issue & airport reception" },
    ];

    const defaultDocs = [
      {
        id: `doc-${Date.now()}-1`,
        name: "Original Passport",
        type: "passport",
        fileName: `${body.passportNumber}_passport.pdf`,
        fileSize: "2.5 MB",
        uploadedAt: new Date().toISOString().split("T")[0],
        status: "verified",
      },
    ];

    const client = await ClientCaseFileModel.create({
      fileNumber,
      clientName: body.clientName.trim(),
      clientAge: Number(body.clientAge) || 28,
      clientGender: body.clientGender || "Male",
      clientPhone: body.clientPhone || "",
      clientEmail: body.clientEmail || "",
      passportNumber: body.passportNumber.trim(),
      passportExpiry: body.passportExpiry || "",
      tradeSkill: body.tradeSkill || "General Technician",
      experienceYears: Number(body.experienceYears) || 4,
      destinationCountry: body.destinationCountry || "Saudi Arabia",
      destinationCountryCode: body.destinationCountryCode || "SA",
      destinationCity: body.destinationCity || "Riyadh",
      workflowType: body.workflowType || "destination_partner",
      client: body.client || {},
      destinationAgency: body.destinationAgency || {},
      localAgency: body.localAgency || {},
      currentStepId: body.currentStepId || 1,
      steps: body.steps?.length ? body.steps : defaultSteps,
      documents: body.documents?.length ? body.documents : defaultDocs,
      casePriority: body.casePriority || "normal",
      expectedDeploymentDate: body.expectedDeploymentDate || "2026-10-01",
      internalNotes: body.internalNotes || "Newly created client file.",
    });

    logger.info({ clientId: client._id, fileNumber: client.fileNumber }, "Created Client Case File");

    res.status(201).json({
      status: "success",
      message: "Client Case File created successfully",
      data: client,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        status: "error",
        message: "A client case file with this passport or file number already exists.",
      });
    }
    next(err);
  }
};

// PUT /clients/:id - Update client case file
export const updateClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body ?? {};

    const client = await ClientCaseFileModel.findOneAndUpdate(
      { $or: [{ _id: mongoose.isValidObjectId(id) ? id : null }, { did: id }, { fileNumber: id }] },
      body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!client) {
      return res.status(404).json({ status: "error", message: "Client Case File not found" });
    }

    res.json({
      status: "success",
      message: "Client Case File updated successfully",
      data: client,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /clients/:id - Delete client case file (soft delete)
export const deleteClient = async (req, res, next) => {
  try {
    const { id } = req.params;

    const client = await ClientCaseFileModel.findOneAndUpdate(
      { $or: [{ _id: mongoose.isValidObjectId(id) ? id : null }, { did: id }, { fileNumber: id }] },
      { isActive: false },
      { new: true }
    );

    if (!client) {
      return res.status(404).json({ status: "error", message: "Client Case File not found" });
    }

    res.json({
      status: "success",
      message: "Client Case File deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /clients/:id/status - Update client status
export const updateClientStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const client = await ClientCaseFileModel.findOneAndUpdate(
      { $or: [{ _id: mongoose.isValidObjectId(id) ? id : null }, { did: id }, { fileNumber: id }] },
      { status },
      { new: true, runValidators: true }
    );

    if (!client) {
      return res.status(404).json({ status: "error", message: "Client not found" });
    }

    res.json({
      status: "success",
      message: "Client status updated",
      data: client,
    });
  } catch (err) {
    next(err);
  }
};
