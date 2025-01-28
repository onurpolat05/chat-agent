import { useState, useEffect } from 'react';
import { type AgentDetails, type Session } from '../types/sessions';
import { agentService } from '../services/agent.service';
import { sessionService } from '../services/session.service';

interface UseAgentSessionsProps {
  agentId: string;
}

interface UseAgentSessionsReturn {
  data: AgentDetails | null;
  loading: boolean;
  error: string | null;
  selectedSession: Session | null;
  isModalOpen: boolean;
  sessionLoading: boolean;
  handleSessionClick: (sessionId: string) => Promise<void>;
  closeModal: () => void;
}

export const useAgentSessions = ({ agentId }: UseAgentSessionsProps): UseAgentSessionsReturn => {
  const [data, setData] = useState<AgentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await agentService.getAgentDetails(agentId);
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (agentId) {
      fetchData();
    }

    return () => {
      isMounted = false;
    };
  }, [agentId]);

  const handleSessionClick = async (sessionId: string) => {
    if (sessionLoading) return;
    
    try {
      setSessionLoading(true);
      const sessionData = await sessionService.getSession(sessionId);
      setSelectedSession(sessionData);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Error fetching session details:', err);
    } finally {
      setSessionLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSession(null);
  };

  return {
    data,
    loading,
    error,
    selectedSession,
    isModalOpen,
    sessionLoading,
    handleSessionClick,
    closeModal,
  };
}; 