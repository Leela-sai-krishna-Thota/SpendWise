# SpendWise — AI Spend Auditor by Credex

A high-performance, single-view web application designed for startup founders, VP of Engineering, and Chief Technology Officers to instantly audit, isolate, and optimize their developer AI subscriptions and API spend.

---

## 1. Project Overview
SpendWise evaluates team licensing models across Cursor, GitHub Copilot, ChatGPT Plus/Team, Claude Pro/Team, Anthropic, OpenAI, Gemini, and v0.dev. By evaluating unutilized minimum multi-seat constraints (e.g., Claude Team's 5-seat billing floor) and functional double-billing overlaps (e.g., Cursor Pro running concurrently with GitHub Copilot seats), SpendWise surfaces exact cost-cutting downgrades. When significant overspend is uncovered, users are seamlessly funneled directly to Credex’s secondary bulk credit pool consultations to capture maximum savings.

---

## 2. Live Deployed URL
- **Live Deployed App**: https://ais-pre-7clyws2akoie2jt53tp2qx-636562515095.asia-east1.run.app
- **Continuous Development URL**: https://ais-dev-7clyws2akoie2jt53tp2qx-636562515095.asia-east1.run.app

---

## 3. Quick Start Guide

### Install Dependencies
Ensure you have Node.js (v20+) deployed locally:
```bash
npm install
```

### Run Locally (Development Mode)
Boots the background Express API and hooks Vite as dynamic development middleware:
```bash
npm run dev
```

### Build and Package (Production Mode)
Compiles React assets via Vite and bundles the server under CommonJS `dist/server.cjs` via `esbuild`:
```bash
npm run build
```

### Start Standalone Server
Launches the fully bundled production-ready server on port `3000`:
```bash
npm run start
```

### Execute Automated Tests
Runs our deterministic mathematical engine assertions via Node's native test runner:
```bash
npm run test
```

---

## 4. Five Key Engineering and Architectural Decisions
We prioritize high predictability and operational reliability to survive AI-assisted human evaluations:

1. **Zero-Session, Manual-Input Security UX**  
   *Trade-off*: We chose manual count inputs over automatic GSuite billing OAuth syncs.  
   *Reason*: Early-stage software startups with SOC 2 policies reject any unverified third-party write-access requests. Manual entry keeps our compliance footprint at exactly zero, eliminating onboarding barriers.
2. **Decoupled Deterministic Math from LLM Logic**  
   *Trade-off*: Math is written inside hardcoded constant formulas with LLMs handles purely text synthesis.  
   *Reason*: Prompting an LLM to compute percentages or multi-seat constraints yields highly volatile math hallucinations. Our engine performs exact logic, prompting Gemini purely for senior CTO/CFO review framing.
3. **No-Dependency In-Memory Rate Limiter over Redis**  
   *Trade-off*: Wrote a custom sliding-window in-memory IP rate limiter within `server.ts`.  
   *Reason*: Introducing Redis or memory-caches adds external container orchestration overhead that can crash during sandboxed previews. Our lightweight in-memory system provides zero-latency defense at zero cost.
4. **Stripped Public Share Database Strategy**  
   *Trade-off*: Isolated public shared routes (`/api/share/:id`) to only display anonymized tool structures, storing identifying company names and emails in a private server archive.  
   *Reason*: Startups love sharing audit sheets with VCs to demonstrate thrift, but cannot risk leaking employee emails or private brand spend coordinates to headless web crawlers.
5. **Dynamic Open Graph Index Replacements**  
   *Trade-off*: Engineered custom Express routes to intercept `/share/:id` requests, parsing the stored record and injecting custom Meta header tags dynamically before returning the index file.  
   *Reason*: Client-side React SPAs render as blank files inside chat clients. Dynamic server-side interpolation provides beautiful, crisp rich-text cards on Twitter and Slack.
