import { z } from 'zod';

export const UserMetadataSchema = z.object({
  ipAddress: z.string(),
  userAgent: z.string(),
  device: z.object({
    type: z.string(),
    browser: z.string(),
    os: z.string(),
  }).optional(),
  location: z.object({
    country: z.string(),
    city: z.string(),
  }).optional(),
});

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
  userMetadata: UserMetadataSchema,
});

export type UserMetadata = z.infer<typeof UserMetadataSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type Session = z.infer<typeof SessionSchema>; 