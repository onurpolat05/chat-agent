import { v4 as uuidv4 } from 'uuid';
import { Session, Message, SessionMetadata, UserMetadata } from '../types/session.type.js';
import path from 'path';
import fs from 'fs/promises';

class SessionService {
  private sessions: Map<string, Session> = new Map();
  private readonly dataDir = path.join(process.cwd(), 'data');
  private readonly sessionsFile = path.join(this.dataDir, 'sessions.json');

  constructor() {
    this.ensureDirectories();
    this.loadSessions();
  }

  private async ensureDirectories() {
    try {
      await fs.access(this.dataDir);
    } catch {
      await fs.mkdir(this.dataDir, { recursive: true });
    }
  }

  private async loadSessions() {
    try {
      const data = await fs.readFile(this.sessionsFile, 'utf-8');
      const sessions = JSON.parse(data) as Session[];
      this.sessions = new Map(sessions.map(session => [session.id, session]));
    } catch (error) {
      console.log('No existing sessions found, starting with empty state');
      this.sessions = new Map();
    }
  }

  private async saveSessions() {
    const sessions = Array.from(this.sessions.values());
    await fs.writeFile(this.sessionsFile, JSON.stringify(sessions, null, 2));
  }

  async createSession(agentId: string, userMetadata: UserMetadata): Promise<Session> {
    const session: Session = {
      id: uuidv4(),
      agentId,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      userMetadata
    };

    this.sessions.set(session.id, session);
    await this.saveSessions();
    return session;
  }

  async getSession(id: string): Promise<Session | null> {
    return this.sessions.get(id) || null;
  }

  async addMessage(sessionId: string, message: Omit<Message, 'timestamp'>): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const timestamp = Date.now();
    session.messages.push({ ...message, timestamp });
    session.updatedAt = timestamp;
    await this.saveSessions();
  }

  async getSessionsByAgentId(agentId: string): Promise<SessionMetadata[]> {
    return Array.from(this.sessions.values())
      .filter(session => session.agentId === agentId)
      .map(session => ({
        id: session.id,
        agentId: session.agentId,
        lastMessage: session.messages[session.messages.length - 1]?.content || '',
        messageCount: session.messages.length,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      }))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async deleteSession(id: string): Promise<boolean> {
    const deleted = this.sessions.delete(id);
    if (deleted) {
      await this.saveSessions();
    }
    return deleted;
  }
}

export const sessionService = new SessionService(); 