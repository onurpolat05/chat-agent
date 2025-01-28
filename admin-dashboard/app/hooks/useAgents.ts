'use client';

import { useState, useEffect } from 'react';

interface Agent {
  id: string;
  name: string;
  token: string;
  createdAt: string;
}

export const useAgents = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents');
      if (!response.ok) throw new Error('Failed to fetch agents');
      const data = await response.json();
      setAgents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch agents');
    } finally {
      setIsLoading(false);
    }
  };

  const createAgent = async (name: string, files: File[]) => {
    try {
      const formData = new FormData();
      formData.append('name', name);
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/agents', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create agent');
      }
      
      const newAgent = await response.json();
      setAgents((prev) => [...prev, newAgent]);
      return newAgent;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create agent');
      throw err;
    }
  };

  const deleteAgent = async (id: string) => {
    try {
      const response = await fetch(`/api/agents/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Agent not found');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete agent');
      }

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