import mongoose from 'mongoose';
import { generateDid } from '../utils/generateDid.js';

const systemLogSchema = new mongoose.Schema(
  {
    // 1. Standard Decentralized Identifier (DID)
    did: {
      type: String,
      default: () => generateDid(),
      unique: true,
      index: true,
    },

    // 2. Mandatory Tracking Base Fields
    createdBy: { type: String, required: true, default: 'SYSTEM' },
    updatedBy: { type: String, required: true, default: 'SYSTEM' },

    // 3. Log Category / Type for API Filtering
    type: {
      type: String,
      required: true,
      index: true,
      enum: ['DATA_ENTRY', 'STATUS_CHANGE', 'PAYMENT', 'AUTH', 'TASK_EXECUTION', 'SYSTEM', 'DOC_STUDIO'],
      default: 'DATA_ENTRY',
    },

    // 4. Target Collection (Collection where action occurred)
    targetCollection: {
      type: String,
      required: true,
      index: true,
      default: 'general',
    },

    // 5. Action Type
    action: {
      type: String,
      enum: ['CREATE', 'UPDATE', 'SOFT_DELETE', 'AUTH_LOGIN', 'AUTH_LOGOUT', 'STATUS_TRANSITION'],
      required: true,
      default: 'CREATE',
      index: true,
    },

    // 6. JSON Object: User / Actor Details (Indexed for role/did filtering)
    actionDetails: {
      did: { type: String, required: true, index: true, default: 'SYSTEM' },
      name: { type: String, required: true, default: 'System Process' },
      role: {
        type: String,
        enum: ['Owner', 'Admin', 'Manager', 'Staff', 'System', 'Guest'],
        required: true,
        index: true,
        default: 'System',
      },
      ipAddress: { type: String, default: '' },
      userAgent: { type: String, default: '' },
    },

    // 7. Change Payload & Metadata
    payload: { type: mongoose.Schema.Types.Mixed },

    // 8. Soft-Delete & Active Flag
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    collection: 'system-logs',
  }
);

// Compound Indexes for High-Performance Filter Queries
systemLogSchema.index({ 'actionDetails.role': 1, type: 1, createdAt: -1 });
systemLogSchema.index({ targetCollection: 1, action: 1, createdAt: -1 });
systemLogSchema.index({ 'actionDetails.did': 1, createdAt: -1 });

export const SystemLogModel = mongoose.models.SystemLog || mongoose.model('SystemLog', systemLogSchema);
export default SystemLogModel;
