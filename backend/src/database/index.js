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
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err.message);
    console.warn("⚠️ Continuing server startup in offline/dev fallback mode...");
  }
}

export async function closeDatabase() {
  console.log("Closing MongoDB connection...");
  await mongoose.disconnect();
  console.log("MongoDB connection closed.");
}
