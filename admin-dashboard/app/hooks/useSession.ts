import { useState, useEffect } from 'react';
import { Session, SessionListItem } from '../types/session';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const useSession = () => {
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/sessions`);
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }
      const data = await response.json();
      setSessions(data.sessions);
    } catch (err) {
      setError('Failed to fetch sessions');
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionDetails = async (sessionId: string) => {
    if (!sessionId) {
      setSelectedSession(null);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/session/${sessionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch session details');
      }
      const data = await response.json();
      setSelectedSession(data);
    } catch (err) {
      console.error('Error fetching session details:', err);
      setError('Failed to fetch session details');
    }
  };

  const clearSelectedSession = () => {
    setSelectedSession(null);
  };

  return {
    sessions,
    selectedSession,
    loading,
    error,
    fetchSessionDetails,
    fetchSessions,
    clearSelectedSession
  };
}; 