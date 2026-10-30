import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './server/routes/authRoutes.ts';
import workflowRoutes from './server/routes/workflowRoutes.ts';
import inventoryRoutes from './server/routes/inventoryRoutes.ts';
import auditRoutes from './server/routes/auditRoutes.ts';
import copilotRoutes from './server/routes/copilotRoutes.ts';
import mediaRoutes from './server/routes/mediaRoutes.ts';
import { errorHandler } from './server/middleware/errorHandler.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // JSON Body parsing
  app.use(express.json());

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/workflows', workflowRoutes);
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/audit', auditRoutes);
  app.use('/api/copilot', copilotRoutes);
  app.use('/api/media', mediaRoutes);

  // Health Check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'healthy',
      system: 'AutoOps AI - Autonomous Enterprise Workflow Agent',
      version: '2.4.0',
      timestamp: new Date().toISOString(),
    });
  });

  // API Error Handler
  app.use('/api', errorHandler);

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AutoOps AI] Engine listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[AutoOps Server Boot Error]:', err);
  process.exit(1);
});
