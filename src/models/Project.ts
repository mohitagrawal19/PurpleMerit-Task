import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  _id: string;
  name: string;
  description: string;
  ownerId: string;
  collaborators: { userId: string; role: 'owner' | 'collaborator' | 'viewer' }[];
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true },
    description: { type: String },
    ownerId: { type: String, required: true },
    collaborators: [
      {
        userId: { type: String, required: true },
        role: { type: String, enum: ['owner', 'collaborator', 'viewer'], required: true },
      },
    ],
  },
  { timestamps: true }
);

projectSchema.index({ ownerId: 1 });
projectSchema.index({ 'collaborators.userId': 1 });

export const Project = mongoose.model<IProject>('Project', projectSchema);
