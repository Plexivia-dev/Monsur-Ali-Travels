import { connectDatabase, closeDatabase } from "../src/database/index.js";
import { UserModel } from "../src/models/user.model.js";
import { hashPassword } from "../src/utils/password.js";

const owner_Data = [
	{
		email: "ihkhan997@gmail.com",
		name: "মিস্টার ডেভেলপার",
		password: "11223345",
		phone: "+8801700000097",
		role: "Owner",
	},
	{
		email: "mr.monsur1988@gmail.com",
		name: "মিস্টার মনসুর",
		password: "11223345",
		phone: "+8801700001988",
		role: "Owner",
	},
	{
		email: "ahmedsabit3232@gmail.com",
		name: "Ahmed Sabit",
		password: "dec@Ntr3",
		phone: "+8801710000001",
		role: "Admin",
	},
	{
		email: "saadazad97@gmail.com",
		name: "Saad Azad",
		password: "dec@Ntr3",
		phone: "+8801710000002",
		role: "Owner",
	},
  {
    email: "monsuralitravels.store@gmail.com",
    name: "Monsur Ali Travels Office",
    password: "dec@Ntr3",
    phone: "+8801710000003",
    role: "Admin",  
  }
];

const createOwners = async () => {
  await connectDatabase();
  try {
    for (const entry of owner_Data) {
      const { email, name, password, role, phone } = entry;
      if (!email || !name || !password) {
        console.warn(`Skipping entry, missing required fields: ${JSON.stringify(entry)}`);
        continue;
      }

      try {
        const passwordHash = await hashPassword(password);
        const existing = await UserModel.findOne({ email: email.toLowerCase().trim() });
        if (existing) {
          existing.role = role || existing.role;
          existing.passwordHash = passwordHash;
          existing.isActive = true;
          existing.phone = phone || existing.phone;
          await existing.save();
          console.log(`✅ Updated existing user ${email} (role=${existing.role}).`);
          continue;
        }

        const user = await UserModel.create({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          passwordHash,
          role: role || 'Owner',
          phone: phone || '',
          isActive: true,
        });

        console.log(`✅ Owner created: ${user.email} (id=${user.id})`);
      } catch (innerErr) {
        console.error(`❌ Failed for ${entry.email}:`, innerErr.message || innerErr);
      }
    }
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    process.exitCode = 1;
  } finally {
    await closeDatabase();
  }
};

createOwners();
