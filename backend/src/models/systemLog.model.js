import mongoose from 'mongoose';

const systemLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    email: { type: String, required: false },
    role: { type: String, required: false },
    action: { type: String, required: true },
    method: { type: String, required: true },
    endpoint: { type: String, required: true },
    ipAddress: { type: String, required: false },
    payload: { type: mongoose.Schema.Types.Mixed, required: false },
    status: { type: String, enum: ['success', 'error'], default: 'success' },
    errorMessage: { type: String, required: false }
  },
  { timestamps: true }
);

export const SystemLogModel = mongoose.model('SystemLog', systemLogSchema);
