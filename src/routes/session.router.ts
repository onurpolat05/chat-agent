import { Router, RequestHandler } from 'express';
import { SessionService } from '../services/session.service.js';
import * as UAParser from 'ua-parser-js';

interface SessionParams {
  id: string;
}

const router = Router();

const createSession: RequestHandler = async (req, res) => {
  try {
    const sessionService = SessionService.getInstance();
    
    // Get client IP address
    const ipAddress = 
      req.headers['x-forwarded-for']?.toString() || 
      req.socket.remoteAddress || 
      'unknown';

    // Parse user agent
    const parser = new UAParser.UAParser();
    parser.setUA(req.headers['user-agent'] || '');
    const parsedUa = parser.getResult();

    const userMetadata = {
      ipAddress,
      userAgent: req.headers['user-agent'] || 'unknown',
      device: {
        type: parsedUa.device.type || 'desktop',
        browser: `${parsedUa.browser.name || 'unknown'} ${parsedUa.browser.version || ''}`,
        os: `${parsedUa.os.name || 'unknown'} ${parsedUa.os.version || ''}`,
      }
    };
    console.log(userMetadata, 'userMetadata');

    const sessionId = await sessionService.createSession(userMetadata);
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

    res.json({
      id: session.id,
      messages: session.messages,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      userMetadata: session.userMetadata
    });
  } catch (error) {
    console.error('Session retrieval error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

router.post('/session', createSession);
router.get('/session/:id', getSession);

export default router; 