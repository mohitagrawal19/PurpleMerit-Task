import mongoose from 'mongoose';
import { logger } from '../utils/logger';

export const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/workspace_db');
    logger.info('MongoDB connected');
  } catch (error) {
    logger.error(error, 'MongoDB connection failed');
    throw error;
  }
};
