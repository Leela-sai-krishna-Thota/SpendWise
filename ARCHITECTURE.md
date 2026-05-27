# ARCHITECTURE.md

This document outlines the system architecture, stack decisions, execution data flows, and scalability roadmaps for the StackWise AI Spend Audit tool.

---

## 1. System Topology (Mermaid Diagram)

```mermaid
graph TD
    Client[Browser Client - React SPA] <-->|JSON Rest API / HTTPS| Server[Express Backend - Cloud Run]
    
    subgraph Express Security & Services
        RateLimiterInput[Express-Rate-Limit]
        HoneypotCheck[Honeypot Middleware]
        DB[SQLite / File Store]
        GeminiService[Gemini API - GoogleGenAI SDK]
    end

    Client -->|1. Submit Audit Payload| HoneypotCheck
    HoneypotCheck -->|2. Check if clean| RateLimiterInput
    RateLimiterInput -->|3. Save Audit & Lead| DB
    RateLimiterInput -->|4. Request Summary| GeminiService
    GeminiService -->|5. Return Paragraph| RateLimiterInput
    RateLimiterInput -->|6. JSON Response with Audit ID| Client

    ClientRoute[Browser /share/:id] -->|Request anonymized details| Server
    Server -->|Read from DB (no email/company info)| ClientRoute
```

---

## 2. End-to-End Data Flow (Input to Result)

1. **Local State Capture**: The user inputs tool counts, seats, and use-cases in the React frontend. State is synced immediately to `localStorage` to guard against refreshing.
2. **Calculated Local Arithmetic**: Our hardcoded math engine computes current monthly spend, optimized spend, and annual savings.
3. **Payload Submission**: The user registers their email. The client creates a batch payload:
   ```json
   {
     "email": "lead@startup.com",
     "companyName": "Acme Inc",
     "teamSize": 12,
     "primaryUseCase": "coding",
     "tools": { "cursor": { "plan": "pro", "seats": 10, "currentSpend": 200 } },
     "math": { "currentSpend": 200, "optimizedSpend": 120, "savings": 80 },
     "honeypot": ""
   }
   ```
4. **Server Validation**: `server.ts` checks that `honeypot` is empty and that rates are below rate limits.
5. **LLM Synthesis**: The server uses `@google/genai` to call `gemini-3.5-flash`. It passes the computed savings data to generate the ~100-word summary paragraph safely.
6. **Stripped Persistence**: The server generates a unique UUID (e.g., `audit-7ab9...`). It stores two fields in the database:
   - **Private Lead Database**: Stores `{ id, email, companyName, tools, savings }`
   - **Public Shared Database**: Stores `{ id, tools, savings, primaryUseCase }` (Anonymized: no emails or company labels!).
7. **Viral Client Landing**: The server returns the UUID. The frontend shifts to `/share/:id`. This URL parses the anonymized record, rendering the beautiful sharing charts without exposing private credentials.

---

## 3. Tech Stack Justifications

- **Frontend: React + Vite + Tailwind CSS**: Extremely fast compilation, tiny bundle footings, and highly expressive CSS utility structures. Gives our typography and interactive transitions pixel-perfect precision.
- **Backend: Express + Node.js**: High throughput, lightweight routing, and seamless integration with Vite middleware in development mode. Bypasses browser-side CORS headaches and allows clean API key containment.
- **AI Core: @google/genai TypeScript SDK + gemini-3.5-flash**: The modern standard interface for Google’s high-efficiency models. `gemini-3.5-flash` delivers instant text synthesis at low latency and near-zero cost, ideal for lightweight summaries.
- **Database: File-based JSON Database**: Highly robust, zero-configuration, and fully self-contained. Avoids complex database setups or external credential latency, making it 100% reliable in sandboxed container environments.

---

## 4. Scaling Roadmap (to 10,000 Audits / Day)

To scale this application to handle 10,000 audits per day (approx 7 audits per minute peak hour), we would evolve the stack through these checkpoints:

1. **Introduce Redis for Audit Caching**:
   - Scraping same-tool payload patterns doesn't require querying Gemini every single time. We would cache the generated summary using a SHA256 hash of the tool selection. If another user submits the exact same stack (e.g., 5-seat Cursor Pro), we return the cached response, saving ~10,000 LLM calls per day.
2. **State Storage Migration**:
   - Migrate from local File-based storage to a serverless DB like **Cloud Firestore** or **Cloud Cloud-SQL** with read-replicas.
3. **Queue-based Summary Generation**:
   - Decouple the summary generation from the main thread. When a user submits an audit, return the mathematical breakdown immediately. Spin up a background queue (e.g., BullMQ with Redis) to fetch the Gemini summary asynchronously, pushing it to the client via WebSockets or Server-Sent Events (SSE). This maintains a lightning-fast <100ms API response time.
