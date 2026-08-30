import { connectDatabase } from './src/database/index.js';
import { UserModel } from './src/models/user.model.js';
import { hashPassword } from './src/utils/password.js';
import { generateDid } from './src/utils/generateDid.js';

async function run() {
  try {
    await connectDatabase();

    // 1. Demote ihkhan2027@gmail.com to Admin
    const ihkhan = await UserModel.findOneAndUpdate(
      { email: 'ihkhan2027@gmail.com' },
      { $set: { role: 'Admin' } },
      { new: true }
    );
    console.log('Demoted ihkhan2027:', ihkhan?.email, '-> Role:', ihkhan?.role);

    // 2. Create or Update ikramul.web@gmail.com as Owner
    const passwordHash = await hashPassword('11223345');
    let ikram = await UserModel.findOne({ email: 'ikramul.web@gmail.com' });
    if (ikram) {
      ikram.name = 'MD Ikram';
      ikram.passwordHash = passwordHash;
      ikram.role = 'Owner';
      ikram.isActive = true;
      ikram.status = 'Active';
      await ikram.save();
      console.log('Updated existing user to Owner:', ikram.email, '-> Role:', ikram.role);
    } else {
      ikram = await UserModel.create({
        name: 'MD Ikram',
        email: 'ikramul.web@gmail.com',
        passwordHash: passwordHash,
        phone: '+8801700000000',
        role: 'Owner',
        isActive: true,
        status: 'Active',
        did: generateDid(),
      });
      console.log('Created new Owner user:', ikram.email, '-> Role:', ikram.role, 'DID:', ikram.did);
    }
  } catch (err) {
    console.error('Error during role update:', err);
  } finally {
    process.exit(0);
  }
}

run();