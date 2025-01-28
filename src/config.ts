import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  openai: {
    apiKey: string;
  };
  cors: {
    origins: string[];
  };
}

export const config: Config = {
  port: parseInt(process.env.PORT || '3000', 10),
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },
  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3001'],
  },
}; 