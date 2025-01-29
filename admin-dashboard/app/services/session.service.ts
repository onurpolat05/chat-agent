import { apiClient, getCached } from '../lib/api-client';
import { type Session } from '../types/sessions';

class SessionService {
  private readonly baseUrl = '/admin/sessions';

  async getSession(id: string): Promise<Session> {
    return await getCached(`session_${id}`, async () => {
      const { data } = await apiClient.get<Session>(`${this.baseUrl}/${id}`);
      return data;
    });
  }

  async getSessionsByAgentId(agentId: string): Promise<Session[]> {
    return await getCached(`agent_sessions_${agentId}`, async () => {
      const { data } = await apiClient.get<Session[]>(`/agents/${agentId}/sessions`);
      return data;
    });
  }

  async deleteSession(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
    // Invalidate related caches
    await getCached.invalidate(`session_${id}`);
    // Also invalidate the agent's sessions cache
    const session = await this.getSession(id);
    await getCached.invalidate(`agent_sessions_${session.agentId}`);
  }
}

export const sessionService = new SessionService(); 
