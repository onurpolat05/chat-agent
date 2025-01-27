import { Session } from '../../types/session';
import { UserInfo } from './UserInfo';
import { ChatHistory } from './ChatHistory';

interface SessionDetailsProps {
  session: Session;
}

export const SessionDetails = ({ session }: SessionDetailsProps) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-2">Session Details</h2>
      
      <UserInfo userMetadata={session.userMetadata} />

      <div className="text-sm text-gray-500 mb-4">
        <p>Created: {formatDate(session.createdAt)}</p>
        <p>Last Updated: {formatDate(session.updatedAt)}</p>
      </div>

      <ChatHistory messages={session.messages} />
    </div>
  );
}; 