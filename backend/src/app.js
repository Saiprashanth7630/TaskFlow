import express from 'express';
import cors from 'cors';
import boardRoutes from './routes/boardRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

export function createApp() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API Routes
  app.use('/api/boards', boardRoutes);
  app.use('/api/tasks', taskRoutes);

  // 404 Handler
  app.use((req, res) => {
    res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl}` });
  });

  // Global Error Handler
  app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(err.status || 500).json({ 
      error: err.message || 'Internal Server Error' 
    });
  });

  return app;
}

export default createApp;
