## Core Stack
- **Runtime**: Node.js 20+ (ESM)
- **Language**: TypeScript 5.3
- **AI Framework**: LangChain 0.2
- **Vector DB**: HNSWLib (On-disk)
- **API Layer**: Hono (Edge-ready)
- **Session Store**: Redis (Upstash)

## Critical Packages
```json
{
  "dependencies": {
    "@langchain/core": "^0.2.0",
    "@langchain/openai": "^0.1.0",
    "hnswlib-node": "^0.10.0",
    "hono": "^4.3.0",
    "redis-om": "^0.4.0",
    "pdf-parse": "^1.1.1",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "typescript": "5.3.3",
    "@types/node": "20.11.0",
    "tsx": "^4.7.0",
    "wrangler": "^3.25.0"
  }
}
```

## Development Tools
- **Testing**: Jest
- **CI/CD**: GitHub Actions
- **Documentation**: OpenAPI/Swagger

## Infrastructure
- **Deployment**: Cloudflare Workers
- **Vector Store**: Local HNSW
- **Session Store**: Upstash Redis