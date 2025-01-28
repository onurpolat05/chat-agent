import express from 'express';
import { ChatService } from '../services/chat.service.js';
import { agentService } from '../services/agent.service.js';
import { sessionService } from '../services/session.service.js';
import { HumanMessage, AIMessage } from '@langchain/core/messages';

// Express'in Request tipini genişletiyoruz
declare global {
  namespace Express {
    interface Request {
      agent?: any; // veya daha spesifik bir tip
    }
  }
}

const router = express.Router();
const chatService = new ChatService();

// Middleware to validate agent token
const validateAgentToken = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.headers['x-agent-token'] as string;
  if (!token) {
    res.status(401).json({ error: 'Agent token is required' });
    return;
  }

  const agent = await agentService.getAgentByToken(token);
  if (!agent) {
    res.status(401).json({ error: 'Invalid agent token' });
    return;
  }

  req.agent = agent;
  next();
};

// Chat endpoint
router.post('/:sessionId', validateAgentToken, async (req, res) => {
  try {
    const { message } = req.body;
    const { sessionId } = req.params;

    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // Get session and verify ownership
    const session = await sessionService.getSession(sessionId);
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    if (session.agentId !== req.agent.id) {
      res.status(403).json({ error: 'Unauthorized access to session' });
      return;
    }

    // Convert session messages to LangChain format
    const chatHistory = session.messages.map(msg => 
      msg.role === 'user' 
        ? new HumanMessage(msg.content)
        : new AIMessage(msg.content)
    );

    // Add user message to session
    await sessionService.addMessage(sessionId, {
      role: 'user',
      content: message
    });

    // Get chat response with history
    const response = await chatService.chat(
      message, 
      req.headers['x-agent-token'] as string,
      chatHistory
    );

    // Add assistant response to session
    await sessionService.addMessage(sessionId, {
      role: 'assistant',
      content: response
    });

    res.json({ response });
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

export default router; 