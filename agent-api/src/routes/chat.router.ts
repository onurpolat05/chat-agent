import express from 'express';
import { ChatService } from '../services/chat.service.js';
import { agentService } from '../services/agent.service.js';
import { sessionService } from '../services/session.service.js';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { ApifyClient } from 'apify-client'; // Import the Apify client
import { config } from '../config.js';
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
const apifyClient = new ApifyClient({ token: config.apify.apiKey }); // Replace with your actual token

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

const searchAmazonProductReviews = async (targetDomain: string, asin: string) => {
  console.log("Search Amazon products:", targetDomain, asin);

  // Define the input for the Apify actor
  const input = {
    startUrls: [
     `https://www.amazon.${targetDomain}/dp/${asin}`
    ],
    proxy: {
      useApifyProxy: true
    },
    includeOtherCountriesReviews: true
  };

  // Call the Apify actor and wait for the results
  const { defaultDatasetId } = await apifyClient.actor('epctex/amazon-reviews-scraper').call(input);

  // Fetch the results from the dataset
  const { items } = await apifyClient.dataset(defaultDatasetId).listItems();
  console.log("Amazon products:", items);

  return items; // Re
};

// Chat endpoint
router.post('/:sessionId', validateAgentToken, async (req, res) => {
  try {
    const { message } = req.body;
    const { sessionId } = req.params;
    const { productInfo } = req.body;
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
    let productsReviews = {};
    if (productInfo) {
      console.log("Start search amazon products")
      const parsedProductInfo = JSON.parse(productInfo);
      productsReviews = await searchAmazonProductReviews(parsedProductInfo.targetDomain, parsedProductInfo.asin);
      console.log("Amazon products:", productsReviews);
    }

    // Get chat response with history
    const response = await chatService.chat(
      message, 
      req.headers['x-agent-token'] as string,
      chatHistory,
      productInfo,  
      productsReviews
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