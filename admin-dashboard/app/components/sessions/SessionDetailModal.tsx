import { Session } from '@/app/types/sessions';
import { ChatMessage } from './ChatMessage';

interface SessionDetailModalProps {
  session: Session;
  isLoading?: boolean;
  onClose: () => void;
}

export const SessionDetailModal = ({ session, isLoading, onClose }: SessionDetailModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Session Details</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Session ID</p>
                    <p className="font-medium">{session.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Created At</p>
                    <p className="font-medium" suppressHydrationWarning>
                      {new Date(session.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Device</p>
                    <p className="font-medium">
                      {session.userMetadata.device.type} ({session.userMetadata.device.os})
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Browser</p>
                    <p className="font-medium">{session.userMetadata.device.browser}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {session.messages?.map((message, index) => (
                  <ChatMessage key={index} message={message} />
                ))}
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                <span className="font-medium">IP:</span> {session.userMetadata.ipAddress} |
                <span className="font-medium ml-2">User Agent:</span> {session.userMetadata.userAgent}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}; 