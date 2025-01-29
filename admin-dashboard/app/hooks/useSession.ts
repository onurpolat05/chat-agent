import { useState, useEffect } from 'react';
import { sessionService } from '../services/session.service';
import { type Session } from '../types/sessions';

export const useSession = (sessionId: string) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const data = await sessionService.getSession(sessionId);
        setSession(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch session');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  return {
    session,
    isLoading,
    error,
  };
}; 