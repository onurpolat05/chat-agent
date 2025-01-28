import { useState, useCallback } from 'react';

export type LoadingState = Record<string, boolean>;

export const useLoadingState = (initialState: LoadingState = {}) => {
  const [loadingStates, setLoadingStates] = useState<LoadingState>(initialState);

  const setLoading = useCallback((key: string, isLoading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: isLoading }));
  }, []);

  const withLoading = useCallback(async <T>(key: string, operation: () => Promise<T>): Promise<T> => {
    try {
      setLoading(key, true);
      return await operation();
    } finally {
      setLoading(key, false);
    }
  }, [setLoading]);

  const isLoading = useCallback((key: string) => loadingStates[key] ?? false, [loadingStates]);

  const anyLoading = useCallback(() => Object.values(loadingStates).some(Boolean), [loadingStates]);

  return {
    loadingStates,
    setLoading,
    withLoading,
    isLoading,
    anyLoading,
  };
}; 