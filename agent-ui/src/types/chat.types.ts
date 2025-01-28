export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface ChatApiResponse {
  response: string;
}

export interface SessionResponse {
  sessionId: string;
}

export interface SessionData {
  session: ChatSession;
} 