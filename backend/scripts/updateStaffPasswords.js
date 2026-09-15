import { connectDatabase, closeDatabase } from "../src/database/index.js";
import { UserModel } from "../src/models/user.model.js";
import { hashPassword } from "../src/utils/password.js";

const staffList = [
  "ahmed@monsuralitravels.com",
  "toiyoba@monsuralitravels.com",
  "habiba@monsuralitravels.com",
  "fatema@monsuralitravels.com",
  "alpona@monsuralitravels.com",
  "nasim@monsuralitravels.com"
];

const newPassword = "P@ss026##";

const updateStaff = async () => {
  await connectDatabase();
  try {
    const passwordHash = await hashPassword(newPassword);
    for (const email of staffList) {
      const user = await UserModel.findOne({ email: email.toLowerCase().trim() });
      if (user) {
        user.passwordHash = passwordHash;
        user.isActive = true;
        user.status = "Active";
        user.twoFactorEnabled = false;
        await user.save();
        console.log(`✅ Updated ${email} (Role: ${user.role}, Name: ${user.name})`);
      } else {
        console.warn(`⚠️ User ${email} not found.`);
      }
    }
    console.log("\nAll staff passwords updated successfully to: " + newPassword);
  } catch (err) {
    console.error("❌ Error updating staff passwords:", err);
    process.exitCode = 1;
  } finally {
    await closeDatabase();
  }
};

updateStaff();
