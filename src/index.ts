import { Application, Request, Response, RequestHandler } from 'express';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { CONFIG } from './config.js';
import chatRouter from './routes/chat.router.js';
import sessionRouter from './routes/session.router.js';
import { VectorStoreService } from './services/vector-store.service.js';

const app: Application = express();

// Initialize vector store
VectorStoreService.getInstance();

// Middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(cors({
  origin: 'https://tw-dashboard.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
}));

// Health check
const healthCheck: RequestHandler = (_req, res) => {
  res.json({ status: 'ok' });
};
app.get('/health', healthCheck);

// Routes
app.use('/', chatRouter);
app.use('/', sessionRouter);

// Start server
app.listen(CONFIG.server.port, () => {
  console.log(`Server starting on port ${CONFIG.server.port}...`);
}); 