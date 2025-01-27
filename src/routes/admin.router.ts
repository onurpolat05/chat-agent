import { Router, RequestHandler } from 'express';
import { SessionService } from '../services/session.service.js';
import { Session } from '../types/session.type.js';

const router = Router();

interface SessionListItem {
  id: string;
  lastMessage: string;
  messageCount: number;
  userMetadata: Session['userMetadata'];
  createdAt: number;
  updatedAt: number;
}

const listSessions: RequestHandler = async (_req, res) => {
  try {
    const sessionService = SessionService.getInstance();
    const sessions = await sessionService.getAllSessions();

    // Sort sessions by updatedAt in descending order (newest first)
    const sortedSessions: SessionListItem[] = sessions
      .map(session => ({
        id: session.id,
        lastMessage: session.messages[session.messages.length - 1]?.content || '',
        messageCount: session.messages.length,
        userMetadata: session.userMetadata,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt
      }))
      .sort((a, b) => b.updatedAt - a.updatedAt);

    res.json({ sessions: sortedSessions });
  } catch (error) {
    console.error('Failed to list sessions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getSessionDetails: RequestHandler = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const sessionService = SessionService.getInstance();
    const session = await sessionService.getSession(sessionId);

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    res.json({
      session: {
        id: session.id,
        messages: session.messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp
        })),
        createdAt: session.createdAt,
        updatedAt: session.updatedAt
      }
    });
  } catch (error) {
    console.error('Failed to get session details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

router.get('/sessions', listSessions);
router.get('/sessions/:sessionId', getSessionDetails);

export default router; 