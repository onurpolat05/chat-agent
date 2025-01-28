import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import chatRouter from './routes/chat.router.js';
import adminRouter from './routes/admin.router.js';
import sessionRouter from './routes/session.router.js';

const app = express();

// Middleware
app.use(cors({
  origin: config.cors.origins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-agent-token'],
  credentials: true,
  maxAge: 86400,
}));
app.use(express.json());

// Routes
app.use('/api/chat', chatRouter);
app.use('/api/admin', adminRouter);
app.use('/api/sessions', sessionRouter);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
}); 