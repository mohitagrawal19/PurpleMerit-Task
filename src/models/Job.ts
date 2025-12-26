import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
  _id: string;
  userId: string;
  type: string;
  input: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: any;
  error?: string;
  retries: number;
  maxRetries: number;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    userId: { type: String, required: true },
    type: { type: String, required: true },
    input: { type: Schema.Types.Mixed, required: true },
    status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
    result: { type: Schema.Types.Mixed },
    error: { type: String },
    retries: { type: Number, default: 0 },
    maxRetries: { type: Number, default: 3 },
  },
  { timestamps: true }
);

jobSchema.index({ userId: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ createdAt: -1 });

export const Job = mongoose.model<IJob>('Job', jobSchema);
