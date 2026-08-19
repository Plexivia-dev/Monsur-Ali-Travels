import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Create Default Owner Admin User
  const defaultEmail = 'admin@monsuralitravels.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: defaultEmail },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('AdminSecPass2026!', 10);
    const did = crypto.randomBytes(8).toString('hex');

    const admin = await prisma.user.create({
      data: {
        did,
        name: 'MD. IKRAMUL HOSSAIN',
        email: defaultEmail,
        phone: '+8801345579534',
        passwordHash,
        role: 'Owner',
        department: 'Executive Management',
        designation: 'Managing Director & CEO',
      },
    });

    console.log(`✅ Default Owner created: ${admin.email} (${admin.name})`);
  } else {
    console.log(`ℹ️ Admin user already exists: ${existingAdmin.email}`);
  }

  console.log('✅ Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
