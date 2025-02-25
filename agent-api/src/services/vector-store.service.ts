import { OpenAIEmbeddings } from '@langchain/openai';
import { FaissStore } from '@langchain/community/vectorstores/faiss';
import { Document } from '@langchain/core/documents';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { config } from '../config.js';
import path from 'path';
import fs from 'fs/promises';
import { DocumentLoaderFactory, SupportedFileType } from './document-loader.factory.js';

interface VectorStoreConfig {
  chunkSize?: number;
  chunkOverlap?: number;
  searchLimit?: number;
}

interface DocumentMetadata {
  agentId: string;
  fileType: SupportedFileType;
  fileName: string;
  timestamp: number;
  chunkSize: number;
}

export class VectorStoreService {
  private embeddings: OpenAIEmbeddings;
  private vectorStorePath: string;
  private readonly config: Required<VectorStoreConfig>;

  constructor(userConfig: VectorStoreConfig = {}) {
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: config.openai.apiKey,
      modelName: 'text-embedding-3-small',
    });
    this.vectorStorePath = path.join(process.cwd(), 'vector-store');
    this.config = {
      chunkSize: userConfig.chunkSize ?? 1000,
      chunkOverlap: userConfig.chunkOverlap ?? 200,
      searchLimit: userConfig.searchLimit ?? 4
    };
    this.ensureVectorStoreDirectory();
  }

  private async ensureVectorStoreDirectory() {
    try {
      await fs.access(this.vectorStorePath);
    } catch {
      await fs.mkdir(this.vectorStorePath, { recursive: true });
    }
  }

  async addDocument(filePath: string, agentId: string): Promise<void> {
    try {
      if (!DocumentLoaderFactory.isSupported(filePath)) {
        throw new Error(`Unsupported file type: ${path.extname(filePath)}`);
      }

      // Load the document using the factory
      const docs = await DocumentLoaderFactory.createLoader(filePath);

      // Split the documents
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: this.config.chunkSize,
        chunkOverlap: this.config.chunkOverlap,
        separators: ['\n\n', '\n', ' ', ''],
        keepSeparator: false
      });
      const splitDocs = await textSplitter.splitDocuments(docs);

      // Add metadata
      const metadata: DocumentMetadata = {
        agentId,
        fileType: DocumentLoaderFactory.getFileType(filePath),
        fileName: path.basename(filePath),
        timestamp: Date.now(),
        chunkSize: this.config.chunkSize,
      };

      const docsWithMetadata = splitDocs.map(doc => ({
        ...doc,
        metadata: { 
          ...doc.metadata,
          ...metadata
        },
      }));

      // Create or update the vector store
      const vectorStore = await this.getOrCreateVectorStore(docsWithMetadata);
      await vectorStore.save(this.vectorStorePath);

      console.log(`Successfully added document for agent ${agentId} with ${docsWithMetadata.length} chunks`);
    } catch (error: unknown) {
      console.error('Error adding document to vector store:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to add document: ${error.message}`);
      }
      throw new Error('Failed to add document: Unknown error');
    }
  }

  async removeDocument(documentId: string): Promise<void> {
    try {
      const vectorStore = await this.loadVectorStore();
      if (!vectorStore) return;

      // Filter out the specific document
      const docs = await vectorStore.similaritySearch('', this.config.searchLimit * 50);
      const filteredDocs = docs.filter(doc => doc.metadata.agentId !== documentId);

      if (filteredDocs.length === docs.length) {
        console.log(`No document found with ID ${documentId}`);
        return;
      }

      // Create new vector store with filtered documents
      await this.getOrCreateVectorStore(filteredDocs);
      console.log(`Successfully removed document ${documentId}`);
    } catch (error: unknown) {
      console.error('Error removing document from vector store:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to remove document: ${error.message}`);
      }
      throw new Error('Failed to remove document: Unknown error');
    }
  }

  async removeDocuments(agentId: string): Promise<void> {
    try {
      const vectorStore = await this.loadVectorStore();
      if (!vectorStore) return;

      // Filter out all documents for this agent
      const docs = await vectorStore.similaritySearch('', this.config.searchLimit * 50);
      const filteredDocs = docs.filter(doc => doc.metadata.agentId !== agentId);

      if (filteredDocs.length === docs.length) {
        console.log(`No documents found for agent ${agentId}`);
        return;
      }

      // Create new vector store with filtered documents
      await this.getOrCreateVectorStore(filteredDocs);
      console.log(`Successfully removed documents for agent ${agentId}`);
    } catch (error: unknown) {
      console.error('Error removing documents from vector store:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to remove documents: ${error.message}`);
      }
      throw new Error('Failed to remove documents: Unknown error');
    }
  }

  async similaritySearch(query: string, agentId: string, k?: number): Promise<Document[]> {
    try {
      const vectorStore = await this.loadVectorStore();
      if (!vectorStore) {
        return [];
      }

      const searchLimit = k ?? this.config.searchLimit;
      const results = await vectorStore.similaritySearch(query, searchLimit * 2, {
        filter: (doc: Document) => doc.metadata.agentId === agentId
      });
      console.log(results, 'results');

      // Sort by relevance and limit results
      return results
        .slice(0, searchLimit)
        .map(doc => ({
          ...doc,
          metadata: {
            ...doc.metadata,
            score: doc.metadata.score?.toFixed(3) // Skor bilgisini daha okunaklı hale getir
          }
        }));
    } catch (error: unknown) {
      console.error('Error performing similarity search:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to perform search: ${error.message}`);
      }
      throw new Error('Failed to perform search: Unknown error');
    }
  }

  private async loadVectorStore(): Promise<FaissStore | null> {
    try {
      return await FaissStore.load(
        this.vectorStorePath,
        this.embeddings
      );
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        console.log('No existing vector store found, will create new one on next operation');
        return null;
      }
      console.error('Error loading vector store:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to load vector store: ${error.message}`);
      }
      throw new Error('Failed to load vector store: Unknown error');
    }
  }

  private async getOrCreateVectorStore(docs: Document[]): Promise<FaissStore> {
    try {
      const existingStore = await this.loadVectorStore();
      if (existingStore) {
        // If store exists, add new documents
        await existingStore.addDocuments(docs);
        return existingStore;
      }

      // Create new store
      return await FaissStore.fromDocuments(docs, this.embeddings);
    } catch (error: unknown) {
      console.error('Error creating/updating vector store:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to create/update vector store: ${error.message}`);
      }
      throw new Error('Failed to create/update vector store: Unknown error');
    }
  }
} 