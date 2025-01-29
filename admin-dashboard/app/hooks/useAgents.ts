'use client';

import { useState, useEffect } from 'react';
import { agentService } from '../services/agent.service';
import { type Agent } from '../types/sessions';

export const useAgents = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = async () => {
    try {
      const data = await agentService.getAgents();
      setAgents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch agents');
    } finally {
      setIsLoading(false);
    }
  };

  const createAgent = async (name: string, files: File[]) => {
    try {
      const newAgent = await agentService.createAgent({ name, files });
      setAgents((prev) => [...prev, newAgent]);
      return newAgent;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create agent');
      throw err;
    }
  };

  const deleteAgent = async (id: string) => {
    try {
      await agentService.deleteAgent(id);
      setAgents((prev) => prev.filter(agent => agent.id !== id));
    } catch (err) {
      console.error('Delete agent error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete agent');
      throw err;
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  return {
    agents,
    isLoading,
    error,
    createAgent,
    deleteAgent,
    refreshAgents: fetchAgents,
  };
}; 