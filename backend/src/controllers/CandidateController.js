import { CandidateCaseFileModel } from "../models/candidateCaseFile.model.js";
import { logger } from "../config/logger.js";

// GET /candidates - List all candidate case files
export const getCandidates = async (req, res, next) => {
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
        { candidateName: searchRegex },
        { fileNumber: searchRegex },
        { passportNumber: searchRegex },
        { tradeSkill: searchRegex },
        { destinationCountry: searchRegex },
      ];
    }

    const candidates = await CandidateCaseFileModel.find(query).sort({ createdAt: -1 });

    res.json({
      status: "success",
      results: candidates.length,
      data: candidates,
    });
  } catch (err) {
    next(err);
  }
};

// GET /candidates/:id - Get single candidate by ID or fileNumber
export const getCandidateById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const candidate = await CandidateCaseFileModel.findOne({
      $or: [{ _id: mongoose.isValidObjectId(id) ? id : null }, { fileNumber: id }],
      isActive: true,
    });

    if (!candidate) {
      return res.status(404).json({ status: "error", message: "Candidate Case File not found" });
    }

    res.json({
      status: "success",
      data: candidate,
    });
  } catch (err) {
    next(err);
  }
};

// POST /candidates - Create new candidate case file
export const createCandidate = async (req, res, next) => {
  try {
    const body = req.body ?? {};

    if (!body.candidateName || !body.passportNumber) {
      return res.status(400).json({
        status: "error",
        message: "Candidate Name and Passport Number are required.",
      });
    }

    const fileNumber = body.fileNumber || `MP-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const defaultSteps = [
      { id: 1, title: "Candidate Profiling", status: "completed", targetDays: 7, description: "Skill verification & passport intake" },
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

    const candidate = await CandidateCaseFileModel.create({
      fileNumber,
      candidateName: body.candidateName.trim(),
      candidateAge: Number(body.candidateAge) || 28,
      candidateGender: body.candidateGender || "Male",
      candidatePhone: body.candidatePhone || "",
      candidateEmail: body.candidateEmail || "",
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
      internalNotes: body.internalNotes || "Newly created candidate file.",
    });

    logger.info({ candidateId: candidate._id, fileNumber: candidate.fileNumber }, "Created Candidate Case File");

    res.status(201).json({
      status: "success",
      message: "Candidate Case File created successfully",
      data: candidate,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        status: "error",
        message: "A candidate case file with this passport or file number already exists.",
      });
    }
    next(err);
  }
};

// PUT /candidates/:id - Update candidate case file
export const updateCandidate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body ?? {};

    const candidate = await CandidateCaseFileModel.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!candidate) {
      return res.status(404).json({ status: "error", message: "Candidate Case File not found" });
    }

    res.json({
      status: "success",
      message: "Candidate Case File updated successfully",
      data: candidate,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /candidates/:id - Delete candidate case file (soft delete)
export const deleteCandidate = async (req, res, next) => {
  try {
    const { id } = req.params;

    const candidate = await CandidateCaseFileModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!candidate) {
      return res.status(404).json({ status: "error", message: "Candidate Case File not found" });
    }

    res.json({
      status: "success",
      message: "Candidate Case File deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
