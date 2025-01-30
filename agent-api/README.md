# Investor Chat Agent

A smart chatbot that helps investors by using AI technology. It can read investment documents and answer questions about them using OpenAI and LangChain.

## Main Features

- Reads and understands  documents
- Gives accurate answers using document context
- Handles multiple user conversations at once
- Shows responses in real-time
- Built with TypeScript for reliability

## Technology Used

- Node.js 20+
- TypeScript 5.3
- Express.js for API server
- LangChain and OpenAI for AI features
- PDF Parser for document processing
- Zod for validation
- Morgan for logging
- CORS for API security
- UUID for session management
- Multer for file uploads

## Setup Requirements

- Node.js 18 or newer
- Redis database
- OpenAI API key
- PDF documents

## How to Install

1. Get the project:
```bash
https://github.com/onurpolat05/chat-agent
cd chat-agent
```

2. Install needed packages:
```bash
npm install
```

3. Set up environment file (.env):
```env
OPENAI_API_KEY=your_api_key_here
PORT=3000
NODE_ENV=development
AI_MODEL=gpt-4o
CORS_ORIGINS=http://localhost:3001
```

## Development

To start the project:
```bash
npm run dev
```

## Main API Endpoints

- `POST /session`: Start a new chat
- `GET /session/:id`: Get chat history
- `POST /chat`: Send questions and get answers

## Project Structure

```
src/
├── services/     # Handles data and business logic
├── routes/       # API endpoints
├── types/        # TypeScript definitions
├── index.ts      # Main application file
└── config.ts     # Settings
```

## Features

- Keeps track of recent messages
- Manages multiple users at once
- Provides clear and relevant answers
- Safely handles user data

## License

This project uses the MIT License.

## Credits

Thanks to:
- LangChain
- OpenAI
- Hono 