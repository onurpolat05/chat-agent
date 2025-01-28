import { apiClient, getCached } from '../lib/api-client';
import { type Session, type Agent, type AgentDetails } from '../types/sessions';

export interface CreateAgentDto {
  name: string;
  files: File[];
}

class AgentService {
  private readonly baseUrl = '/api/admin/agents';

  async getAgents(): Promise<Agent[]> {
    return await getCached('agents', async () => {
      const { data } = await apiClient.get<Agent[]>(this.baseUrl);
      return data;
    });
  }

  async getAgentById(id: string): Promise<Agent> {
    return await getCached(`agent_${id}`, async () => {
      const { data } = await apiClient.get<Agent>(`${this.baseUrl}/${id}`);
      return data;
    });
  }

  async getAgentToken(id: string): Promise<{ token: string }> {
    const { data } = await apiClient.get<{ token: string }>(`${this.baseUrl}/${id}/token`);
    return data;
  }

  async createAgent(dto: CreateAgentDto): Promise<Agent> {
    const formData = new FormData();
    formData.append('name', dto.name);
    dto.files.forEach(file => {
      formData.append('files', file);
    });

    const { data } = await apiClient.post<Agent>(this.baseUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Invalidate agents cache after creating new agent
    await getCached.invalidate('agents');
    return data;
  }

  async deleteAgent(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
    // Invalidate related caches
    await getCached.invalidate('agents');
    await getCached.invalidate(`agent_${id}`);
    await getCached.invalidate(`agent_sessions_${id}`);
  }

  async getAgentSessions(id: string): Promise<Session[]> {
    return await getCached(`agent_sessions_${id}`, async () => {
      const { data } = await apiClient.get<Session[]>(`${this.baseUrl}/${id}/sessions`);
      return data;
    });
  }

  async getAgentDetails(id: string): Promise<AgentDetails> {
    return await getCached(`agent_details_${id}`, async () => {
      const { data } = await apiClient.get<AgentDetails>(
        `${this.baseUrl}/${id}/details`
      );
      return data;
    });
  }
}

export const agentService = new AgentService(); 
