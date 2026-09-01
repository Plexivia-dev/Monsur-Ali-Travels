import mongoose from "mongoose";
import { env } from "../config/env.js";

const { ServerApiVersion } = mongoose.mongo;

export async function connectDatabase() {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  console.log("Attempting MongoDB connection...");
  try {
    const isAtlas = env.MONGODB_URI.includes("mongodb+srv");
    const options = {
      dbName: env.MONGODB_DB_NAME,
      ...(isAtlas
        ? {
            serverApi: {
              version: ServerApiVersion.v1,
              strict: true,
              deprecationErrors: true,
            },
          }
        : {}),
      serverSelectionTimeoutMS: 5000,
    };
    await mongoose.connect(env.MONGODB_URI, options);
    console.log("✅ Connected to MongoDB");
    await ensureDefaultOwner();
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err.message);
    console.warn("⚠️ Continuing server startup in offline/dev fallback mode...");
  }
}

async function ensureDefaultOwner() {
  try {
    const { UserModel } = await import("../models/user.model.js");
    const { hashPassword } = await import("../utils/password.js");
    const { generateDid } = await import("../utils/generateDid.js");

    // Remove legacy ikramul.web@gmail.com if present
    await UserModel.deleteMany({ email: "ikramul.web@gmail.com" });

    // Ensure mr.monsur1988@gmail.com is Owner
    const existing = await UserModel.findOne({ email: "mr.monsur1988@gmail.com" });
    if (existing) {
      if (existing.role !== "Owner" || !existing.isActive) {
        existing.role = "Owner";
        existing.isActive = true;
        existing.status = "Active";
        await existing.save();
        console.log("👑 Owner role synced for mr.monsur1988@gmail.com");
      }
    } else {
      const passwordHash = await hashPassword("11223345");
      await UserModel.create({
        name: "MD MONSUR ALI",
        email: "mr.monsur1988@gmail.com",
        passwordHash,
        phone: "+8801345579534",
        role: "Owner",
        isActive: true,
        status: "Active",
        department: "Management",
        designation: "Managing Director & Owner",
        did: generateDid(),
      });
      console.log("👑 Owner user initialized: mr.monsur1988@gmail.com");
    }
  } catch (seedErr) {
    console.warn("Owner initialization notice:", seedErr.message);
  }
}

export async function closeDatabase() {
  console.log("Closing MongoDB connection...");
  await mongoose.disconnect();
  console.log("MongoDB connection closed.");
}
