import dotenv from "dotenv";

dotenv.config();

interface Config {
  port: number;
  openai: {
    apiKey: string;
  };
  ai: {
    model: string;
  };
  apify: {
    apiKey: string;
  };
  cors: {
    origins: string[];
  };
}

export const config: Config = {
  port: parseInt(process.env.PORT || "3000", 10),
  openai: {
    apiKey: process.env.OPENAI_API_KEY || "",
  },
  ai: {
    model: process.env.AI_MODEL || "o3-mini",
  },
  cors: {
    origins: process.env.CORS_ORIGINS?.split(",") || [
      "http://localhost:3001",
      "http://localhost:3002",
      "http://localhost:3003",
      "http://localhost:3004",
    ],
  },
  apify: {
    apiKey: process.env.APIFY_API_KEY || "",
  },
};
