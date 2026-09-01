import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/monsur-ali-travels';

async function main() {
  console.log('Connecting to MongoDB:', uri);
  await mongoose.connect(uri);
  console.log('Connected to MongoDB successfully.');

  const db = mongoose.connection.db;
  const usersCollection = db.collection('users');

  const allUsers = await usersCollection.find({}).toArray();
  console.log('Current users before update:');
  allUsers.forEach(u => {
    console.log(`- [${u._id}] email: ${u.email}, name: ${u.name}, role: ${u.role}, status: ${u.status}`);
  });

  const ikramUser = await usersCollection.findOne({ email: 'ikramul.web@gmail.com' });
  const existingMonsur = await usersCollection.findOne({ email: 'mr.monsur1988@gmail.com' });

  let passwordHashToUse = '';
  if (ikramUser && ikramUser.passwordHash) {
    passwordHashToUse = ikramUser.passwordHash;
  } else {
    passwordHashToUse = await bcrypt.hash('Monsur@1988', 10);
  }

  if (existingMonsur) {
    console.log('Found existing user for mr.monsur1988@gmail.com. Promoting to Owner...');
    await usersCollection.updateOne(
      { _id: existingMonsur._id },
      {
        $set: {
          role: 'Owner',
          status: 'Active',
          isActive: true,
          updatedAt: new Date()
        },
        $unset: {
          subRole: ''
        }
      }
    );
  } else {
    console.log('Creating new Owner user for mr.monsur1988@gmail.com...');
    await usersCollection.insertOne({
      name: ikramUser?.name || 'MD MONSUR ALI',
      email: 'mr.monsur1988@gmail.com',
      phone: ikramUser?.phone || '+8801345579534',
      role: 'Owner',
      passwordHash: passwordHashToUse,
      status: 'Active',
      isActive: true,
      department: 'Management',
      designation: 'Managing Director & Owner',
      avatar: ikramUser?.avatar || '',
      bio: 'Owner of Monsur Ali Tours & Travels',
      did: `did:mat:user:${Date.now().toString(36)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  // Remove ikramul.web@gmail.com
  const deleteResult = await usersCollection.deleteMany({ email: 'ikramul.web@gmail.com' });
  console.log(`Deleted ikramul.web@gmail.com count: ${deleteResult.deletedCount}`);

  // Also check employees collection if any
  const employeesCollection = db.collection('employees');
  const empDelete = await employeesCollection.deleteMany({ email: 'ikramul.web@gmail.com' });
  console.log(`Deleted from employees collection count: ${empDelete.deletedCount}`);

  const updatedUsers = await usersCollection.find({}).toArray();
  console.log('\nUsers after update:');
  updatedUsers.forEach(u => {
    console.log(`- [${u._id}] email: ${u.email}, name: ${u.name}, role: ${u.role}, status: ${u.status}`);
  });

  await mongoose.disconnect();
  console.log('Done.');
  process.exit(0);
}

main().catch(err => {
  console.error('Error running updateOwner script:', err);
  process.exit(1);
});
