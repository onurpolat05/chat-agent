import { SessionListItem } from '../../types/session';

interface SessionListProps {
  sessions: SessionListItem[];
  selectedSessionId?: string;
  onSessionSelect: (sessionId: string) => void;
}

export const SessionList = ({ sessions, selectedSessionId, onSessionSelect }: SessionListProps) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const truncateMessage = (message: string, maxLength: number = 100) => {
    if (message.length <= maxLength) return message;
    return `${message.substring(0, maxLength)}...`;
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Active Sessions ({sessions.length})</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => onSessionSelect(session.id)}
            className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
              selectedSessionId === session.id ? 'border-blue-500 bg-blue-50' : ''
            }`}
          >
            <div className="flex flex-col h-full">
              <div className="mb-2">
                <p className="font-mono text-xs text-gray-500 mb-1 truncate">ID: {session.id}</p>
                <p className="text-sm font-medium mb-1 truncate">
                  {session.userMetadata?.device?.browser || 'Unknown'} on {session.userMetadata?.device?.os || 'Unknown'}
                </p>
                <p className="text-xs text-gray-600 mb-2">
                  IP: {session.userMetadata?.ipAddress}
                </p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Messages: {session.messageCount}</span>
                  <span>{formatDate(session.updatedAt)}</span>
                </div>
              </div>
              {session.lastMessage && (
                <div className="mt-auto">
                  <div className="border-t pt-2">
                    <p className="font-medium text-xs text-gray-500 mb-1">Last Message:</p>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {truncateMessage(session.lastMessage)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {sessions.length === 0 && (
          <div className="col-span-full">
            <p className="text-gray-500 text-center">No active sessions found</p>
          </div>
        )}
      </div>
    </div>
  );
}; 