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
        name: "Front Desk",
        email: "mdikr4m01@gmail.com",
        passwordHash,
        role: "Staff",
        subRole: "Frontdesk",
        phone: "01700000001"
      },
      {
        name: "Mr Accountant",
        email: "md.ikr4m@gmail.com",
        passwordHash,
        role: "Staff",
        subRole: "Accountant",
        phone: "01700000002"
      },
      {
        name: "Mr Dev",
        email: "ihkhan2027@gmail.com",
        passwordHash,
        role: "Owner",
        phone: "01700000003"
      }
    ];

    for (const u of usersToCreate) {
      await UserModel.deleteOne({ email: u.email });
      const user = new UserModel(u);
      await user.save();
      console.log(`Created user: ${user.name} (${user.email}) -> Role: ${user.role} ${user.subRole || ""}`);
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
