import { z } from 'zod';

// Chat
export const ChatRequestSchema = z.object({
  message: z.string(),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;

export interface ChatResponse {
  response: string;
}

// Agent
export const CreateAgentRequestSchema = z.object({
  name: z.string(),
});

export type CreateAgentRequest = z.infer<typeof CreateAgentRequestSchema>;

export interface Agent {
  id: string;
  name: string;
  token: string;
  createdAt: string;
  pdfPath: string;
}

export interface CreateAgentResponse {
  agent: Agent;
}

export interface ListAgentsResponse {
  agents: Agent[];
} 