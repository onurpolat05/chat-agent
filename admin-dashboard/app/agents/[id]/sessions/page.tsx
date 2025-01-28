'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AgentDetails, Session, TabType } from '@/app/types/sessions';
import { PageHeader } from '@/app/components/sessions/PageHeader';
import { AgentInfoCard } from '@/app/components/sessions/AgentInfoCard';
import { TabNavigation } from '@/app/components/sessions/TabNavigation';
import { SessionCard } from '@/app/components/sessions/SessionCard';
import { SessionDetailModal } from '@/app/components/sessions/SessionDetailModal';
import { RagDetails } from '@/app/components/sessions/RagDetails';

export default function AgentSessionsPage() {
  const params = useParams();
  const [data, setData] = useState<AgentDetails | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('sessions');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/admin/agents/${params.id}/details`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  const handleSessionClick = async (sessionId: string) => {
    try {
      setSessionLoading(true);
      const response = await fetch(`http://localhost:3000/api/admin/sessions/${sessionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch session details');
      }
      const sessionData = await response.json();
      setSelectedSession(sessionData);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Error fetching session details:', err);
    } finally {
      setSessionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Error: {error || 'No data available'}</div>
      </div>
    );
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
                      onClick={handleSessionClick}
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
          onClose={() => {
            setIsModalOpen(false);
            setSelectedSession(null);
          }}
        />
      )}
    </div>
  );
} 
