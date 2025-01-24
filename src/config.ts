import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  OPENAI_API_KEY: z.string(),
  REDIS_URL: z.string(),
  PORT: z.string().transform(Number),
  NODE_ENV: z.enum(['development', 'production']),
  VECTOR_STORE_PATH: z.string(),
});

const env = envSchema.parse(process.env);

export const CONFIG = {
  openai: {
    apiKey: env.OPENAI_API_KEY,
  },
  redis: {
    url: env.REDIS_URL,
  },
  server: {
    port: env.PORT,
    isDev: env.NODE_ENV === 'development',
  },
  vectorStore: {
    path: env.VECTOR_STORE_PATH,
  },
} as const; 