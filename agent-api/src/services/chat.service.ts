import { ChatOpenAI } from "@langchain/openai";
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { config } from "../config.js";
import { VectorStoreService } from "./vector-store.service.js";
import { agentService } from "./agent.service.js";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import {
  RunnableSequence,
  RunnablePassthrough,
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
 
    });
    this.vectorStoreService = new VectorStoreService();
    this.initializeChain();
  }

  private initializeChain() {
    // Define the system prompt for product analysis
    const productAnalysisPrompt = `Conduct an in-depth analysis of a single Amazon ASIN data point, incorporating customer review sentiment that is relevant to the target marketplace and recent in time. This analysis should refine profitability and risk assessment, and identify potential opportunities, considering domain-specific and time-sensitive customer feedback. This agent will provide a comprehensive report and be capable of follow-up analysis based on user prompts. The input data format is a dictionary containing detailed ASIN data, including keys such as: 'asin', 'targetDomain', 'sourceDomain', 'targetTitle', 'targetPrice', 'buyingPrice', 'referralFee', 'fbaFee', 'closingFee', 'profit', 'profitPercentage', 'salesRank', 'targetSellerCount', 'hasAmazonSeller', 'amazonSellerStock', 'reviewCount', 'targetStarCount', 'lastMonthSalesOn', 'salesCountPerMonth', 'salesCountPer3Month', 'fbaSellerCount', 'fbaSellerStockCount', 'hasFbaSeller', 'hasBuyBox', 'isBestSeller', 'isAmazonChoice', 'isBuyBoxPrime', 'isSubscribeAndSave', 'width', 'length', 'height', 'weight', 'hasHazmat', 'hasMedical', 'hasIpClaim', 'eligibleToSell', 'reviewStatus', 'stockStatus', 'badges', 'matchedBrands', 'matchedKeywords', 'matchedSellers', 'matchedAmazonGlobalStores', 'amazonSellerStock', 'systemFee', 'isInInventory', 'isInArchivedInventory', 'isInBlackList', 'isInBlockedAllDomains', 'customerCost', 'isVariant', 'variationCount', 'outOfStockStatus', 'isProductTitleSuitable', 'hasBrandSeller', 'bbPriceStable', 'hasVariation', 'amazonSold', 'comment', 'globalCode', 'imagePAth', 'promotionInfo', 'warehouseFee', 'referralFeePercentage', 'hasSameTitle', and optionally 'customer_reviews' which is a list of review dictionaries as provided in the example. All currency values are in USD.`;

    // Define the system prompt for Amazon arbitrage
    const arbitragePrompt = `You are an AI assistant specializing in Amazon arbitrage trading. Your task is to provide insights and strategies for successful arbitrage trading on Amazon, including tips on sourcing products, pricing strategies, and market analysis.`;

    // Create the prompt templates
    const productPromptTemplate = ChatPromptTemplate.fromMessages([
      ["system", productAnalysisPrompt],
      new MessagesPlaceholder("chat_history"),
      ["human", "{question}"],
    ]);

    const arbitragePromptTemplate = ChatPromptTemplate.fromMessages([
      ["system", arbitragePrompt],
      new MessagesPlaceholder("chat_history"),
      ["human", "{question}"],
    ]);

    // Create the RAG chains
    this.ragChain = RunnableSequence.from([
      RunnablePassthrough.assign({
        context: async (input: {
          question: string;
          chat_history: Array<HumanMessage | AIMessage>;
          agentId: string;
          productInfo?: string;
          productsReviews?: any;
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
      productPromptTemplate,
      this.model,
      // Convert the response to string
      (response) => response.content.toString(),
    ]);
  }

  async chat(
    message: string,
    token: string,
    chatHistory: Array<HumanMessage | AIMessage> = [],
    productInfo?: string,
    productsReviews?: any
  ): Promise<string> {
    try {
      // Get agent by token
      const agent = await agentService.getAgentByToken(token);
      if (!agent) {
        throw new Error("Invalid agent token");
      }

      // Determine which prompt to use based on the presence of productInfo and productsReviews
      let response;
      if (productInfo && productsReviews) {
        // Use product analysis prompt
        response = await this.ragChain.invoke({
          question: message + " " + productInfo,
          chat_history: chatHistory,
          agentId: agent.id,
          productsReviews: productsReviews,
        });
      } else {
        // Use arbitrage prompt
        response = await this.ragChain.invoke({
          question: message,
          chat_history: chatHistory,
          agentId: agent.id,
        });
      }

      return response;
    } catch (error) {
      console.error("Error in chat:", error);
      throw error;
    }
  }
}
