import { Hono } from 'hono';
import { StreamingApi } from '@hono/node-server';
import { ChatRequestSchema } from '../types/api.type';
import { SessionService } from '../services/session.service';
import { VectorStoreService } from '../services/vector-store.service';
import { RetrievalChain } from '../chains/retrieval.chain';

const router = new Hono<{ Bindings: {}; Variables: {}; Response: StreamingApi }>();

router.post('/chat', async (c) => {
  try {
    const body = await c.req.json();
    const { sessionId, question } = ChatRequestSchema.parse(body);

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

    return c.json({
      answer,
      sources: context.map(doc => ({
        page: doc.metadata.page || 1,
        content: doc.pageContent,
      })),
    });
  } catch (error) {
    console.error('Chat error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default router; 