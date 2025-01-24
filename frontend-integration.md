# Frontend Integration Guide for Investor Chat Agent

This guide explains how to integrate the Investor Chat Agent into your Next.js application using Cursor.

## Project Structure

Add a new `frontend` directory to your project:

```
investor-chat-agent/
├── backend/          # Your existing backend code
└── frontend/         # New Next.js frontend
    ├── src/
    │   ├── components/
    │   │   ├── ChatBot/
    │   │   │   ├── ChatBubble.tsx
    │   │   │   ├── ChatInput.tsx
    │   │   │   └── ChatWidget.tsx
    │   │   └── Layout/
    │   │       └── MainLayout.tsx
    │   ├── hooks/
    │   │   └── useChat.ts
    │   ├── types/
    │   │   └── chat.types.ts
    │   └── utils/
    │       └── api.ts
    └── app/
        └── layout.tsx
```

## Setup Instructions

1. Create Next.js project in the frontend directory:
```bash
npx create-next-app@latest frontend --typescript --tailwind --eslint
cd frontend
```

2. Install required dependencies:
```bash
npm install @tanstack/react-query axios framer-motion react-icons
```

3. Configure environment variables in `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Component Implementation

### 1. Chat Types (`src/types/chat.types.ts`)
```typescript
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface ChatResponse {
  answer: string;
  sources: {
    page: number;
    content: string;
  }[];
}
```

### 2. API Utilities (`src/utils/api.ts`)
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export const chatApi = {
  createSession: async () => {
    const { data } = await api.post('/session');
    return data;
  },

  sendMessage: async (sessionId: string, question: string) => {
    const { data } = await api.post('/chat', {
      sessionId,
      question,
    });
    return data;
  },

  getSession: async (sessionId: string) => {
    const { data } = await api.get(`/session/${sessionId}`);
    return data;
  },
};
```

### 3. Chat Hook (`src/hooks/useChat.ts`)
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '@/utils/api';
import { useState, useEffect } from 'react';

export const useChat = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Initialize session
  useEffect(() => {
    const initSession = async () => {
      const { sessionId } = await chatApi.createSession();
      setSessionId(sessionId);
      localStorage.setItem('chatSessionId', sessionId);
    };

    const savedSessionId = localStorage.getItem('chatSessionId');
    if (savedSessionId) {
      setSessionId(savedSessionId);
    } else {
      initSession();
    }
  }, []);

  // Get chat history
  const { data: chatHistory } = useQuery({
    queryKey: ['chatHistory', sessionId],
    queryFn: () => sessionId ? chatApi.getSession(sessionId) : null,
    enabled: !!sessionId,
  });

  // Send message mutation
  const { mutate: sendMessage } = useMutation({
    mutationFn: (question: string) =>
      chatApi.sendMessage(sessionId!, question),
    onSuccess: () => {
      queryClient.invalidateQueries(['chatHistory', sessionId]);
    },
  });

  return {
    sessionId,
    chatHistory,
    sendMessage,
  };
};
```

### 4. Chat Widget Component (`src/components/ChatBot/ChatWidget.tsx`)
```typescript
import { useState } from 'react';
import { useChat } from '@/hooks/useChat';
import { motion, AnimatePresence } from 'framer-motion';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { chatHistory, sendMessage } = useChat();

  return (
    <motion.div
      className="fixed bottom-4 right-4 z-50"
      initial={false}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="bg-white rounded-lg shadow-xl w-96 h-[600px] flex flex-col"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            <div className="flex-1 overflow-y-auto p-4">
              {chatHistory?.messages.map((message, index) => (
                <ChatBubble
                  key={index}
                  message={message}
                />
              ))}
            </div>
            <ChatInput onSend={sendMessage} />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg"
      >
        {isOpen ? 'Close Chat' : 'Open Chat'}
      </button>
    </motion.div>
  );
};
```

### 5. Layout Integration (`src/app/layout.tsx`)
```typescript
import { ChatWidget } from '@/components/ChatBot/ChatWidget';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
          <ChatWidget />
        </QueryClientProvider>
      </body>
    </html>
  );
}
```

## Features

- **Persistent Sessions**: Chat sessions are saved in localStorage
- **Real-time Updates**: Uses React Query for efficient data fetching
- **Smooth Animations**: Framer Motion for smooth transitions
- **Responsive Design**: Works on all screen sizes
- **Type Safety**: Full TypeScript support

## Best Practices

1. **Error Handling**:
   - Implement error boundaries
   - Add loading states
   - Show error messages to users

2. **Performance**:
   - Use React Query's caching
   - Implement virtual scrolling for long chat histories
   - Lazy load chat components

3. **Accessibility**:
   - Add ARIA labels
   - Ensure keyboard navigation
   - Support screen readers

4. **State Management**:
   - Use React Query for server state
   - Local state for UI components
   - Persist important data in localStorage

## Development Workflow

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

3. Access your application at `http://localhost:3001`

## Customization

### Styling
The chat widget uses Tailwind CSS for styling. Customize the appearance by:

1. Modifying the Tailwind classes
2. Adding custom CSS in `globals.css`
3. Using CSS modules for component-specific styles

### Theme
Update `tailwind.config.js` to match your brand colors:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          // ... other shades
          900: '#0c4a6e',
        },
      },
    },
  },
};
```

## Testing

1. Add test files for components:
```bash
npm install -D @testing-library/react @testing-library/jest-dom
```

2. Create test files:
```typescript
// src/components/ChatBot/__tests__/ChatWidget.test.tsx
import { render, screen } from '@testing-library/react';
import { ChatWidget } from '../ChatWidget';

describe('ChatWidget', () => {
  it('renders chat button', () => {
    render(<ChatWidget />);
    expect(screen.getByText('Open Chat')).toBeInTheDocument();
  });
});
``` 