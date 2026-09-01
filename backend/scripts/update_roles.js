import { connectDatabase } from './src/database/index.js';
import { UserModel } from './src/models/user.model.js';
import { hashPassword } from './src/utils/password.js';
import { generateDid } from './src/utils/generateDid.js';

async function run() {
  try {
    await connectDatabase();

    // 1. Remove ikramul.web@gmail.com from database
    const deleteIkram = await UserModel.deleteMany({ email: 'ikramul.web@gmail.com' });
    console.log('Removed ikramul.web@gmail.com count:', deleteIkram.deletedCount);

    // 2. Create or Update mr.monsur1988@gmail.com as Owner
    const passwordHash = await hashPassword('11223345');
    let monsur = await UserModel.findOne({ email: 'mr.monsur1988@gmail.com' });
    if (monsur) {
      monsur.name = 'MD MONSUR ALI';
      monsur.passwordHash = passwordHash;
      monsur.role = 'Owner';
      monsur.isActive = true;
      monsur.status = 'Active';
      monsur.department = 'Management';
      monsur.designation = 'Managing Director & Owner';
      await monsur.save();
      console.log('Updated existing user to Owner:', monsur.email, '-> Role:', monsur.role);
    } else {
      monsur = await UserModel.create({
        name: 'MD MONSUR ALI',
        email: 'mr.monsur1988@gmail.com',
        passwordHash: passwordHash,
        phone: '+8801345579534',
        role: 'Owner',
        isActive: true,
        status: 'Active',
        department: 'Management',
        designation: 'Managing Director & Owner',
        did: generateDid(),
      });
      console.log('Created new Owner user:', monsur.email, '-> Role:', monsur.role, 'DID:', monsur.did);
    }
  } catch (err) {
    console.error('Error during role update:', err);
  } finally {
    process.exit(0);
  }
}

run();