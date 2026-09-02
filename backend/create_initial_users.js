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

    const passwordHash = await hashPassword("11223345");

    const usersToCreate = [
      {
        name: "Md Ikram",
        email: "md.ikr4m@gmail.com",
        passwordHash,
        role: "Owner",
        phone: "01784220265",
        status: "Active",
        isActive: true
      },
      {
        name: "IH Khan",
        email: "ihkhan2027@gmail.com",
        passwordHash,
        role: "Staff",
        subRole: "Frontdesk",
        designation: "Front Desk Officer",
        department: "Front Desk",
        phone: "01608098281",
        status: "Active",
        isActive: true
      },
      {
        name: "Monsur Ali",
        email: "mr.monsur1988@gmail.com",
        passwordHash,
        role: "Owner",
        phone: "01345678902",
        status: "Active",
        isActive: true
      }
    ];

    for (const u of usersToCreate) {
      await UserModel.deleteOne({ email: u.email });
      const user = new UserModel(u);
      await user.save();
      console.log(`✓ Created user: ${user.name} (${user.email}) -> Role: ${user.role} ${user.subRole || ""}`);
    }

    console.log("All 3 users created successfully!");
  } catch (error) {
    console.error("Error creating users:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
};

run();
