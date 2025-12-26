import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import { Server } from 'socket.io';
import http from 'http';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import workspaceRoutes from './routes/workspaces';
import jobRoutes from './routes/jobs';
import { connectDatabase } from './db';
import { initRedis } from './services/redis';
import { setupWebSocket } from './services/websocket';
import { initializeJobQueue } from './services/queue';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger';

const app: Express = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CORS_ORIGIN?.split(',') || '*' },
});

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*' }));
app.use(pinoHttp({ logger }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes
app.use('/api/v1/auth', authRoutes);

// Protected routes
app.use('/api/v1/projects', authMiddleware, projectRoutes);
app.use('/api/v1/workspaces', authMiddleware, workspaceRoutes);
app.use('/api/v1/jobs', authMiddleware, jobRoutes);

// Error handling
app.use(errorHandler);

// Initialize services
async function startup() {
  try {
    await connectDatabase();
    await initRedis();
    await initializeJobQueue();
    setupWebSocket(io);

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Swagger docs available at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    logger.error(error, 'Startup error');
    process.exit(1);
  }
}

startup();

export default app;
