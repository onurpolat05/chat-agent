import { useState, useCallback, useEffect } from 'react';
import { Message } from '../types/chat.types';
import { chatApi } from '../api/chat';

const STORAGE_KEY = 'chat_session_id';
const DEFAULT_WELCOME_MESSAGE = 'Merhaba! Size nasıl yardımcı olabilirim?';

export function useChat(apiKey: string, customWelcomeMessage?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY);
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addWelcomeMessage = useCallback(() => {
    const welcomeMessage: Message = {
      role: 'assistant',
      content: customWelcomeMessage || DEFAULT_WELCOME_MESSAGE,
      timestamp: Date.now(),
    };
    setMessages([welcomeMessage]);
  }, [customWelcomeMessage]);

  // Load chat history when component mounts if we have a sessionId
  useEffect(() => {
    const loadChatHistory = async () => {
      if (sessionId) {
        try {
          setIsLoading(true);
          const session = await chatApi.getSession(sessionId, apiKey);
          if (session.messages.length === 0) {
            addWelcomeMessage();
          } else {
            setMessages(session.messages);
          }
        } catch (err) {
          console.error('Failed to load chat history:', err);
          localStorage.removeItem(STORAGE_KEY);
          setSessionId(null);
          setMessages([]);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadChatHistory();
  }, [sessionId, apiKey, addWelcomeMessage]);

  const initSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (sessionId) {
        try {
          const session = await chatApi.getSession(sessionId, apiKey);
          if (session.messages.length === 0) {
            addWelcomeMessage();
          } else {
            setMessages(session.messages);
          }
          return;
        } catch (err) {
          localStorage.removeItem(STORAGE_KEY);
          setSessionId(null);
        }
      }

      const { sessionId: newSessionId } = await chatApi.createSession(apiKey);
      setSessionId(newSessionId);
      localStorage.setItem(STORAGE_KEY, newSessionId);
      
      const session = await chatApi.getSession(newSessionId, apiKey);
      if (session.messages.length === 0) {
        addWelcomeMessage();
      } else {
        setMessages(session.messages);
      }
    } catch (err) {
      setError('Failed to initialize chat session');
      console.error('Failed to initialize chat session:', err);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, apiKey, addWelcomeMessage]);

  const sendMessage = useCallback(async (message: string) => {
    if (!sessionId || !message.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: message.trim(),
      timestamp: Date.now(),
    };

    try {
      setMessages((prev: Message[]) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      const response = await chatApi.sendMessage(sessionId, message, apiKey);
      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };
      setMessages((prev: Message[]) => [...prev, assistantMessage]);
    } catch (err) {
      setError('Failed to send message');
      console.error('Failed to send message:', err);
      setMessages((prev: Message[]) => prev.filter(msg => msg !== userMessage));
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, apiKey]);

  const sendWelcomeMessage = useCallback(async () => {
    if (!sessionId) return;
    setIsLoading(true);
    
    try {
      const response = await chatApi.sendMessage(sessionId, 'welcome', apiKey);
      const welcomeMessage: Message = {
        role: 'assistant',
        content: response || customWelcomeMessage || DEFAULT_WELCOME_MESSAGE,
        timestamp: Date.now(),
      };
      setMessages((prev: Message[]) => [...prev, welcomeMessage]);
    } catch (err) {
      console.error('Failed to send welcome message:', err);
      // If API fails, still add default welcome message
      addWelcomeMessage();
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, apiKey, addWelcomeMessage, customWelcomeMessage]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    initSession,
    sessionId,
    sendWelcomeMessage,
  };
} 
