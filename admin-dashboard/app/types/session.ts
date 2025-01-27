export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface UserMetadata {
  ipAddress: string;
  userAgent: string;
  device?: {
    type: string;
    browser: string;
    os: string;
  };
  location?: {
    country: string;
    city: string;
  };
}

export interface Session {
  id: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  userMetadata: UserMetadata;
}

export interface SessionListItem {
  id: string;
  lastMessage: string;
  messageCount: number;
  userMetadata: UserMetadata;
  createdAt: number;
  updatedAt: number;
} 