# Investor Chat Agent

An intelligent AI-powered chatbot system designed for investors, leveraging LangChain and OpenAI. The system processes investment documents and provides context-aware responses to investor queries with advanced memory management.

## Key Features

- **Smart Document Analysis**: Processes PDF documents and extracts relevant information
- **Context-Aware Responses**: Uses RAG (Retrieval Augmented Generation) for accurate answers
- **Memory Management**: Implements intelligent chat history management
  - Maintains last 10 messages for context
  - Prevents LLM context window overflow
  - Provides clear history functionality
- **Session-Based Conversations**: Manages multiple user sessions via Redis
- **Real-time Response Streaming**: Supports streaming responses for better UX
- **Type Safety**: Full TypeScript implementation with Zod validation

## Tech Stack

- **Runtime**: Node.js 20+ (ESM)
- **Language**: TypeScript 5.3
- **AI Framework**: LangChain 0.2
- **Vector DB**: HNSWLib (On-disk)
- **API Layer**: Hono (Edge-ready)
- **Session Store**: Redis (Upstash)
- **Model**: GPT-4 Mini

## Prerequisites

- Node.js >= 18.0.0
- Redis instance
- OpenAI API key
- PDF documents for analysis

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/investor-chat-agent.git
cd investor-chat-agent
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
OPENAI_API_KEY=your_api_key_here
REDIS_URL=your_redis_url_here
PORT=3000
NODE_ENV=development
VECTOR_STORE_PATH=./vector-store
```

## Development

Start the development server:
```bash
npm run dev
```

## API Endpoints

### POST /session
Creates a new chat session.

Response:
```json
{
  "sessionId": "uuid-string"
}
```

### GET /session/:id
Retrieves session details and chat history.

Response:
```json
{
  "id": "session-id",
  "messages": [
    {
      "role": "user|assistant",
      "content": "message content",
      "timestamp": "timestamp"
    }
  ],
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### POST /chat
Sends a question and receives an AI response.

Request:
```json
{
  "sessionId": "session-id",
  "question": "your question here"
}
```

Response:
```json
{
  "answer": "AI response",
  "sources": [
    {
      "page": 1,
      "content": "relevant content"
    }
  ]
}
```

## Project Structure

```
src/
├── chains/                 # LangChain compositions
│   ├── retrieval.chain.ts  # Main QA chain with memory
│   └── safety.chain.ts     # Content filtering
│
├── services/
│   ├── vector-store.service.ts  # Document processing
│   ├── session.service.ts       # Redis interactions
│   └── monitoring.service.ts    # System monitoring
│
├── routes/
│   ├── chat.router.ts      # Chat endpoints
│   └── session.router.ts   # Session management
│
├── types/
│   ├── session.type.ts     # Type definitions
│   └── api.type.ts         # API schemas
│
└── config.ts               # Configuration
```

## Memory Management

The system implements intelligent memory management to maintain conversation context while preventing token limit issues:

- Keeps last 10 messages in conversation history
- Automatically filters older messages
- Provides manual history clearing option
- Session-based isolation for multiple users

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- LangChain team for the excellent framework
- OpenAI for the GPT models
- Hono team for the performant web framework 