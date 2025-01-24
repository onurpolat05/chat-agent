sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant SessionManager
    participant VectorStore
    participant LLM
    
    User->>Frontend: Opens chat widget
    Frontend->>API: POST /session (gen sessionId)
    API->>SessionManager: Create new session
    SessionManager-->>API: sessionId
    API-->>Frontend: 201 Created
    
    loop Chat Interaction
        User->>Frontend: Asks question
        Frontend->>API: POST /chat {sessionId, question}
        API->>SessionManager: Get session history
        SessionManager->>VectorStore: Semantic search
        VectorStore-->>SessionManager: Relevant chunks
        SessionManager->>LLM: Generate response
        LLM-->>SessionManager: Stream response
        SessionManager->>SessionManager: Update history
        SessionManager-->>API: Stream chunks
        API-->>Frontend: SSE stream
    end
    
    Note over SessionManager: Check history length ≥5
    SessionManager->>LLM: Summarize history
    LLM-->>SessionManager: Summary
    SessionManager->>SessionManager: Reset history