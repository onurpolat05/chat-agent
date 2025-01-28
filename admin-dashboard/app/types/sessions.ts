export interface DeviceInfo {
  type: string;
  browser: string;
  os: string;
}

export interface UserMetadata {
  ipAddress: string;
  userAgent: string;
  device: DeviceInfo;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Session {
  id: string;
  agentId: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  userMetadata: UserMetadata;
}

export interface Agent {
  id: string;
  name: string;
  token: string;
  createdAt: string;
  pdfPath: string;
}

export interface AgentDetails {
  agent: Agent;
  sessions: Session[];
}

export type TabType = 'sessions' | 'rag'; 