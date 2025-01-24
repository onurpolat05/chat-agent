src/
├── chains/                  # LangChain compositions
│   ├── retrieval.chain.ts
│   ├── summarization.chain.ts
│   └── safety.chain.ts
│
├── services/
│   ├── vector-store.service.ts  # PDF processing
│   ├── session.service.ts       # Redis interactions
│   └── monitoring.service.ts    # Prometheus metrics
│
├── routes/
│   ├── chat.router.ts       # POST /chat
│   ├── session.router.ts    # POST /session
│   └── health.router.ts     # GET /health
│
├── types/
│   ├── session.type.ts      # Zod schemas
│   └── api.type.ts          # Response types
│
├── utils/
│   ├── stream.util.ts       # SSE helpers
│   └── error.util.ts        # Custom errors
│
├── index.ts                 # App entry
└── config.ts                # Env config