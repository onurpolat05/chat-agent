import { Router, RequestHandler } from 'express';
import { SessionService } from '../services/session.service.js';

interface SessionParams {
  id: string;
}

const router = Router();

const createSession: RequestHandler = async (_req, res) => {
  try {
    const sessionService = SessionService.getInstance();
    const sessionId = await sessionService.createSession();
    res.json({ sessionId });
  } catch (error) {
    console.error('Session creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getSession: RequestHandler = async (req, res) => {
  try {
    const sessionId = req.params.id;
    const sessionService = SessionService.getInstance();
    const session = await sessionService.getSession(sessionId);

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    // Format chat history for better readability
    const chatHistory = session.messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: new Date(msg.timestamp).toLocaleString()
    }));

    res.json({
      id: session.id,
      messages: chatHistory,
      createdAt: new Date(session.createdAt).toLocaleString(),
      updatedAt: new Date(session.updatedAt).toLocaleString()
    });
  } catch (error) {
    console.error('Session retrieval error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

router.post('/session', createSession);
router.get('/session/:id', getSession);

export default router; 