import Queue, { Queue as BullQueue } from 'bull';
import { logger } from '../utils/logger';
import { Job } from '../models/Job';

let jobQueue: BullQueue;

export const initializeJobQueue = async () => {
  jobQueue = new Queue('jobs', process.env.REDIS_URL || 'redis://localhost:6379');

  jobQueue.process(async (job) => {
    const dbJob = await Job.findById(job.data.jobId);
    if (!dbJob) throw new Error('Job not found');

    dbJob.status = 'processing';
    await dbJob.save();

    try {
      const result = await processJobType(job.data.type, job.data.input);
      dbJob.status = 'completed';
      dbJob.result = result;
      await dbJob.save();
      return result;
    } catch (error: any) {
      dbJob.retries++;
      if (dbJob.retries >= dbJob.maxRetries) {
        dbJob.status = 'failed';
        dbJob.error = error.message;
      } else {
        throw error; // Re-throw for Bull to retry
      }
      await dbJob.save();
    }
  });

  jobQueue.on('failed', (job, err) => {
    logger.error({ jobId: job.id, error: err }, 'Job failed');
  });

  jobQueue.on('completed', (job) => {
    logger.info({ jobId: job.id }, 'Job completed');
  });

  logger.info('Job queue initialized');
};

export const getJobQueue = () => jobQueue;

export const enqueueJob = async (jobId: string, type: string, input: any) => {
  const job = await jobQueue.add(
    { jobId, type, input },
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
    }
  );
  return job;
};

const processJobType = async (type: string, input: any): Promise<any> => {
  switch (type) {
    case 'code-execution':
      return simulateCodeExecution(input);
    case 'data-processing':
      return simulateDataProcessing(input);
    default:
      throw new Error(`Unknown job type: ${type}`);
  }
};

const simulateCodeExecution = async (input: any) => {
  // Simulate code execution with delay
  await new Promise((r) => setTimeout(r, 2000));
  return { output: `Executed: ${input.code}`, executionTime: '2s' };
};

const simulateDataProcessing = async (input: any) => {
  await new Promise((r) => setTimeout(r, 3000));
  return { processed: input.data.length, status: 'success' };
};
