'use client';

import { useAgents } from './hooks/useAgents';
import { AgentList } from './components/agent/AgentList';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { ErrorMessage } from './components/ui/ErrorMessage';

export default function Home() {
  const { agents, isLoading, error, createAgent, deleteAgent } = useAgents();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <AgentList 
          agents={agents} 
          onCreateAgent={createAgent} 
          onDeleteAgent={deleteAgent}
        />
      </div>
    </main>
  );
}
