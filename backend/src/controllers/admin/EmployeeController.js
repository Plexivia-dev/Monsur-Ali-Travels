import { EmployeeModel } from "../../models/employee.model.js";
import { generateDid } from "../../utils/generateDid.js";

// List all employees with pagination and filters
export const listEmployees = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = req.query.limit !== undefined ? Math.max(1, parseInt(req.query.limit, 10) || 10) : 10;
    const skip = req.query.skip !== undefined ? Math.max(0, parseInt(req.query.skip, 10)) : (page - 1) * limit;
    const { search, status, department, designation } = req.query;

    const query = {};
    if (status && status !== "all") query.status = status;
    if (department && department !== "all") query.department = department;
    if (designation && designation !== "all") query.designation = designation;

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { fullName: searchRegex },
        { phone: searchRegex },
        { email: searchRegex },
        { employeeCode: searchRegex },
        { designation: searchRegex },
        { department: searchRegex },
      ];
    }

    const totalCount = await EmployeeModel.countDocuments(query);
    const employees = await EmployeeModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(totalCount / limit) || 1;

    return res.status(200).json({
      status: "success",
      success: true,
      data: employees,
      pagination: {
        skip,
        limit,
        totalCount,
        page,
        totalPages,
        hasNextPage: skip + employees.length < totalCount,
        hasPrevPage: skip > 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get single employee by ID or DID
export const getEmployeeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { $or: [{ _id: id }, { did: id }] } : { did: id };
    const employee = await EmployeeModel.findOne(query).lean();
    if (!employee) return res.status(404).json({ status: "error", message: "Employee not found" });
    res.json({ status: "success", success: true, data: employee });
  } catch (error) {
    next(error);
  }
};

// Create new employee
export const createEmployee = async (req, res, next) => {
  try {
    const payload = req.body ?? {};
    if (!payload.fullName?.trim() || !payload.phone?.trim() || !payload.designation?.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Full Name, Phone number, and Designation are required.",
      });
    }

    const num = Math.floor(1000 + Math.random() * 9000);
    const employeeCode = payload.employeeCode || `EMP-${num}`;

    const employee = await EmployeeModel.create({
      did: generateDid(),
      employeeCode,
      fullName: payload.fullName.trim(),
      phone: payload.phone.trim(),
      email: payload.email ? payload.email.toLowerCase().trim() : undefined,
      designation: payload.designation.trim(),
      department: payload.department ? payload.department.trim() : "General",
      joiningDate: payload.joiningDate ? new Date(payload.joiningDate) : new Date(),
      baseSalary: Number(payload.baseSalary) || 0,
      accessLevel: payload.accessLevel || "Level_1",
      status: payload.status || "Active",
      createdByDid: req.user?.did || null,
    });

    res.status(201).json({ status: "success", success: true, data: employee });
  } catch (error) {
    next(error);
  }
};

// Update employee
export const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { $or: [{ _id: id }, { did: id }] } : { did: id };
    const payload = req.body ?? {};

    delete payload._id;
    delete payload.did;

    if (payload.joiningDate) payload.joiningDate = new Date(payload.joiningDate);
    if (payload.baseSalary !== undefined) payload.baseSalary = Number(payload.baseSalary) || 0;
    payload.updatedByDid = req.user?.did || null;

    const updated = await EmployeeModel.findOneAndUpdate(query, payload, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) return res.status(404).json({ status: "error", message: "Employee not found" });

    res.json({ status: "success", success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// Delete employee
export const deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { $or: [{ _id: id }, { did: id }] } : { did: id };

    const deleted = await EmployeeModel.findOneAndDelete(query).lean();
    if (!deleted) return res.status(404).json({ status: "error", message: "Employee not found" });

    res.json({ status: "success", success: true, message: `Employee "${deleted.fullName}" deleted successfully.` });
  } catch (error) {
    next(error);
  }
};

