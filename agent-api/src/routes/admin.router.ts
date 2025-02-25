import express from 'express';
import multer from 'multer';
import { agentService } from '../services/agent.service.js';
import { sessionService } from '../services/session.service.js';
import { DocumentLoaderFactory } from '../services/document-loader.factory.js';
import path from 'path';

const router = express.Router();

 // Configure multer with file type validation
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, callback) => {
    if (DocumentLoaderFactory.isSupported(file.originalname)) {
      callback(null, true);
    } else {
      callback(new Error(`Unsupported file type: ${path.extname(file.originalname)}`));
    }
  }
}).array('files', 20); // Allow up to 20 files

// Get all agents
router.get('/agents', async (req, res) => {
  try {
    const agents = await agentService.getAgents();
    res.json(agents);
  } catch (error) {
    console.error('Error getting agents:', error);
    res.status(500).json({ error: 'Failed to get agents' });
  }
});

// Get agent by ID
router.get('/agents/:id', async (req, res) => {
  try {
    const agent = await agentService.getAgentById(req.params.id);
    if (!agent) {
      res.status(404).json({ error: 'Agent not found' });
      return;
    }
    res.json(agent);
  } catch (error) {
    console.error('Error getting agent:', error);
    res.status(500).json({ error: 'Failed to get agent' });
  }
});

// Get agent token
router.get('/agents/:id/token', async (req, res) => {
  try {
    const token = await agentService.getAgentToken(req.params.id);
    if (!token) {
      res.status(404).json({ error: 'Agent not found' });
      return;
    }
    res.json({ token });
  } catch (error) {
    console.error('Error getting agent token:', error);
    res.status(500).json({ error: 'Failed to get agent token' });
  }
});

// Get sessions by agent ID
router.get('/agents/:id/sessions', async (req, res) => {
  try {
    const sessions = await sessionService.getSessionsByAgentId(req.params.id);
    // Map sessions to include formatted metadata
    const formattedSessions = sessions.map(session => ({
      ...session,
      userMetadata: {
        ipAddress: session.userMetadata?.ipAddress || 'Unknown',
        device: {
          type: session.userMetadata?.device?.type || 'Unknown',
          browser: session.userMetadata?.device?.browser || 'Unknown',
          os: session.userMetadata?.device?.os || 'Unknown'
        },
        userAgent: session.userMetadata?.userAgent || 'Unknown'
      }
    }));
    res.json(formattedSessions);
  } catch (error) {
    console.error('Error getting sessions:', error);
    res.status(500).json({ error: 'Failed to get sessions' });
  }
});

// Get specific session by ID
router.get('/sessions/:sessionId', async (req, res) => {
  try {
    const session = await sessionService.getSession(req.params.sessionId);
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const formattedSession = {
      ...session,
      userMetadata: {
        ipAddress: session.userMetadata?.ipAddress || 'Unknown',
        device: {
          type: session.userMetadata?.device?.type || 'Unknown',
          browser: session.userMetadata?.device?.browser || 'Unknown',
          os: session.userMetadata?.device?.os || 'Unknown'
        },
        userAgent: session.userMetadata?.userAgent || 'Unknown'
      }
    };

    res.json(formattedSession);
  } catch (error) {
    console.error('Error getting session:', error);
    res.status(500).json({ error: 'Failed to get session' });
  }
});

// Get agent details with sessions
router.get('/agents/:id/details', async (req, res) => {
  try {
    const [agent, sessions] = await Promise.all([
      agentService.getAgentById(req.params.id),
      sessionService.getSessionsByAgentId(req.params.id)
    ]);

    if (!agent) {
      res.status(404).json({ error: 'Agent not found' });
      return;
    }

    // Format sessions with metadata
    const formattedSessions = sessions.map(session => ({
      ...session,
      userMetadata: {
        ipAddress: session.userMetadata?.ipAddress || 'Unknown',
        device: {
          type: session.userMetadata?.device?.type || 'Unknown',
          browser: session.userMetadata?.device?.browser || 'Unknown',
          os: session.userMetadata?.device?.os || 'Unknown'
        },
        userAgent: session.userMetadata?.userAgent || 'Unknown'
      }
    }));

    res.json({
      agent,
      sessions: formattedSessions
    });
  } catch (error) {
    console.error('Error getting agent details:', error);
    res.status(500).json({ error: 'Failed to get agent details' });
  }
});

// Create a new agent
router.post('/agents', (req, res) => {
  upload(req, res, async (err) => {
    try {
      if (err) {
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({ error: 'Too many files. Maximum is 20 files' });
        }
        return res.status(400).json({ error: err.message });
      }

      if (!req.body.name || !req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ error: 'Name and at least one file are required' });
      }

      const agent = await agentService.createAgent({
        name: req.body.name,
        files: req.files,
      });

      res.status(201).json(agent);
    } catch (error) {
      console.error('Error creating agent:', error);
      if (error instanceof Error && error.message.includes('Unsupported file type')) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to create agent' });
      }
    }
  });
});

// Delete an agent
router.delete('/agents/:id', async (req, res) => {
  console.log('Deleting agent:', req.params.id);
  try {
    const success = await agentService.deleteAgent(req.params.id);
    if (!success) {
      res.status(404).json({ error: 'Agent not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting agent:', error);
    res.status(500).json({ error: 'Failed to delete agent' });
  }
});

export default router; 