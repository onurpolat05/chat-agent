import { z } from 'zod';

export const ChatRequestSchema = z.object({
  sessionId: z.string(),
  question: z.string(),
});

export const ChatResponseSchema = z.object({
  answer: z.string(),
  sources: z.array(z.object({
    page: z.number(),
    content: z.string(),
  })),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type ChatResponse = z.infer<typeof ChatResponseSchema>; 