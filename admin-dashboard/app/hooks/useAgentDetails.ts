import { useState, useEffect } from 'react';
import { agentService } from '../services/agent.service';
import { type AgentDetails } from '../types/sessions';

export const useAgentDetails = (agentId: string) => {
  const [data, setData] = useState<AgentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgentDetails = async () => {
      try {
        const details = await agentService.getAgentDetails(agentId);
        setData(details);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch agent details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgentDetails();
  }, [agentId]);

  return {
    data,
    isLoading,
    error,
  };
}; 