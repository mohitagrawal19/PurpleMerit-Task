import { Router } from 'express';
import { Job } from '../models/Job';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../utils/errors';
import { enqueueJob } from '../services/queue';

const router = Router();

/**
 * @swagger
 * /api/v1/jobs:
 *   get:
 *     tags: [Jobs]
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: List jobs
 */
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const jobs = await Job.find({ userId: req.user?.id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/jobs/{id}:
 *   get:
 *     tags: [Jobs]
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *     responses:
 *       200:
 *         description: Job details
 */
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job || job.userId !== req.user?.id) throw new AppError(403, 'Not authorized');
    res.json(job);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/jobs:
 *   post:
 *     tags: [Jobs]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type: { type: string }
 *               input: { type: object }
 *     responses:
 *       201:
 *         description: Job created
 */
router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const { type, input } = req.body;
    if (!type || !input) throw new AppError(400, 'type and input required');

    const job = await Job.create({
      userId: req.user?.id,
      type,
      input,
      status: 'pending',
    });

    await enqueueJob(job._id.toString(), type, input);
    res.status(201).json(job);
  } catch (error) {
    next(error);
  }
});

export default router;
