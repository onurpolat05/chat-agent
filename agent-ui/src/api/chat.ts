import axios from 'axios';
import { ChatSession, ChatApiResponse, SessionResponse, SessionData } from '../types/chat.types';

const createApi = (apiKey: string) => axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'x-agent-token': apiKey
  }
});

export const chatApi = {
  createSession: async (apiKey: string): Promise<SessionResponse> => {
    const api = createApi(apiKey);
    const { data } = await api.post<SessionResponse>('/sessions');
    return data;
  },

  sendMessage: async (sessionId: string, message: string, apiKey: string,userPrompt?: string): Promise<string> => {
    const api = createApi(apiKey);
    const { data } = await api.post<ChatApiResponse>(`/chat/${sessionId}`, {
      message,
      userPrompt
    });
    return data.response;
  },

  getSession: async (sessionId: string, apiKey: string): Promise<ChatSession> => {
    const api = createApi(apiKey);
    const { data } = await api.get<SessionData>(`/sessions/${sessionId}`);
    return data.session;
  },
}; 