import { ChatOpenAI } from '@langchain/openai';
import { RunnableSequence, RunnablePassthrough } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { Document } from '@langchain/core/documents';
import { ChatMessageHistory } from "@langchain/community/stores/message/in_memory";
import { BaseMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { CONFIG } from '../config.js';

const SYSTEM_TEMPLATE = `You are a highly knowledgeable AI investment advisor representing our company. Your role is to provide detailed, professional insights about our project to potential investors.

Key Guidelines:
1. Language Adaptation: Always respond in the same language the investor used for their question
2. Professional Tone: Maintain a confident, professional, and trustworthy communication style
3. Investment Focus: Frame responses from an investor's perspective, highlighting:
   - Business value propositions
   - Market opportunities
   - Growth potential
   - Technical advantages
   - Revenue models
   - Competitive advantages

4. Response Structure:
   - Start with a clear, direct answer
   - Support with relevant data from the context
   - Include specific examples when available
   - Conclude with investment-relevant implications

5. Important Rules:
   - Be transparent about both opportunities and challenges
   - Never make up information not present in the context
   - If uncertain, acknowledge limitations and suggest areas for further discussion
   - Keep responses concise but comprehensive
   - Use industry-standard terminology appropriately

Use the following context to provide accurate, investor-focused responses. Remember to maintain the language used by the investor in their question.`;

export class RetrievalChain {
  private static instance: RetrievalChain;
  private chain: RunnableSequence;
  private messageHistory: ChatMessageHistory;
  private readonly MAX_HISTORY_LENGTH = 10; // Keep last 10 messages

  private constructor() {
    const model = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      temperature: 0.7,
      openAIApiKey: CONFIG.openai.apiKey,
    });

    this.messageHistory = new ChatMessageHistory();

    // Function to filter messages to keep only recent history
    const filterMessages = (messages: BaseMessage[]) => messages.slice(-this.MAX_HISTORY_LENGTH);

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", SYSTEM_TEMPLATE],
      new MessagesPlaceholder("chat_history"),
      ["human", "{question}"],
      ["system", "Context: {context}"],
    ]);

    this.chain = RunnableSequence.from([
      RunnablePassthrough.assign({
        context: (input: { context: Document[]; question: string }) => 
          input.context.map(doc => doc.pageContent).join('\n\n'),
        question: (input: { context: Document[]; question: string }) => input.question,
        chat_history: async () => {
          const messages = await this.messageHistory.getMessages();
          return filterMessages(messages);
        },
      }),
      prompt,
      model,
      new StringOutputParser(),
    ]);
  }

  static getInstance(): RetrievalChain {
    if (!RetrievalChain.instance) {
      RetrievalChain.instance = new RetrievalChain();
    }
    return RetrievalChain.instance;
  }

  async call(context: Document[], question: string): Promise<string> {
    // Add user question to history
    await this.messageHistory.addMessage(new HumanMessage(question));
    
    // Generate response
    const answer = await this.chain.invoke({ context, question });
    
    // Add AI response to history
    await this.messageHistory.addMessage(new AIMessage(answer));
    
    return answer;
  }

  // Method to clear chat history if needed
  async clearHistory(): Promise<void> {
    await this.messageHistory.clear();
  }
} 