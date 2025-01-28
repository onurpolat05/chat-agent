'use client';

import { useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { TabType } from '@/app/types/sessions';
import { PageHeader } from '@/app/components/sessions/PageHeader';
import { AgentInfoCard } from '@/app/components/sessions/AgentInfoCard';
import { TabNavigation } from '@/app/components/sessions/TabNavigation';
import { SessionCard } from '@/app/components/sessions/SessionCard';
import { SessionDetailModal } from '@/app/components/sessions/SessionDetailModal';
import { RagDetails } from '@/app/components/sessions/RagDetails';
import { useAgentSessions } from '@/app/hooks/useAgentSessions';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const ErrorDisplay = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="text-red-600">Error: {message}</div>
  </div>
);

function AgentSessionsContent() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState<TabType>('sessions');
  
  const {
    data,
    loading,
    error,
    selectedSession,
    isModalOpen,
    sessionLoading,
    handleSessionClick,
    closeModal,
  } = useAgentSessions({ agentId: params.id as string });

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !data) {
    return <ErrorDisplay message={error || 'No data available'} />;
  }

  const { agent, sessions } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <PageHeader />
        <AgentInfoCard agent={agent} />

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="p-6">
            {activeTab === 'sessions' ? (
              sessions.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No sessions found for this agent
                </div>
              ) : (
                <div className="space-y-6">
                  {sessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      onClick={() => !sessionLoading && handleSessionClick(session.id)}
                      disabled={sessionLoading}
                    />
                  ))}
                </div>
              )
            ) : (
              <RagDetails agent={agent} />
            )}
          </div>
        </div>
      </div>

      {isModalOpen && selectedSession && (
        <SessionDetailModal
          session={selectedSession}
          isLoading={sessionLoading}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

export default function AgentSessionsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AgentSessionsContent />
    </Suspense>
  );
} 
