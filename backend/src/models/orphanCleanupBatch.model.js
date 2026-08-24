import mongoose from 'mongoose';
import { generateDid } from '../utils/generateDid.js';

const orphanFileItemSchema = new mongoose.Schema(
  {
    did: {
      type: String,
      default: () => generateDid(),
      unique: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    localPath: {
      type: String,
      default: null,
    },
    r2Key: {
      type: String,
      default: null,
    },
    sizeBytes: {
      type: Number,
      default: 0,
    },
    reason: {
      type: String,
      default: 'No active reference found in MongoDB collections',
    },
    detectedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const orphanCleanupBatchSchema = new mongoose.Schema(
  {
    did: {
      type: String,
      default: () => generateDid(),
      unique: true,
      index: true,
    },
    batchNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['Pending_Review', 'Approved', 'Purged', 'Cancelled'],
      default: 'Pending_Review',
      index: true,
    },
    totalFilesScanned: {
      type: Number,
      default: 0,
    },
    orphanCount: {
      type: Number,
      default: 0,
    },
    totalReclaimableBytes: {
      type: Number,
      default: 0,
    },
    orphanFiles: [orphanFileItemSchema],
    initiatedBy: {
      type: String,
      default: 'System_Scheduler', // 'System_Scheduler' or user did
    },
    reviewedByDid: {
      type: String,
      default: null,
      ref: 'User',
    },
    reviewedByName: {
      type: String,
      default: null,
    },
    purgedAt: {
      type: Date,
      default: null,
    },
    purgeResults: {
      deletedFromDiskCount: { type: Number, default: 0 },
      deletedFromR2Count: { type: Number, default: 0 },
      failedCount: { type: Number, default: 0 },
      errors: [{ type: String }],
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

orphanCleanupBatchSchema.virtual('reviewedByUser', {
  ref: 'User',
  localField: 'reviewedByDid',
  foreignField: 'did',
  justOne: true,
});

export const OrphanCleanupBatchModel =
  mongoose.models.OrphanCleanupBatch ||
  mongoose.model('OrphanCleanupBatch', orphanCleanupBatchSchema);

export default OrphanCleanupBatchModel;
