import { ChatOpenAI } from '@langchain/openai';
import { RunnableSequence, RunnablePassthrough } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { Document } from '@langchain/core/documents';
import { ChatMessageHistory } from "@langchain/community/stores/message/in_memory";
import { BaseMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { CONFIG } from '../config';

const SYSTEM_TEMPLATE = `You are a helpful AI assistant that answers investor questions based on the provided context.
Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say that you don't know, don't try to make up an answer.`;

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