import mongoose from 'mongoose';
import { generateDid } from '../utils/generateDid.js';

const storageSyncLogSchema = new mongoose.Schema(
  {
    did: {
      type: String,
      default: () => generateDid(),
      unique: true,
      index: true,
    },
    triggeredBy: {
      type: String,
      enum: ['Cron_Scheduler', 'Admin_Manual'],
      default: 'Cron_Scheduler',
      index: true,
    },
    adminDid: {
      type: String,
      default: null,
      ref: 'User',
    },
    localFilesScanned: {
      type: Number,
      default: 0,
    },
    r2ObjectsCount: {
      type: Number,
      default: 0,
    },
    missingInR2Count: {
      type: Number,
      default: 0,
    },
    filesUploadedToR2: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Success', 'Partial_Failure', 'Failed'],
      default: 'Success',
      index: true,
    },
    details: [
      {
        key: { type: String, required: true },
        localPath: { type: String },
        action: { type: String, enum: ['UPLOADED_TO_R2', 'FAILED', 'SKIPPED'], default: 'UPLOADED_TO_R2' },
        status: { type: String, enum: ['SUCCESS', 'ERROR'], default: 'SUCCESS' },
        error: { type: String, default: null },
      },
    ],
    durationMs: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret.did;
        delete ret._id;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

storageSyncLogSchema.virtual('adminUser', {
  ref: 'User',
  localField: 'adminDid',
  foreignField: 'did',
  justOne: true,
});

export const StorageSyncLogModel =
  mongoose.models.StorageSyncLog ||
  mongoose.model('StorageSyncLog', storageSyncLogSchema);

export default StorageSyncLogModel;
