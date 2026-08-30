import mongoose from "mongoose";
import { EmploymentAgreementModel, generateUniqueAgreementId } from "../../models/employmentAgreement.model.js";
import { logger } from "../../config/logger.js";

// Helper to normalize payload into English Schema format
function mapPayloadToEnglishSchema(body = {}) {
  const mapped = {
    agreementId: body.agreementId || generateUniqueAgreementId(),
    companyInfo: {
      companyName: body.header?.companyName || body.companyInfo?.companyName || "MONSUR ALI TRAVELS",
      officeAddress: body.header?.officeAddress || body.companyInfo?.officeAddress || "Mominpur Jagannathpur Road, Sunamganj, Post Code 3060",
      phone: body.header?.phone || body.companyInfo?.phone || "+8801345579534",
      email: body.header?.email || body.companyInfo?.email || "contact@monsuralitravels.com",
    },
    parties: {
      agreementDate: body.parties?.agreementDate || "",
      nidPassport: body.parties?.nidPassport || "",
      employerName: body.parties?.employerName || "MD. IKRAMUL HOSSAIN (Managing Director)",
      employerPhone: body.parties?.employerPhone || "+8801345579534",
      employeeName: (body.parties?.employeeName || "").trim(),
      employeeEmail: body.parties?.employeeEmail || "",
      fatherHusbandName: body.parties?.fatherHusbandName || "",
      address: body.parties?.address || "",
    },
    guardian: {
      guardianName: body.guardian?.guardianName || "",
      guardianPhone: body.guardian?.guardianPhone || "",
      relationship: body.guardian?.relationship || "Father",
      emergencyPhone: body.guardian?.emergencyPhone || "",
      guardianNid: body.guardian?.guardianNid || "",
      guardianAddress: body.guardian?.guardianAddress || "",
    },
    position: {
      designation: body.position?.designation || "",
      department: body.position?.department || "",
      joiningDate: body.position?.joiningDate || "",
      location: body.position?.location || "Head Office, Nadampur",
      jobType: body.position?.jobType || "Full-Time (Permanent)",
      workSchedule: body.position?.workSchedule || "9:00 AM - 6:00 PM, Sunday to Thursday",
    },
    salary: {
      basicSalary: body.salary?.basicSalary || "0",
      houseRent: body.salary?.houseRent || "0",
      medical: body.salary?.medical || "0",
      conveyance: body.salary?.conveyance || "0",
      specialAllowance: body.salary?.specialAllowance || "0",
      grossSalary: body.salary?.grossSalary || "0",
      grossSalaryInWords: body.salary?.grossSalaryInWords || "",
    },
    leave: {
      casualDays: body.leave?.casualDays || "10",
      sickDays: body.leave?.sickDays || "14",
      earnedDays: body.leave?.earnedDays || "18",
      lunchProvided: body.leave?.lunchProvided ?? true,
      teaSnacks: body.leave?.teaSnacks ?? true,
      lunchAllowance: body.leave?.lunchAllowance || "",
    },
    witnesses: {
      firstWitness: {
        name: body.witnesses?.firstWitnessName || body.witnesses?.firstWitness?.name || "",
        phone: body.witnesses?.firstWitnessPhone || body.witnesses?.firstWitness?.phone || "",
        address: body.witnesses?.firstWitnessAddress || body.witnesses?.firstWitness?.address || "",
      },
      secondWitness: {
        name: body.witnesses?.secondWitnessName || body.witnesses?.secondWitness?.name || "",
        phone: body.witnesses?.secondWitnessPhone || body.witnesses?.secondWitness?.phone || "",
        address: body.witnesses?.secondWitnessAddress || body.witnesses?.secondWitness?.address || "",
      },
    },
    status: body.status || "active",
    isActive: true,
  };

  return mapped;
}

// GET /api/v1/docs/employment-agreement - List agreements
export const getEmploymentAgreements = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = req.query.limit !== undefined ? Math.max(1, parseInt(req.query.limit, 10) || 10) : 10;
    const skip = req.query.skip !== undefined ? Math.max(0, parseInt(req.query.skip, 10)) : (page - 1) * limit;
    const { search, status } = req.query;

    const query = { isActive: { $ne: false } };

    if (status && status !== "all") {
      query.status = status;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { agreementId: searchRegex },
        { "parties.employeeName": searchRegex },
        { "parties.nidPassport": searchRegex },
        { "parties.employeeEmail": searchRegex },
        { "position.designation": searchRegex },
      ];
    }

    const totalCount = await EmploymentAgreementModel.countDocuments(query);
    const agreements = await EmploymentAgreementModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalCount / limit) || 1;

    res.json({
      status: "success",
      success: true,
      results: agreements.length,
      data: agreements,
      pagination: {
        skip,
        limit,
        totalCount,
        page,
        totalPages,
        hasNextPage: skip + agreements.length < totalCount,
        hasPrevPage: skip > 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Helper to query agreement by either MongoDB _id, did, or agreementId
const findAgreementByIdOrCustomId = async (id, extraQuery = {}) => {
  if (!id) return null;
  const isMongoId = mongoose.isValidObjectId(id);
  const conditions = [{ did: id }, { agreementId: id }];
  if (isMongoId) conditions.push({ _id: id });
  return EmploymentAgreementModel.findOne({ $or: conditions, ...extraQuery });
};

// GET /api/v1/docs/employment-agreement/:id - Get single agreement
export const getEmploymentAgreementById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const agreement = await findAgreementByIdOrCustomId(id, { isActive: { $ne: false } });
    if (!agreement) {
      return res.status(404).json({ status: "error", message: "Employment agreement not found" });
    }

    res.json({
      status: "success",
      data: agreement,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/docs/employment-agreement - Create new agreement
export const createEmploymentAgreement = async (req, res, next) => {
  try {
    const body = req.body ?? {};
    const employeeName = body.parties?.employeeName;

    if (!employeeName || !employeeName.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Employee full name is required.",
      });
    }

    const mappedData = mapPayloadToEnglishSchema(body);
    const agreement = await EmploymentAgreementModel.create(mappedData);

    logger.info({ agreementId: agreement.agreementId, _id: agreement._id, employeeName }, "Created Employment Agreement");

    res.status(201).json({
      status: "success",
      message: "Employment agreement saved successfully.",
      data: agreement,
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/v1/docs/employment-agreement/:id - Update agreement
export const updateEmploymentAgreement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await findAgreementByIdOrCustomId(id);
    if (!existing) {
      return res.status(404).json({ status: "error", message: "Employment agreement not found" });
    }

    const body = req.body ?? {};
    const mappedData = mapPayloadToEnglishSchema(body);

    const agreement = await EmploymentAgreementModel.findOneAndUpdate(
      { _id: existing._id },
      mappedData,
      {
        new: true,
        runValidators: true,
      }
    );

    res.json({
      status: "success",
      message: "Employment agreement updated successfully.",
      data: agreement,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/docs/employment-agreement/:id - Delete agreement
export const deleteEmploymentAgreement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await findAgreementByIdOrCustomId(id);
    if (!existing) {
      return res.status(404).json({ status: "error", message: "Employment agreement not found" });
    }

    const agreement = await EmploymentAgreementModel.findOneAndUpdate(
      { _id: existing._id },
      { isActive: false },
      { new: true }
    );

    res.json({
      status: "success",
      message: "Employment agreement deleted successfully.",
    });
  } catch (err) {
    next(err);
  }
};
