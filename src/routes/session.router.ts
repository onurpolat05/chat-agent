import { Hono } from 'hono';
import { SessionService } from '../services/session.service.js';

const router = new Hono();

router.post('/session', async (c) => {
  try {
    const sessionService = SessionService.getInstance();
    const sessionId = await sessionService.createSession();
    return c.json({ sessionId });
  } catch (error) {
    console.error('Session creation error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

router.get('/session/:id', async (c) => {
  try {
    const sessionId = c.req.param('id');
    const sessionService = SessionService.getInstance();
    const session = await sessionService.getSession(sessionId);

    if (!session) {
      return c.json({ error: 'Session not found' }, 404);
    }

    // Format chat history for better readability
    const chatHistory = session.messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: new Date(msg.timestamp).toLocaleString()
    }));

    return c.json({
      id: session.id,
      messages: chatHistory,
      createdAt: new Date(session.createdAt).toLocaleString(),
      updatedAt: new Date(session.updatedAt).toLocaleString()
    });
  } catch (error) {
    console.error('Session retrieval error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default router; 