import { Message } from '@/app/types/sessions';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`rounded-lg p-4 max-w-[70%] ${
          message.role === 'user'
            ? 'bg-blue-50 text-blue-900'
            : 'bg-gray-50 text-gray-900'
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium">
            {message.role === 'user' ? 'User' : 'Assistant'}
          </span>
          <span className="text-xs text-gray-500" suppressHydrationWarning>
            {new Date(message.timestamp).toLocaleString()}
          </span>
        </div>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}; 