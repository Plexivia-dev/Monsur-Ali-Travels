import mongoose from "mongoose";
import dotenv from "dotenv";
import { UserModel } from "./src/models/user.model.js";
import { hashPassword } from "./src/utils/password.js";

dotenv.config();

const run = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI not found in env");
    }
    await mongoose.connect(uri);
    console.log("Connected to MongoDB.");

    const staffPassHash = await hashPassword("P@ss026##");
    const ownerPassHash = await hashPassword("11223345");

    const usersToCreate = [
      // 1. Existing Root Owners & Staff
      {
        name: "Md Ikram",
        email: "md.ikr4m@gmail.com",
        passwordHash: ownerPassHash,
        role: "Owner",
        designation: "System Architect / Founder",
        department: "Executive Management",
        phone: "01784220265",
        status: "Active",
        isActive: true,
      },
      {
        name: "Monsur Ali",
        email: "mr.monsur1988@gmail.com",
        passwordHash: ownerPassHash,
        role: "Owner",
        designation: "Chairman & Founder",
        department: "Executive Management",
        phone: "01345678902",
        status: "Active",
        isActive: true,
      },
      {
        name: "IH Khan",
        email: "ihkhan2027@gmail.com",
        passwordHash: ownerPassHash,
        role: "Staff",
        subRole: "Frontdesk",
        designation: "Front Desk Officer",
        department: "Front Desk",
        phone: "01608098281",
        status: "Active",
        isActive: true,
      },

      // 2. The 6 Monsur Ali Travels Team Members
      {
        name: "Md Hakimul Islam Nasim",
        email: "nasim@monsuralitravels.com",
        passwordHash: staffPassHash,
        role: "Manager",
        designation: "Managing Director",
        department: "Executive Management",
        phone: "01700000001",
        status: "Active",
        isActive: true,
      },
      {
        name: "Koyes Ahmed",
        email: "ahmed@monsuralitravels.com",
        passwordHash: staffPassHash,
        role: "Staff",
        subRole: "Representative",
        designation: "Project Manager / Representative",
        department: "Project Management",
        phone: "01700000002",
        status: "Active",
        isActive: true,
      },
      {
        name: "Toiyoba Yeasmin Ruma",
        email: "toiyoba@monsuralitravels.com",
        passwordHash: staffPassHash,
        role: "Staff",
        subRole: "Visa_Processor",
        designation: "Indian File Tracking",
        department: "Visa Processing",
        phone: "01700000003",
        status: "Active",
        isActive: true,
      },
      {
        name: "Habiba Begum",
        email: "habiba@monsuralitravels.com",
        passwordHash: staffPassHash,
        role: "Staff",
        subRole: "Frontdesk",
        designation: "Help desk or information",
        department: "Frontdesk & Support",
        phone: "01700000004",
        status: "Active",
        isActive: true,
      },
      {
        name: "Mst Fatema Akter",
        email: "fatema@monsuralitravels.com",
        passwordHash: staffPassHash,
        role: "Staff",
        subRole: "ClientManager",
        designation: "Work Permit Tracking / Client Manager",
        department: "Client Operations",
        phone: "01700000005",
        status: "Active",
        isActive: true,
      },
      {
        name: "Mst Alpona Begum",
        email: "alpona@monsuralitravels.com",
        passwordHash: staffPassHash,
        role: "Staff",
        subRole: "Accountant",
        designation: "Accountant & Financial",
        department: "Accounts & Finance",
        phone: "01700000006",
        status: "Active",
        isActive: true,
      },
    ];

    for (const u of usersToCreate) {
      await UserModel.deleteOne({ email: u.email });
      const user = new UserModel(u);
      await user.save();
      console.log(
        `✓ Created user: ${user.name} (${user.email}) -> Role: [${user.role}] SubRole: [${user.subRole || "—"}] Designation: [${user.designation || "—"}]`
      );
    }

    console.log("\nAll 9 users created / synchronized successfully!");
  } catch (error) {
    console.error("Error creating users:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
};

run();
