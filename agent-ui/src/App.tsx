import React from 'react';
import { ChatWidget } from './components/chat/ChatWidget';
import './App.css';

interface AppProps {
  apiKey: string;
  chatPosition?: 'left' | 'right';
  defaultMessage?: string;
  fetchOnOpen?: boolean;
}

function App({ apiKey, chatPosition = 'right', defaultMessage, fetchOnOpen = true }: AppProps) {
  return (
    <div className="App">
      <ChatWidget
        apiKey={apiKey}
        position={chatPosition}
        defaultMessage={defaultMessage}
        fetchOnOpen={fetchOnOpen}
      />
    </div>
  );
}

export default App;
