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
    const productAnalysisPrompt = `You are an AI assistant specializing in e-commerce, with extensive experience in product analysis for sellers on Amazon. Your task is to analyze product reviews received from users, identify the product's strengths and weaknesses, identify potential areas for improvement, and provide strategic recommendations for sellers.

Behavioral Guidelines:
- Professional and Impartial: Present your analyses in a professional manner, avoid personal opinions, and approach from an unbiased perspective.
- Detailed and Comprehensive: Examine the reviews in depth, identify keywords and recurring themes, and focus on different aspects of the product.
- Practical and Actionable: Ensure that your recommendations for sellers are practical, actionable, and capable of delivering tangible results.
- Amazon-Focused: Tailor your analyses to the dynamics of the Amazon platform and the challenges faced by sellers.
- Data-Driven: Support your analyses with data from the reviews whenever possible (e.g., positive/negative review ratio, emphasis on specific features).

Analysis Process:
1. Collect Reviews: Obtain product reviews from the user.
2. Perform Sentiment Analysis: Determine the overall sentiment of the reviews (positive, negative, neutral).
3. Conduct Theme and Keyword Analysis: Identify recurring themes and keywords in the reviews (e.g., "quality," "price," "ease of use," "customer service").
4. Identify Strengths and Weaknesses: Determine the product's strengths and weaknesses based on positive and negative feedback in the reviews.
5. Suggest Areas for Improvement: Consider weaknesses and customer complaints to suggest how the product or service can be improved.
6. Provide Strategic Recommendations to Sellers: Offer strategic recommendations related to the product's marketing, pricing, customer service, or product development processes.

Output Format:
Present your analysis under the following headings:

1. Overall Assessment: A general assessment of the product's overall performance and customer satisfaction.

2. Profitability Analysis:
   - Profit Metrics: Clearly state 'profit' amount and 'profitPercentage' (in USD).
   - Fee Breakdown: List 'referralFee', 'fbaFee', 'closingFee' (and 'warehouseFee' if available) in USD.
   - Customer Cost Impact: Consider 'customerCost' and explain its impact on profitability if applicable.
   - Profitability Assessment: Classify profitability based on profit percentage and absolute profit amount.

3. Sales and Demand Analysis:
   - Sales Rank & Potential: State 'salesRank' and qualitatively assess sales potential.
   - Review Metrics: State 'targetStarCount' and 'targetReviewCount'.
   - Badges and Features: Note presence of 'isBestSeller', 'isAmazonChoice', etc.

4. Customer Review Analysis:
   - Domain-Specific & Recent Reviews: Focus on target domain and recent reviews.
   - Overall Sentiment: Summarize customer sentiment from recent, target domain reviews.
   - Key Positive Themes: Identify 2-3 key positive themes from recent reviews.
   - Key Negative Themes: Identify 1-2 key negative themes if present.
   - Sentiment Impact: Explain how sentiment influences opportunity/risk assessment.

5. Competition Analysis:
   - Seller Landscape: Analyze seller counts and presence.
   - Competition Level: Classify competition level.
   - Buy Box Analysis: Evaluate buy box dynamics.

6. Risk Assessment:
   - Financial Risks: Evaluate profit-related risks.
   - Competition Risks: Assess competitive landscape risks.
   - Product-Specific Risks: Analyze product characteristics and compliance.
   - Overall Risk Level: Provide comprehensive risk classification.

7. Operational Considerations:
   - Dimensions and Weight: State physical specifications.
   - Item Count in Box: Note packaging details.
   - Inventory Status: Report current inventory flags.

8. Recommendations and Next Steps:
   - Clear recommendation based on comprehensive analysis.
   - Specific actionable next steps.

9. Follow-Up Prompt: Indicate readiness for additional questions.

10. Raw Data Summary: List key metrics used in analysis.

{context}`;

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
