import { Router, RequestHandler } from 'express';
import { ChatRequestSchema } from '../types/api.type.js';
import { SessionService } from '../services/session.service.js';
import { VectorStoreService } from '../services/vector-store.service.js';
import { RetrievalChain } from '../chains/retrieval.chain.js';

interface ChatRequest {
  sessionId: string;
  question: string;
}

const router = Router();

const chatHandler: RequestHandler = async (req, res) => {
  try {
    const { sessionId, question } = ChatRequestSchema.parse(req.body);

    const sessionService = SessionService.getInstance();
    const vectorStore = VectorStoreService.getInstance();
    const retrievalChain = RetrievalChain.getInstance();

    // Get relevant context
    const context = await vectorStore.similaritySearch(question);

    // Generate answer
    const answer = await retrievalChain.call(context, question);

    // Update session
    await sessionService.addMessage(sessionId, {
      role: 'user',
      content: question,
    });

    await sessionService.addMessage(sessionId, {
      role: 'assistant',
      content: answer,
    });

    res.json({
      answer,
      sources: context.map(doc => ({
        page: doc.metadata.page || 1,
        content: doc.pageContent,
      })),
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

router.post('/chat', chatHandler);

export default router; 