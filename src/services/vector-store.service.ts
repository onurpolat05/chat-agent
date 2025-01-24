import { OpenAIEmbeddings } from '@langchain/openai';
import { Document } from '@langchain/core/documents';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { HNSWLib } from '@langchain/community/vectorstores/hnswlib';
import { CONFIG } from '../config';
import * as path from 'path';
import * as fs from 'fs';

export class VectorStoreService {
  private static instance: VectorStoreService;
  private vectorStore: HNSWLib | null = null;
  private readonly vectorStorePath = path.join(process.cwd(), 'vector-store');
  private readonly indexPath = path.join(this.vectorStorePath, 'hnswlib.index');
  private readonly embeddings: OpenAIEmbeddings;

  private constructor() {
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: CONFIG.openai.apiKey,
    });
    // Initialize vector store when service is created
    this.initializeVectorStore().catch(console.error);
  }

  static getInstance(): VectorStoreService {
    if (!VectorStoreService.instance) {
      VectorStoreService.instance = new VectorStoreService();
    }
    return VectorStoreService.instance;
  }

  private async initializeVectorStore(): Promise<void> {
    try {
      // Create vector-store directory if it doesn't exist
      if (!fs.existsSync(this.vectorStorePath)) {
        fs.mkdirSync(this.vectorStorePath, { recursive: true });
      }

      // Check if vector store already exists
      if (fs.existsSync(this.indexPath)) {
        console.log('Loading existing vector store...');
        this.vectorStore = await HNSWLib.load(
          this.vectorStorePath,
          this.embeddings
        );
        console.log('Vector store loaded successfully');
        return;
      }

      // If vector store doesn't exist, create it from PDF
      console.log('Creating new vector store from PDF...');
      await this.createNewVectorStore();
    } catch (error) {
      console.error('Failed to initialize vector store:', error);
      throw error;
    }
  }

  private async createNewVectorStore(): Promise<void> {
    const pdfPath = path.join(process.cwd(), 'docs', 'TradeWizz-IMEN.pdf');
    const loader = new PDFLoader(pdfPath);
    const rawDocs = await loader.load();
    
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    
    const splitDocs = await textSplitter.splitDocuments(rawDocs);
    
    this.vectorStore = await HNSWLib.fromDocuments(
      splitDocs,
      this.embeddings,
      {
        space: 'cosine', // Cosine similarity for better matching
        numDimensions: 1536, // OpenAI embeddings dimension
      }
    );

    // Save the vector store
    await this.vectorStore.save(this.vectorStorePath);
    console.log('Vector store created and saved successfully');
  }

  async similaritySearch(query: string, k = 4): Promise<Document[]> {
    if (!this.vectorStore) {
      await this.initializeVectorStore();
    }
    
    if (!this.vectorStore) {
      throw new Error('Vector store initialization failed');
    }
    
    return this.vectorStore.similaritySearch(query, k);
  }

  // Add method to force refresh the vector store
  async refreshVectorStore(): Promise<void> {
    console.log('Refreshing vector store...');
    if (fs.existsSync(this.vectorStorePath)) {
      fs.rmSync(this.vectorStorePath, { recursive: true });
    }
    await this.createNewVectorStore();
  }
} 