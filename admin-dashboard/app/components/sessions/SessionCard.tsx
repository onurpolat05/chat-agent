import { Session } from '@/app/types/sessions';
import { ChatMessage } from './ChatMessage';

export interface SessionCardProps {
  session: Session;
  onClick: (sessionId: string) => void;
  disabled?: boolean;
}

export const SessionCard = ({ session, onClick, disabled }: SessionCardProps) => {
  return (
    <div 
      className={`p-4 border rounded-lg hover:shadow-md transition-all duration-200 ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
      onClick={() => !disabled && onClick(session.id)}
    >
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Session Details</h3>
            <p className="text-sm text-gray-500">ID: {session.id}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500" suppressHydrationWarning>
              {new Date(session.createdAt).toLocaleString()}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Device: {session.userMetadata.device.type} ({session.userMetadata.device.os})
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4">
        <div className="space-y-4">
          {session.messages?.map((message, index) => (
            <ChatMessage key={`${session.id}-${index}`} message={message} />
          ))}
        </div>
      </div>

      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <span className="font-medium">IP:</span> {session.userMetadata.ipAddress} |
          <span className="font-medium ml-2">Browser:</span> {session.userMetadata.device.browser} |
          <span className="font-medium ml-2">User Agent:</span> {session.userMetadata.userAgent}
        </div>
      </div>
    </div>
  );
}; 