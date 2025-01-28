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
      modelName: 'gpt-4o-mini',
      temperature: 0.7,
    });
    this.vectorStoreService = new VectorStoreService();
    this.initializeChain();
  }

  private initializeChain() {
    // Define the system prompt
    const qaSystemPrompt = `You are a helpful AI assistant that answers questions based on the provided context. 
    You have access to multiple documents that have been uploaded for this agent.
    Use ALL the following pieces of retrieved context to answer the question comprehensively.
    Make sure to consider information from all available documents when formulating your answer.
    If you cannot find the answer in the context, say so. Do not make up information.
    
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

  async chat(message: string, token: string, chatHistory: Array<HumanMessage | AIMessage> = []): Promise<string> {
    try {
      // Get agent by token
      const agent = await agentService.getAgentByToken(token);
      if (!agent) {
        throw new Error('Invalid agent token');
      }

      // Invoke the chain
      const response = await this.ragChain.invoke({
        question: message,
        chat_history: chatHistory,
        agentId: agent.id
      });

      return response;
    } catch (error) {
      console.error('Error in chat:', error);
      throw error;
    }
  }
} 