import { connectDatabase, closeDatabase } from "../src/database/index.js";
import { UserModel } from "../src/models/user.model.js";
import { comparePassword } from "../src/utils/password.js";

async function dumpUsers() {
  await connectDatabase();
  try {
    const users = await UserModel.find({}).select("+passwordHash");
    console.log(`Found ${users.length} users in database:`);
    for (const u of users) {
      const match11223345 = u.passwordHash ? await comparePassword("11223345", u.passwordHash) : false;
      console.log(`- Email: "${u.email}" | Name: "${u.name}" | Role: ${u.role} | Password 11223345 match: ${match11223345}`);
    }
  } catch (err) {
    console.error("Dump error:", err);
  } finally {
    await closeDatabase();
  }
}

dumpUsers();
