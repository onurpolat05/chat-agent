import React from 'react';
import { ChatWidget } from './components/chat/ChatWidget';
import './App.css';

interface AppProps {
  apiKey: string;
  chatPosition?: 'left' | 'right';
  defaultMessage?: string;
}

function App({ apiKey, chatPosition = 'right', defaultMessage }: AppProps) {
  return (
    <div className="App">
      <ChatWidget
        apiKey={apiKey}
        position={chatPosition}
        defaultMessage={defaultMessage}
      />
    </div>
  );
}

export default App;
