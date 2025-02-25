import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { config } from '../config.js';
import { VectorStoreService } from './vector-store.service.js';
import { agentService } from './agent.service.js';
import { formatDocumentsAsString } from "langchain/util/document";
import { DuckDuckGoSearch } from "@langchain/community/tools/duckduckgo_search";

interface ChatInput {
  question: string;
  chat_history: Array<HumanMessage | AIMessage>;
  agentId: string;
}

export class ChatService {
  private model: ChatOpenAI;
  private vectorStoreService: VectorStoreService;
  private searchTool: DuckDuckGoSearch;

  constructor() {
    this.model = new ChatOpenAI({
      openAIApiKey: config.openai.apiKey,
      modelName: config.ai.model,
      temperature: 0.7,
    });
    this.vectorStoreService = new VectorStoreService();
    this.searchTool = new DuckDuckGoSearch({
      maxResults: 5
    });
  }

  private async getContext(input: ChatInput): Promise<string> {
    const relevantDocs = await this.vectorStoreService.similaritySearch(
      input.question,
      input.agentId,
      8
    );
    return formatDocumentsAsString(relevantDocs);
  }

  private async getResearchQuestion(question: string, context: string): Promise<string> {
    const prompt = `Based on the following user question and context, generate a research question that would help provide additional relevant information.
    Focus on aspects that might not be fully covered in the context.
    
    Context: ${context}
    User Question: ${question}
    
    Generate a specific research question (respond with only the question, no additional text).`;

    const response = await this.model.invoke(prompt);
    return response.content.toString().trim();
  }

  private async performWebSearch(query: string): Promise<string> {
    try {
      return await this.searchTool.call(query);
    } catch (error) {
      console.error('Error performing web search:', error);
      return 'No additional information found from web search.';
    }
  }

  private async generateAnswer(question: string, context: string, searchResults: string): Promise<string> {
    const prompt = `You are a helpful AI assistant. Provide a comprehensive answer by combining information from our documents and web search results.
    
    Document Context: ${context}
    Web Search Results: ${searchResults}
    User Question: ${question}
    
    Please provide a detailed answer that combines insights from both sources.
    Make sure to synthesize the information coherently and cite whether information comes from documents or web search.
    If the search results aren't relevant, focus on the information from the documents.`;

    const response = await this.model.invoke(prompt);
    return response.content.toString().trim();
  }

  async chat(message: string, token: string, chatHistory: Array<HumanMessage | AIMessage> = []): Promise<string> {
    try {
      const agent = await agentService.getAgentByToken(token);
      if (!agent) {
        throw new Error('Invalid agent token');
      }

      const input: ChatInput = {
        question: message,
        chat_history: chatHistory,
        agentId: agent.id
      };

      // Execute the chain steps manually for better type safety
      const context = await this.getContext(input);
      const researchQuestion = await this.getResearchQuestion(message, context);
      const searchResults = await this.performWebSearch(researchQuestion);
      console.log(searchResults,"searchResults");
      const answer = await this.generateAnswer(message, context, searchResults);

      return answer;
    } catch (error) {
      console.error('Error in chat:', error);
      throw error;
    }
  }
} 