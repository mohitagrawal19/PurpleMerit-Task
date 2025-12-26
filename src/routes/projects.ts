import { Router } from 'express';
import { Project } from '../models/Project';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../utils/errors';
import Joi from 'joi';

const router = Router();

const projectSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500),
});

/**
 * @swagger
 * /api/v1/projects:
 *   get:
 *     tags: [Projects]
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: List projects
 */
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const projects = await Project.find({
      $or: [{ ownerId: req.user?.id }, { 'collaborators.userId': req.user?.id }],
    });
    res.json(projects);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/projects/{id}:
 *   get:
 *     tags: [Projects]
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *     responses:
 *       200:
 *         description: Project details
 */
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) throw new AppError(404, 'Project not found');
    res.json(project);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/projects:
 *   post:
 *     tags: [Projects]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Project created
 */
router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const { error, value } = projectSchema.validate(req.body);
    if (error) throw new AppError(400, error.details[0].message);

    const project = await Project.create({
      ...value,
      ownerId: req.user?.id,
      collaborators: [{ userId: req.user?.id, role: 'owner' }],
    });
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/projects/{id}:
 *   put:
 *     tags: [Projects]
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *     responses:
 *       200:
 *         description: Project updated
 */
router.put('/:id', async (req: AuthRequest, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project || project.ownerId !== req.user?.id) {
      throw new AppError(403, 'Not authorized');
    }

    const { error, value } = projectSchema.validate(req.body);
    if (error) throw new AppError(400, error.details[0].message);

    Object.assign(project, value);
    await project.save();
    res.json(project);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/projects/{id}:
 *   delete:
 *     tags: [Projects]
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *     responses:
 *       204:
 *         description: Project deleted
 */
router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project || project.ownerId !== req.user?.id) {
      throw new AppError(403, 'Not authorized');
    }
    await Project.deleteOne({ _id: req.params.id });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/projects/{id}/invite:
 *   post:
 *     tags: [Projects]
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId: { type: string }
 *               role: { type: string, enum: [owner, collaborator, viewer] }
 *     responses:
 *       200:
 *         description: Collaborator added
 */
router.post('/:id/invite', async (req: AuthRequest, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project || project.ownerId !== req.user?.id) {
      throw new AppError(403, 'Not authorized');
    }

    const { userId, role } = req.body;
    if (!userId || !role) throw new AppError(400, 'userId and role required');

    const existing = project.collaborators.find((c) => c.userId === userId);
    if (existing) {
      existing.role = role;
    } else {
      project.collaborators.push({ userId, role });
    }

    await project.save();
    res.json(project);
  } catch (error) {
    next(error);
  }
});

export default router;
