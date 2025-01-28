import { SupportedFileType } from '../services/document-loader.factory.js';

export interface AgentFile {
  path: string;
  type: SupportedFileType;
}

export interface Agent {
  id: string;
  name: string;
  token: string;
  createdAt: string;
  files: AgentFile[];
}

export interface CreateAgentDto {
  name: string;
  files: Express.Multer.File[];
} 