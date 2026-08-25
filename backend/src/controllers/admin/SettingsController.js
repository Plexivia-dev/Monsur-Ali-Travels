import nodemailer from "nodemailer";
import { UserModel } from "../../models/user.model.js";
import { EmployeeModel } from "../../models/employee.model.js";
import { hashPassword } from "../../utils/password.js";
import { generateDid } from "../../utils/generateDid.js";
import { env } from "../../config/env.js";

async function sendStaffInvitationEmail({ toEmail, name, subRole, tempPassword }) {
  if (!env.SMTP_USER || !env.SMTP_PASSWORD) {
    console.warn("SMTP credentials not configured, skipping invitation email delivery");
    return { delivered: false, reason: "SMTP not configured" };
  }

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST || "smtp.gmail.com",
    port: Number(env.SMTP_PORT) || 465,
    secure: String(env.SMTP_ENCRYPTION || "ssl").toLowerCase() === "ssl" || Number(env.SMTP_PORT) === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
    },
  });

  const fromName = env.SMTP_FROM_NAME || "Monsur Ali Travels";
  const fromEmail = env.SMTP_FROM || env.SMTP_USER;
  const loginUrl = env.CLIENT_URL || env.ADMIN_URL || "https://monsuralitravels.com/login";

  const subject = `Welcome to Monsur Ali Travels ERP - Staff Invitation (${subRole.replace('_', ' ')})`;
  const text = `Hello ${name},\n\nYou have been invited to join the Monsur Ali Travels team as ${subRole.replace('_', ' ')}.\n\nLogin Portal: ${loginUrl}\nEmail: ${toEmail}\nTemporary Password: ${tempPassword}\n\nPlease login and change your password upon first access.\n\nThank you,\nMonsur Ali Travels Administration`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #0284c7; margin: 0;">Monsur Ali Travels</h2>
        <p style="color: #6b7280; font-size: 14px; margin-top: 4px;">Staff Invitation & System Access</p>
      </div>
      <p style="font-size: 16px; color: #1f2937;">Hello <strong>${name}</strong>,</p>
      <p style="color: #4b5563; line-height: 1.6;">You have been invited to join the Monsur Ali Travels ERP system as <strong>${subRole.replace('_', ' ')}</strong>.</p>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0; color: #334155; font-size: 14px;"><strong>Login Portal:</strong> <a href="${loginUrl}" style="color: #0284c7;">${loginUrl}</a></p>
        <p style="margin: 0 0 8px 0; color: #334155; font-size: 14px;"><strong>Email:</strong> ${toEmail}</p>
        <p style="margin: 0; color: #334155; font-size: 14px;"><strong>Temporary Password:</strong> <code style="background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-weight: bold; color: #0f172a;">${tempPassword}</code></p>
      </div>
      <p style="color: #64748b; font-size: 13px;">Please log in using your temporary credentials and update your password immediately upon first access.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">© ${new Date().getFullYear()} Monsur Ali Travels. All rights reserved.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: toEmail,
      subject,
      text,
      html,
    });
    return { delivered: true };
  } catch (error) {
    console.error("Staff invitation email delivery error:", error);
    return { delivered: false, reason: error.message };
  }
}

// GET /api/v1/admin/settings/core-team
export const getCoreTeam = async (req, res, next) => {
  try {
    const users = await UserModel.find({ 
      role: "Staff", 
      subRole: { $exists: true, $ne: null } 
    }).select("name email did phone role subRole status isActive").lean();

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

// GET /api/v1/admin/settings/staff-clients
export const getStaffClients = async (req, res, next) => {
  try {
    // Get staff members who do NOT have a subRole assigned currently
    const clients = await UserModel.find({
      role: "Staff",
      $or: [
        { subRole: { $exists: false } },
        { subRole: null },
        { subRole: "" }
      ]
    }).select("name email did phone status isActive").lean();

    res.json({ success: true, data: clients });
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

    // Update new client
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
    const existingUser = await UserModel.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "A user with this email already exists" });
    }

    // Clear existing role assignment if any
    await UserModel.updateMany({ subRole }, { $unset: { subRole: "" } });

    // Create user with temporary password "Welcome123!" and status "Invited"
    const tempPassword = "Welcome123!";
    const hashedPassword = await hashPassword(tempPassword);
    
    const userDid = generateDid();
    const empDid = generateDid();
    const codeNum = Math.floor(1000 + Math.random() * 9000);

    const newUser = await UserModel.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: "01700000000", // placeholder phone
      passwordHash: hashedPassword,
      did: userDid,
      role: "Staff",
      subRole,
      status: "Invited",
      employeeDid: empDid,
      isActive: true
    });

    const newEmployee = await EmployeeModel.create({
      did: empDid,
      userDid: userDid,
      fullName: name.trim(),
      email: email.toLowerCase().trim(),
      phone: "01700000000",
      employeeCode: `EMP-${codeNum}`,
      designation: subRole,
      department: "Core Team",
      accessLevel: "Full_Staff"
    });

    // Asynchronously send invitation email
    const emailResult = await sendStaffInvitationEmail({
      toEmail: email.toLowerCase().trim(),
      name: name.trim(),
      subRole,
      tempPassword
    });

    res.json({ 
      success: true, 
      status: "success",
      message: emailResult.delivered 
        ? `Invitation email sent successfully to ${email}. Default temporary password: ${tempPassword}`
        : `User invited successfully with status 'Invited'. Default temporary password: ${tempPassword}`, 
      data: { user: newUser, employee: newEmployee, emailDelivered: emailResult.delivered } 
    });
  } catch (error) {
    next(error);
  }
};
