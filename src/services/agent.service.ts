import { v4 as uuidv4 } from 'uuid';
import { Agent, CreateAgentDto } from '../types/agent.type.js';
import { VectorStoreService } from './vector-store.service.js';
import { DocumentLoaderFactory } from './document-loader.factory.js';
import { sessionService } from './session.service.js';
import path from 'path';
import fs from 'fs/promises';

// Helper type for public agent data
type PublicAgent = Omit<Agent, 'token'> & { maskedToken: string };

class AgentService {
  private agents: Map<string, Agent> = new Map();
  private readonly vectorStoreService: VectorStoreService;
  private readonly uploadDir = path.join(process.cwd(), 'uploads');
  private readonly dataDir = path.join(process.cwd(), 'data');
  private readonly agentsFile = path.join(this.dataDir, 'agents.json');

  constructor() {
    this.vectorStoreService = new VectorStoreService();
    this.ensureDirectories();
    this.loadAgents();
  }

  private async ensureDirectories() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
    try {
      await fs.access(this.dataDir);
    } catch {
      await fs.mkdir(this.dataDir, { recursive: true });
    }
  }

  private async loadAgents() {
    try {
      const data = await fs.readFile(this.agentsFile, 'utf-8');
      const agents = JSON.parse(data) as Agent[];
      this.agents = new Map(agents.map(agent => [agent.id, agent]));
    } catch (error) {
      console.log('No existing agents found, starting with empty state');
      this.agents = new Map();
    }
  }

  private async saveAgents() {
    const agents = Array.from(this.agents.values());
    await fs.writeFile(this.agentsFile, JSON.stringify(agents, null, 2));
  }

  private maskToken(token: string): string {
    if (!token) return '********';
    if (token.length <= 8) return '*'.repeat(token.length);
    return `${token.slice(0, 4)}${'*'.repeat(token.length - 8)}${token.slice(-4)}`;
  }

  toPublicAgent(agent: Agent): PublicAgent {
    const { token, ...rest } = agent;
    return {
      ...rest,
      maskedToken: this.maskToken(token)
    };
  }

  async createAgent(dto: CreateAgentDto): Promise<Agent> {
    const id = uuidv4();
    const token = uuidv4();
    const timestamp = new Date().toISOString();

    // Process all files
    const fileResults = await Promise.all(dto.files.map(async (file) => {
      // Validate file type
      if (!DocumentLoaderFactory.isSupported(file.originalname)) {
        throw new Error(`Unsupported file type: ${path.extname(file.originalname)}`);
      }

      // Save the file
      const fileName = `${uuidv4()}-${file.originalname}`;
      const filePath = path.join(this.uploadDir, fileName);
      await fs.writeFile(filePath, file.buffer);

      // Process the document for RAG
      await this.vectorStoreService.addDocument(filePath, id);

      return {
        fileName,
        fileType: DocumentLoaderFactory.getFileType(file.originalname)
      };
    }));

    const agent: Agent = {
      id,
      name: dto.name,
      token,
      createdAt: timestamp,
      files: fileResults.map(result => ({
        path: result.fileName,
        type: result.fileType
      }))
    };

    this.agents.set(id, agent);
    await this.saveAgents();
    return agent;
  }

  async getAgents(): Promise<PublicAgent[]> {
    return Array.from(this.agents.values()).map(agent => this.toPublicAgent(agent));
  }

  private getOriginalAgent(id: string): Agent | null {
    return this.agents.get(id) || null;
  }

  async getAgentById(id: string): Promise<PublicAgent | null> {
    const agent = this.getOriginalAgent(id);
    if (!agent) return null;
    return this.toPublicAgent(agent);
  }

  async getAgentByToken(token: string): Promise<PublicAgent | null> {
    for (const agent of this.agents.values()) {
      if (agent.token === token) {
        return this.toPublicAgent(agent);
      }
    }
    return null;
  }

  async getAgentToken(id: string): Promise<string | null> {
    const agent = this.getOriginalAgent(id);
    if (!agent) return null;
    return agent.token;
  }

  async deleteAgent(id: string): Promise<boolean> {
    const agent = this.agents.get(id);
    if (!agent) return false;

    try {
      // 1. Delete associated files
      if (agent.files && Array.isArray(agent.files)) {
        await Promise.all(agent.files.map(async (file) => {
          try {
            await fs.unlink(path.join(this.uploadDir, file.path));
          } catch (error) {
            console.error(`Error deleting file ${file.path}:`, error);
            // Continue with other deletions even if one file fails
          }
        }));
      }

      // 2. Remove from vector store
      try {
        await this.vectorStoreService.removeDocuments(id);
      } catch (error) {
        console.error('Error removing documents from vector store:', error);
        // Continue with deletion even if vector store cleanup fails
      }

      // 3. Clean up associated sessions
      try {
        const sessions = await sessionService.getSessionsByAgentId(id);
        if (sessions && Array.isArray(sessions)) {
          await Promise.all(sessions.map(session => 
            sessionService.deleteSession(session.id)
          ));
        }
      } catch (error) {
        console.error('Error cleaning up sessions:', error);
        // Continue with deletion even if session cleanup fails
      }

      // 4. Delete agent from map and save
      this.agents.delete(id);
      await this.saveAgents();
      
      return true;
    } catch (error) {
      console.error('Error in agent deletion:', error);
      throw new Error('Failed to complete agent deletion');
    }
  }
}

export const agentService = new AgentService(); 
