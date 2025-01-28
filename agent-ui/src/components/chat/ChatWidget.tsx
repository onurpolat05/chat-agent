import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import { useChat } from '../../hooks/useChat';
import { Message } from '../../types/chat.types';
import './ChatWidget.css';

interface ChatWidgetProps {
  apiKey: string;
  position?: 'left' | 'right';
  defaultMessage?: string;
}

export function ChatWidget({ apiKey, position = 'right', defaultMessage }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const { messages, isLoading, error, sendMessage, initSession, sessionId, sendWelcomeMessage } = useChat(apiKey, defaultMessage);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to bottom when messages change or chat opens
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && !sessionId) {
      initSession();
    }
  }, [isOpen, sessionId, initSession]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedText = inputText.trim();
    if (!trimmedText || isLoading) return;

    setInputText('');
    await sendMessage(trimmedText);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`chat-widget ${position}`}>
      <div className={`chat-container ${isOpen ? 'open' : ''}`}>
        <button onClick={toggleChat} className="close-button">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
        {error && <div className="error-banner">{error}</div>}
        <div className="messages-container">
          {messages.length === 0 && !isLoading && (
            <button onClick={sendWelcomeMessage} className="welcome-button">
              Karşılama mesajı gönder
            </button>
          )}
          {messages.map((message: Message, index: number) => (
            <div
              key={`${message.timestamp}-${index}`}
              className={`message ${message.role === 'user' ? 'user' : 'agent'}`}
            >
              {message.content}
            </div>
          ))}
          {isLoading && (
            <div className="message agent loading">
              <span className="loading-dots">...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSubmit} className="input-form">
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="message-input"
            disabled={isLoading}
          />
          <button type="submit" className="send-button" disabled={isLoading}>
            Send
          </button>
        </form>
      </div>
      {!isOpen && (
        <button onClick={toggleChat} className="chat-toggle-button">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
          </svg>
        </button>
      )}
    </div>
  );
} 
