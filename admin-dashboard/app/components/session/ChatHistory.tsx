import { Message } from '../../types/session';

interface ChatHistoryProps {
  messages: Message[];
}

export const ChatHistory = ({ messages }: ChatHistoryProps) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-md font-semibold">Chat History</h3>
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`p-3 rounded-lg ${
            msg.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold capitalize">{msg.role}</span>
            <span className="text-xs text-gray-500">
              {formatDate(msg.timestamp)}
            </span>
          </div>
          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
        </div>
      ))}
      {messages.length === 0 && (
        <p className="text-gray-500">No messages in this session</p>
      )}
    </div>
  );
}; 