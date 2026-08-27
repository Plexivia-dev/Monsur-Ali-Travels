import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { OrderModel } from '../models/order.model.js';

dotenv.config();

// Establish temporary database connection to run the schema migration
async function runMigration() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/monsuralitravels';
  console.log(`[Migration] Connecting to database: ${uri}`);
  
  try {
    await mongoose.connect(uri);
    console.log('[Migration] Database connected successfully.');

    // Fetch all existing order records to process schema conversion
    const orders = await OrderModel.find({});
    console.log(`[Migration] Found ${orders.length} order documents to verify.`);

    let migrationCount = 0;

    for (const order of orders) {
      const doc = order.toObject();
      let needsUpdate = false;
      const updatePayload = {};

      // Migrate billing schema if legacy client object is found
      if (doc.client && !doc.billingInfo) {
        needsUpdate = true;
        updatePayload.billingInfo = {
          fullName: doc.client.fullName || doc.client.name || 'Client',
          phone: doc.client.phone || 'N/A',
          email: doc.client.email || '',
          address: doc.client.address || 'N/A',
          thana: doc.client.thana || '',
          district: doc.client.district || doc.client.city || 'N/A',
          zip: doc.client.zip || '',
        };
        updatePayload.$unset = { ...(updatePayload.$unset || {}), client: 1 };
      }

      // Migrate shipping schema if legacy shippingAddress object is found
      if (!doc.shippingInfo) {
        needsUpdate = true;
        const legacyAddr = doc.shippingAddress;
        const activeBilling = updatePayload.billingInfo || doc.billingInfo;

        if (legacyAddr && typeof legacyAddr === 'object' && Object.keys(legacyAddr).length > 0) {
          const street = legacyAddr.street || legacyAddr.address || activeBilling?.address || 'N/A';
          updatePayload.shippingInfo = {
            fullName: legacyAddr.fullName || legacyAddr.name || activeBilling?.fullName || 'Client',
            phone: legacyAddr.phone || activeBilling?.phone || 'N/A',
            address: street,
            thana: legacyAddr.thana || activeBilling?.thana || '',
            district: legacyAddr.district || legacyAddr.city || activeBilling?.district || 'N/A',
            zip: legacyAddr.zip || activeBilling?.zip || '',
          };
        } else {
          // Copy billing details directly to shippingInfo when custom shipping is missing
          updatePayload.shippingInfo = {
            fullName: activeBilling?.fullName || 'Client',
            phone: activeBilling?.phone || 'N/A',
            address: activeBilling?.address || 'N/A',
            thana: activeBilling?.thana || '',
            district: activeBilling?.district || 'N/A',
            zip: activeBilling?.zip || '',
          };
        }
        updatePayload.$unset = { ...(updatePayload.$unset || {}), shippingAddress: 1 };
      }

      // Execute update when document requires structural change
      if (needsUpdate) {
        await OrderModel.updateOne({ _id: order._id }, updatePayload);
        migrationCount++;
      }
    }

    console.log(`[Migration] Migration complete. Refactored ${migrationCount} order documents.`);
  } catch (error) {
    console.error('[Migration] Migration run failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('[Migration] Database connection closed.');
  }
}

runMigration();
