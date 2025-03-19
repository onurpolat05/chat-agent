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
    const xmlSystemPrompt = `
    <system_prompts>
    <agent_prompt>
        <role>Advanced ASIN Profitability, Risk, Opportunity, and Customer Sentiment Analyzer (Domain & Time-Sensitive Reviews)</role>
        <task>Conduct an in-depth analysis of a single Amazon ASIN data point, incorporating customer review sentiment that is relevant to the target marketplace and recent in time. This analysis should refine profitability and risk assessment, and identify potential opportunities, considering domain-specific and time-sensitive customer feedback.</task>
        <output_format>
          **1. Executive Summary:**  
          A concise overview of the ASIN's potential, incorporating customer sentiment insights from the target domain and recent reviews.

          **2. Profitability Analysis:**
          - Profit Metrics: {{profit}} USD, {{profitPercentage}}%
          - Fee Breakdown: Referral Fee: {{referralFee}} USD, FBA Fee: {{fbaFee}} USD, Closing Fee: {{closingFee}} USD
          - Customer Cost Impact: {{customerCost}} USD
          - Profitability Assessment: [Excellent/Good/Borderline/Poor/Negative]

          **3. Sales and Demand Analysis:**
          - Sales Rank & Potential: Rank #{{salesRank}}
          - Review Metrics: {{targetStarCount}} stars, {{targetReviewCount}} reviews
          - Badges: {{badges}}

          **4. Customer Review Analysis:**
          - Recent Domain-Specific Reviews Summary
          - Key Positive Themes
          - Key Negative Themes
          - Sentiment Impact Assessment

          **5. Competition Analysis:**
          - Seller Landscape Overview
          - Competition Level Assessment
          - Buy Box Analysis

          **6. Risk Assessment:**
          - Financial Risks
          - Competition Risks
          - Product-Specific Risks
          - Overall Risk Level

          **7. Operational Considerations:**
          - Dimensions: {{width}}x{{length}}x{{height}} {{unit}}
          - Weight: {{weight}} {{weightUnit}}
          - Inventory Status

          **8. Recommendations and Next Steps:**
          - Strategic Recommendation
          - Action Items

          **9. Follow-Up Questions:**
          Ready for specific inquiries about any aspect of this analysis.

          **10. Raw Data Summary:**
          Key metrics and data points used in analysis.
        </output_format>
        {context}
    </agent_prompt>
</system_prompts>`;

    const arbitragePrompt = `
<system_prompts>
  <agent_prompt>
    <role>Amazon Arbitrage Strategy Advisor</role>
    <task>Provide expert guidance on Amazon arbitrage opportunities, market analysis, and strategic recommendations.</task>
    <output_format>
      **1. Market Overview:**
      - Current Market Conditions
      - Opportunity Assessment
      
      **2. Strategy Recommendations:**
      - Sourcing Strategies
      - Pricing Optimization
      - Risk Management
      
      **3. Action Steps:**
      - Immediate Actions
      - Long-term Planning
      
      **4. Additional Considerations:**
      - Market Trends
      - Competition Analysis
      
      **5. Follow-Up:**
      Ready for specific questions about any aspect of the strategy.
    </output_format>
    {context}
  </agent_prompt>
</system_prompts>`;

    // Create the prompt templates
    const productPromptTemplate = ChatPromptTemplate.fromMessages([
      ["system", xmlSystemPrompt],
      new MessagesPlaceholder("chat_history"),
      ["human", "{question}"],
    ]);

    const arbitragePromptTemplate = ChatPromptTemplate.fromMessages([
      ["system", arbitragePrompt],
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
          productInfo?: string;
          productsReviews?: any;
        }) => {
          const relevantDocs = await this.vectorStoreService.similaritySearch(
            input.question,
            input.agentId,
            8
          );
          return formatDocumentsAsString(relevantDocs);
        },
      }),
      async (input) => {
        // Choose template based on input type
        const template = input.productInfo && input.productsReviews 
          ? productPromptTemplate 
          : arbitragePromptTemplate;
        
        // Format the data for XML structure if product analysis
        if (input.productInfo && input.productsReviews) {
          const formattedData = this.formatDataForXML(input.productInfo, input.productsReviews);
          return template.format({
            ...input,
            question: `${input.question}\n\nProduct Data:\n${formattedData}`
          });
        }
        
        return template.format(input);
      },
      this.model,
      (response) => response.content.toString(),
    ]);
  }

  private formatDataForXML(productInfo: string, productsReviews: any): string {
    try {
      const productData = JSON.parse(productInfo);
      const reviewsData = JSON.parse(productsReviews);
      
      return JSON.stringify({
        product: productData,
        reviews: reviewsData
      }, null, 2);
    } catch (error) {
      console.error("Error formatting data for XML:", error);
      return `${productInfo}\n${JSON.stringify(productsReviews, null, 2)}`;
    }
  }

  async chat(
    message: string,
    token: string,
    chatHistory: Array<HumanMessage | AIMessage> = [],
    productInfo?: string,
    productsReviews?: any
  ): Promise<string> {
    try {
      const agent = await agentService.getAgentByToken(token);
      if (!agent) {
        throw new Error("Invalid agent token");
      }

      const response = await this.ragChain.invoke({
        question: message,
        chat_history: chatHistory,
        agentId: agent.id,
        productInfo,
        productsReviews,
      });

      return response;
    } catch (error) {
      console.error("Error in chat:", error);
      throw error;
    }
  }
}
