import { createClient } from 'redis';
import { CONFIG } from '../config.js';
import { Message, Session } from '../types/session.type.js';
import { v4 as uuidv4 } from 'uuid';

export class SessionService {
  private static instance: SessionService;
  private client;
  private isConnected: boolean = false;

  private constructor() {
    this.client = createClient({
      url: CONFIG.redis.url
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      console.log('Redis Client Connected');
      this.isConnected = true;
    });

    this.client.connect().catch(console.error);
  }

  static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  private async ensureConnection() {
    if (!this.isConnected) {
      try {
        await this.client.connect();
      } catch (error) {
        console.error('Failed to connect to Redis:', error);
        //throw new Error('Redis connection failed');
      }
    }
  }

  async createSession(): Promise<string> {
    await this.ensureConnection();
    
    const sessionId = uuidv4();
    const session: Session = {
      id: sessionId,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await this.client.set(`session:${sessionId}`, JSON.stringify(session));
    return sessionId;
  }

  async getSession(sessionId: string): Promise<Session | null> {
    await this.ensureConnection();
    
    const data = await this.client.get(`session:${sessionId}`);
    if (!data) {
      console.log(`Session not found: ${sessionId}`);
      return null;
    }
    return JSON.parse(data);
  }

  async addMessage(sessionId: string, message: Omit<Message, 'timestamp'>): Promise<void> {
    await this.ensureConnection();
    
    const session = await this.getSession(sessionId);
    if (!session) {
      console.error(`Session not found: ${sessionId}`);
      throw new Error('Session not found');
    }

    const timestamp = Date.now();
    console.log(`Adding message to session ${sessionId}:`, {
      role: message.role,
      content: message.content.substring(0, 100) + '...',
      timestamp: new Date(timestamp).toLocaleString()
    });

    const updatedSession: Session = {
      ...session,
      messages: [...session.messages, { ...message, timestamp }],
      updatedAt: timestamp
    };

    await this.client.set(`session:${sessionId}`, JSON.stringify(updatedSession));
    console.log(`Message added successfully to session ${sessionId}`);
  }
} 