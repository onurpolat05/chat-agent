import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { CONFIG } from './config.js';
import chatRouter from './routes/chat.router.js';
import sessionRouter from './routes/session.router.js';
import { VectorStoreService } from './services/vector-store.service.js';

const app = new Hono();

// Initialize vector store
VectorStoreService.getInstance();

// Middleware
app.use('*', logger());
app.use('*', cors());

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }));

// Routes
app.route('/', chatRouter);
app.route('/', sessionRouter);

// Start server
console.log(`Server starting on port ${CONFIG.server.port}...`);
serve({
  fetch: app.fetch,
  port: CONFIG.server.port,
}); 