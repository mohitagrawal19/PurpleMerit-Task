import { Router } from 'express';
import { Workspace } from '../models/Workspace';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../utils/errors';

const router = Router();

/**
 * @swagger
 * /api/v1/workspaces:
 *   get:
 *     tags: [Workspaces]
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: List workspaces
 */
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const workspaces = await Workspace.find({
      'members.userId': req.user?.id,
    });
    res.json(workspaces);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/workspaces/{projectId}:
 *   get:
 *     tags: [Workspaces]
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *     responses:
 *       200:
 *         description: Workspace details
 */
router.get('/:projectId', async (req: AuthRequest, res, next) => {
  try {
    const workspace = await Workspace.findOne({ projectId: req.params.projectId });
    if (!workspace) throw new AppError(404, 'Workspace not found');
    res.json(workspace);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/workspaces:
 *   post:
 *     tags: [Workspaces]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               projectId: { type: string }
 *               name: { type: string }
 *     responses:
 *       201:
 *         description: Workspace created
 */
router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const { projectId, name } = req.body;
    if (!projectId || !name) throw new AppError(400, 'projectId and name required');

    const workspace = await Workspace.create({
      projectId,
      name,
      members: [{ userId: req.user?.id, status: 'active' }],
    });
    res.status(201).json(workspace);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/workspaces/{id}/join:
 *   post:
 *     tags: [Workspaces]
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *     responses:
 *       200:
 *         description: Joined workspace
 */
router.post('/:id/join', async (req: AuthRequest, res, next) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) throw new AppError(404, 'Workspace not found');

    const member = workspace.members.find((m) => m.userId === req.user?.id);
    if (!member) {
      workspace.members.push({ userId: req.user!.id, status: 'active' });
      await workspace.save();
    }

    res.json(workspace);
  } catch (error) {
    next(error);
  }
});

export default router;
