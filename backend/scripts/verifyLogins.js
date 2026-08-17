import { connectDatabase, closeDatabase } from "../src/database/index.js";
import { UserModel } from "../src/models/user.model.js";
import { comparePassword } from "../src/utils/password.js";

async function verifyLogins() {
  await connectDatabase();
  try {
    const emails = ["ihkhan997@gmail.com", "mr.monsur1988@gmail.com"];
    for (const email of emails) {
      const user = await UserModel.findOne({ email }).select("+passwordHash");
      if (!user) {
        console.log(`❌ User not found: ${email}`);
        continue;
      }
      const match = await comparePassword("11223345", user.passwordHash);
      console.log(`✅ User verified: ${user.email} | Name: "${user.name}" | Role: ${user.role} | Password Valid: ${match}`);
    }
  } catch (err) {
    console.error("Verification error:", err);
  } finally {
    await closeDatabase();
  }
}

verifyLogins();
