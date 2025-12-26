import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkspace extends Document {
  _id: string;
  projectId: string;
  name: string;
  members: { userId: string; status: 'active' | 'idle' | 'offline' }[];
  createdAt: Date;
  updatedAt: Date;
}

const workspaceSchema = new Schema<IWorkspace>(
  {
    projectId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    members: [
      {
        userId: { type: String, required: true },
        status: { type: String, enum: ['active', 'idle', 'offline'], default: 'offline' },
      },
    ],
  },
  { timestamps: true }
);

workspaceSchema.index({ projectId: 1 });

export const Workspace = mongoose.model<IWorkspace>('Workspace', workspaceSchema);
