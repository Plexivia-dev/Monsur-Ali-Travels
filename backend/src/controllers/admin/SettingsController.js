import { UserModel } from "../../models/user.model.js";
import { EmployeeModel } from "../../models/employee.model.js";
import { hashPassword } from "../../utils/password.js";
import { generateDid } from "../../utils/generateDid.js";

// GET /api/v1/admin/settings/core-team
export const getCoreTeam = async (req, res, next) => {
  try {
    const users = await UserModel.find({ 
      role: "Staff", 
      subRole: { $exists: true, $ne: null } 
    }).select("name email did phone role subRole").lean();

    // Map into role -> user object
    const coreTeamMap = {};
    users.forEach(user => {
      if (user.subRole) {
        coreTeamMap[user.subRole] = user;
      }
    });

    res.json({ success: true, data: coreTeamMap });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/admin/settings/staff-candidates
export const getStaffCandidates = async (req, res, next) => {
  try {
    // Get staff members who do NOT have a subRole assigned currently
    const candidates = await UserModel.find({
      role: "Staff",
      $or: [
        { subRole: { $exists: false } },
        { subRole: null },
        { subRole: "" }
      ]
    }).select("name email did phone").lean();

    res.json({ success: true, data: candidates });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/admin/settings/core-team/assign
export const assignCoreTeamRole = async (req, res, next) => {
  try {
    const { did, subRole } = req.body;
    if (!did || !subRole) {
      return res.status(400).json({ success: false, message: "User DID and subRole are required" });
    }

    // First remove existing assignment of this subRole (since only one person can hold Accountant, etc.)
    await UserModel.updateMany({ subRole }, { $unset: { subRole: "" } });

    // Update new candidate
    const user = await UserModel.findOneAndUpdate(
      { did },
      { role: "Staff", subRole },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Ensure Employee record exists for this user
    let employee = await EmployeeModel.findOne({ userDid: did });
    if (!employee) {
      const codeNum = Math.floor(1000 + Math.random() * 9000);
      employee = await EmployeeModel.create({
        fullName: user.name,
        email: user.email,
        phone: user.phone || "N/A",
        userDid: user.did,
        employeeCode: `EMP-${codeNum}`,
        designation: subRole,
        department: "Core Team",
        accessLevel: "Full_Staff"
      });
      
      user.employeeDid = employee.did;
      await user.save();
    } else {
      // Update existing Employee record designation/department
      employee.designation = subRole;
      employee.department = "Core Team";
      await employee.save();
    }

    res.json({ success: true, message: "Role assigned successfully", data: user });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/admin/settings/core-team/remove
export const removeCoreTeamRole = async (req, res, next) => {
  try {
    const { did } = req.body;
    if (!did) {
      return res.status(400).json({ success: false, message: "User DID is required" });
    }

    const user = await UserModel.findOneAndUpdate(
      { did },
      { $unset: { subRole: "" } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update Employee record if it exists
    await EmployeeModel.findOneAndUpdate(
      { userDid: did },
      { designation: "General Staff", department: "General" }
    );

    res.json({ success: true, message: "Role removed successfully", data: user });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/admin/settings/core-team/invite
export const inviteCoreTeamUser = async (req, res, next) => {
  try {
    const { name, email, subRole } = req.body;
    if (!name || !email || !subRole) {
      return res.status(400).json({ success: false, message: "Name, email and subRole are required" });
    }

    // Check if email already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "A user with this email already exists" });
    }

    // Clear existing role assignment if any
    await UserModel.updateMany({ subRole }, { $unset: { subRole: "" } });

    // Create user with temporary password "Welcome123!"
    const tempPassword = "Welcome123!";
    const hashedPassword = await hashPassword(tempPassword);
    
    const userDid = generateDid();
    const empDid = generateDid();
    const codeNum = Math.floor(1000 + Math.random() * 9000);

    const newUser = await UserModel.create({
      name,
      email,
      phone: "01700000000", // placeholder phone
      passwordHash: hashedPassword,
      did: userDid,
      role: "Staff",
      subRole,
      employeeDid: empDid,
      isActive: true
    });

    const newEmployee = await EmployeeModel.create({
      did: empDid,
      userDid: userDid,
      fullName: name,
      email,
      phone: "01700000000",
      employeeCode: `EMP-${codeNum}`,
      designation: subRole,
      department: "Core Team",
      accessLevel: "Full_Staff"
    });

    res.json({ 
      success: true, 
      message: "User invited successfully. Default password is 'Welcome123!'", 
      data: { user: newUser, employee: newEmployee } 
    });
  } catch (error) {
    next(error);
  }
};
