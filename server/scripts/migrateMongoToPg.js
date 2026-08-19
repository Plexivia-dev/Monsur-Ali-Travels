import mongoose from 'mongoose';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://admin:MonsurAliSecPass2026!@localhost:27017/monsur-ali-travels?authSource=admin';

/**
 * Migration Script: Copies MongoDB records into PostgreSQL tables
 */
async function migrate() {
  console.log('🔄 Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB.');

  const db = mongoose.connection.db;

  // 1. Migrate Users
  try {
    const mongoUsers = await db.collection('users').find({}).toArray();
    console.log(`📦 Found ${mongoUsers.length} users in MongoDB...`);
    for (const u of mongoUsers) {
      await prisma.user.upsert({
        where: { email: u.email },
        update: {
          name: u.name || 'Staff User',
          phone: u.phone || '',
          role: u.role || 'Employee',
          department: u.department || '',
          designation: u.designation || '',
          isActive: u.isActive !== false,
        },
        create: {
          did: u.did || Math.random().toString(16).slice(2, 18),
          name: u.name || 'Staff User',
          email: u.email,
          phone: u.phone || '',
          passwordHash: u.password || '$2a$10$defaultHashPlaceholder',
          role: u.role || 'Employee',
          department: u.department || '',
          designation: u.designation || '',
          isActive: u.isActive !== false,
        },
      });
    }
    console.log('✅ Users migrated.');
  } catch (err) {
    console.error('⚠️ User migration warning:', err.message);
  }

  // 2. Migrate Customers
  try {
    const mongoCustomers = await db.collection('customers').find({}).toArray();
    console.log(`📦 Found ${mongoCustomers.length} customers in MongoDB...`);
    for (const c of mongoCustomers) {
      await prisma.customer.upsert({
        where: { customerCode: c.customerCode || `CUST-${Math.floor(100000 + Math.random() * 900000)}` },
        update: {
          fullName: c.fullName,
          phone: c.phone,
          passportNumber: c.passportNumber || '',
          nidNumber: c.nidNumber || '',
          totalBilledAmount: c.totalBilledAmount || 0,
          totalPaidAmount: c.totalPaidAmount || 0,
          totalDueAmount: c.totalDueAmount || 0,
          isActive: c.isActive !== false,
        },
        create: {
          did: c.did || Math.random().toString(16).slice(2, 18),
          customerCode: c.customerCode || `CUST-${Math.floor(100000 + Math.random() * 900000)}`,
          fullName: c.fullName,
          phone: c.phone || 'N/A',
          passportNumber: c.passportNumber || '',
          nidNumber: c.nidNumber || '',
          gender: c.gender === 'Female' ? 'Female' : 'Male',
          fatherName: c.fatherName || '',
          motherName: c.motherName || '',
          guardian: c.guardian || {},
          attachments: c.attachments || {},
          totalBilledAmount: c.totalBilledAmount || 0,
          totalPaidAmount: c.totalPaidAmount || 0,
          totalDueAmount: c.totalDueAmount || 0,
          isActive: c.isActive !== false,
        },
      });
    }
    console.log('✅ Customers migrated.');
  } catch (err) {
    console.error('⚠️ Customer migration warning:', err.message);
  }

  // 3. Migrate Money Receipts
  try {
    const mongoReceipts = await db.collection('money_receipts').find({}).toArray();
    console.log(`📦 Found ${mongoReceipts.length} receipts in MongoDB...`);
    for (const r of mongoReceipts) {
      await prisma.moneyReceipt.upsert({
        where: { receiptNo: r.receiptNo },
        update: {
          status: r.status || 'pending',
          handedOverToBank: r.handedOverToBank || false,
          isActive: r.isActive !== false,
        },
        create: {
          did: r.did || Math.random().toString(16).slice(2, 18),
          receiptNo: r.receiptNo,
          clientName: r.clientName,
          clientPhone: r.clientPhone || '',
          passportNumber: r.passportNumber || '',
          serviceType: r.serviceType || 'অন্যান্য',
          purpose: r.purpose || '',
          amount: r.amount || 0,
          amountInWords: r.amountInWords || '',
          paymentMethod: r.paymentMethod || 'Cash',
          status: r.status || 'pending',
          createdByName: r.createdByName || 'ম্যানেজার',
          confirmedByName: r.confirmedByName || '',
          confirmedAt: r.confirmedAt ? new Date(r.confirmedAt) : null,
          handedOverToBank: r.handedOverToBank || false,
          bankDepositRef: r.bankDepositRef || '',
          isActive: r.isActive !== false,
        },
      });
    }
    console.log('✅ Money receipts migrated.');
  } catch (err) {
    console.error('⚠️ Money receipt migration warning:', err.message);
  }

  console.log('🎉 Migration completed.');
  await mongoose.disconnect();
  await prisma.$disconnect();
}

migrate().catch(console.error);
