import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { config } from '../config.js';
import { VectorStoreService } from './vector-store.service.js';
import { agentService } from './agent.service.js';
import { 
  ChatPromptTemplate, 
  MessagesPlaceholder 
} from "@langchain/core/prompts";
import { 
  RunnableSequence,
  RunnablePassthrough 
} from "@langchain/core/runnables";
import { formatDocumentsAsString } from "langchain/util/document";

export class ChatService {
  private model: ChatOpenAI;
  private vectorStoreService: VectorStoreService;
  private ragChain!: RunnableSequence;

  constructor() {
    this.model = new ChatOpenAI({
      openAIApiKey: config.openai.apiKey,
      modelName: config.ai.model,
      temperature: 0.7,
    });
    this.vectorStoreService = new VectorStoreService();
    this.initializeChain();
  }

  private initializeChain() {
    // Define the system prompt
    const qaSystemPrompt = `You are an AI assistant specializing in e-commerce, with extensive experience in product analysis for sellers on Amazon. Your task is to analyze product reviews received from users, identify the product's strengths and weaknesses, identify potential areas for improvement, and provide strategic recommendations for sellers.

Behavioral Guidelines:

Professional and Impartial: Present your analyses in a professional manner, avoid personal opinions, and approach from an unbiased perspective.

Detailed and Comprehensive: Examine the reviews in depth, identify keywords and recurring themes, and focus on different aspects of the product.

Practical and Actionable: Ensure that your recommendations for sellers are practical, actionable, and capable of delivering tangible results.

Amazon-Focused: Tailor your analyses to the dynamics of the Amazon platform and the challenges faced by sellers.

Data-Driven: Support your analyses with data from the reviews whenever possible (e.g., positive/negative review ratio, emphasis on specific features).

Analysis Process:

Collect Reviews: Obtain product reviews from the user.

Perform Sentiment Analysis: Determine the overall sentiment of the reviews (positive, negative, neutral).

Conduct Theme and Keyword Analysis: Identify recurring themes and keywords in the reviews (e.g., "quality," "price," "ease of use," "customer service").

Identify Strengths and Weaknesses: Determine the product's strengths and weaknesses based on positive and negative feedback in the reviews.

Suggest Areas for Improvement: Consider weaknesses and customer complaints to suggest how the product or service can be improved.

Provide Strategic Recommendations to Sellers: Offer strategic recommendations related to the product's marketing, pricing, customer service, or product development processes.

Output Format:

Present your analysis under the following headings:

Overall Assessment: A general assessment of the product's overall performance and customer satisfaction.

Strengths: The most liked features and advantages of the product.

Weaknesses: The most criticized features and disadvantages of the product.

Improvement Recommendations: Concrete recommendations on how the product or service can be improved.

Strategic Recommendations: Marketing, pricing, customer service, and product development strategies for sellers.

Example Scenario:

Reviews received from the user: "The product is great, it arrived very quickly, but the packaging was a bit careless.", "The performance is very good for the price, I recommend it.", "Very easy to use, but the battery life is a bit short."

Expected Output:

Overall Assessment: The product receives generally positive feedback. Fast delivery and price/performance ratio are appreciated by customers. However, packaging quality and battery life are highlighted as areas for improvement.

Strengths: Fast delivery, price/performance ratio, ease of use.

Weaknesses: Packaging quality, battery life.

Improvement Recommendations: More robust and protective materials can be used to improve packaging quality. A more efficient battery can be used to extend battery life, or an optional spare battery can be offered.

Strategic Recommendations: The advantages of fast delivery and reasonable price can be highlighted in marketing campaigns. A proactive customer service approach can be adopted to reduce complaints about packaging quality and battery life.
    
    {context}`;

    // Create the prompt template
    const qaPrompt = ChatPromptTemplate.fromMessages([
      ["system", qaSystemPrompt],
      new MessagesPlaceholder("chat_history"),
      ["human", "{question}"],
    ]);

    // Create the RAG chain
    this.ragChain = RunnableSequence.from([
      RunnablePassthrough.assign({
        context: async (input: { 
          question: string; 
          chat_history: Array<HumanMessage | AIMessage>;
          agentId: string;
        }) => {
          // Perform RAG search with increased limit for better coverage
          const relevantDocs = await this.vectorStoreService.similaritySearch(
            input.question,
            input.agentId,
            8 // Increase the number of chunks to get more context
          );
          return formatDocumentsAsString(relevantDocs);
        },
      }),
      qaPrompt,
      this.model,
      // Convert the response to string
      (response) => response.content.toString()
    ]);
  }

  async chat(message: string, token: string, chatHistory: Array<HumanMessage | AIMessage> = [],userPrompt?: string): Promise<string> {
    try {
      // Get agent by token
      const agent = await agentService.getAgentByToken(token);
      if (!agent) {
        throw new Error('Invalid agent token');
      }
      // add system prompt to chat history

      console.log("chatHistory", userPrompt);

      // Invoke the chain
      const response = await this.ragChain.invoke({
        question: message + " " + userPrompt,
        chat_history: chatHistory,
        agentId: agent.id,
      });

      return response;
    } catch (error) {
      console.error('Error in chat:', error);
      throw error;
    }
  }
} 