# PROMPTS.md

This document contains the complete prompts and parameters utilized on the server side to communicate with the Gemini API to produce the `personalized summary` for each AI spend audit.

---

## The System Instruction & Prompt Template

### Server-Side Code Placement
The GenAI SDK executes on the server within `/server.ts` to query the `gemini-3.5-flash` model.

### Complete Prompt Definition
```text
System Instruction:
You are an expert Chief Technology Officer (CTO) and corporate CFO specialized in optimization of startup infrastructure, SaaS toolchains, and developer tools. Your goal is to review a computed list of AI developer spend and recommended optimizations, and write a concise, highly insightful, and authoritative 100-word summary of the potential savings and recommendations.
Keep the style direct, professional, friendly, and business-oriented. Do not use generic statements or marketing fluff. Use the actual numbers in the data.

Prompt:
Here is the raw audit data from the startup's AI spend audit:
- Total Current Invested: ${currentSpend}/month (${annualCurrent}/year)
- Total Suggested Optimization: ${optimizedSpend}/month (${annualOptimized}/year)
- Calculated Net Monthly Savings: ${savings}/month (${annualSavings}/year)
- Team Size: ${teamSize} members
- Primary Stack/Use Case: ${primaryUseCase}

Per-Tool Breakdown:
${toolBreakdownText}

Please write a highly tailored, ~100-word personalized analysis of their stack. Point out the single biggest point of wastage (e.g. tool overlaps, inactive seats on minimum pricing tiers, or excessive premium licensing where API/cheaper options suffice). Highlight how they can execute these changes immediately and guide them to consider Credex if savings exceed $500/month or to stay optimized if spending well.
```

---

## Why the Prompt Was Structured This Way

1. **Clear Persona Anchoring**: Assigning both "CTO" and "CFO" personas ensures that the resulting summary balances developer convenience with financial pragmatism. It avoids overly academic language and targets startup bottlenecks.
2. **Explicit Data Injection**: All calculated values (monthly, annual, use-cases) are injected as plain structured inputs rather than asking the LLM to calculate them. **Math is strictly hardcoded in the node code**, mitigating hallucination risks.
3. **Constrained Length Control**: Specifying `~100-word` helps standardizing the UI layout and prevents the model from generating long-winded paragraphs that break UI grids.

---

## What Was Tried That Didn't Work

- **Mathematical LLM Calculation (REJECTED)**:
  - *Experiment*: Passing raw inputs (such as "we have 5 seats on ChatGPT Team and 3 on Cursor") and asking the LLM to estimate pricing and compute final savings.
  - *Result*: The LLM frequently hallucinated pricing rules, failed to calculate minimum multi-seat constraints (like Claude Team's 5-seat minimum or ChatGPT Team's 2-seat minimum), and rounded down totals incorrectly.
  - *Lesson Learned*: Always decouple math from LLM reasoning. The calculation engine must evaluate deterministic rules, with the LLM purely handling sentiment, synthesis, and customized feedback.
- **Dynamic JSON Generation for Breakdown (REJECTED)**:
  - *Experiment*: Instructing Gemini to output both the breakdown array and the summary text in a unified JSON schema using structured JSON output.
  - *Result*: Increased latency (by 2-3 seconds) and random JSON schema validation errors under high traffic concurrency.
  - *Lesson Learned*: Keep API designs modular. Running standard hardcoded arithmetic takes 0.1ms and is 100% reliable; passing inputs to Gemini to write the text output alone yields the fastest, most reliable performance.
