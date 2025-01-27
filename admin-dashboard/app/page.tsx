'use client';

import { SessionList } from './components/session/SessionList';
import { SessionDetails } from './components/session/SessionDetails';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { ErrorMessage } from './components/ui/ErrorMessage';
import { Modal } from './components/ui/Modal';
import { useSession } from './hooks/useSession';

export default function Home() {
  const { sessions, selectedSession, loading, error, fetchSessionDetails, clearSelectedSession } = useSession();

  const handleCloseModal = () => {
    clearSelectedSession();
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-[1920px] mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="text-sm text-gray-500">
            Total Sessions: {sessions.length}
          </div>
        </div>
        
        {loading && <LoadingSpinner />}
        {error && <ErrorMessage message={error} />}

        {!loading && !error && (
          <SessionList
            sessions={sessions}
            selectedSessionId={selectedSession?.id}
            onSessionSelect={fetchSessionDetails}
          />
        )}

        <Modal
          isOpen={!!selectedSession}
          onClose={handleCloseModal}
          title={`Session Details - ${selectedSession?.id || ''}`}
        >
          {selectedSession && <SessionDetails session={selectedSession} />}
        </Modal>
      </div>
    </div>
  );
}
