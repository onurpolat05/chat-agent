import { z } from 'zod';

export const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  timestamp: z.number(),
});

export const SessionSchema = z.object({
  id: z.string(),
  messages: z.array(MessageSchema),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type Message = z.infer<typeof MessageSchema>;
export type Session = z.infer<typeof SessionSchema>; 