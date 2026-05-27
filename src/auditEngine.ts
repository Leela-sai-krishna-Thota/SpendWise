import { AuditPayload, AuditResults, Recommendation, ToolInput } from "./types";

export function runAudit(payload: AuditPayload): AuditResults {
  const recommendations: Recommendation[] = [];
  let totalCurrentSpend = 0;
  let totalOptimizedSpend = 0;

  const tools = payload.tools;
  const teamSize = payload.teamSize || 1;

  // 1. HELPERS to analyze individual tools
  
  // --- CURSOR ---
  if (tools.cursor && tools.cursor.seats > 0) {
    const info = tools.cursor;
    const plan = info.plan.toLowerCase();
    const seats = info.seats;
    
    // Calculate standard retail costs
    let actualUnitCost = 20; // Default pro
    if (plan === "hobby") actualUnitCost = 0;
    else if (plan === "pro") actualUnitCost = 20;
    else if (plan === "business") actualUnitCost = 40;
    else if (plan === "enterprise") actualUnitCost = 100;

    let computedSpend = info.currentSpend || (actualUnitCost * seats);
    totalCurrentSpend += computedSpend;

    let recommendedPlan = info.plan;
    let recommendedAction: "keep" | "downgrade" | "consolidate" = "keep";
    let optimizedUnitCost = actualUnitCost;
    let reason = "Your Cursor licensing perfectly matches your team structure.";

    // Logic: Downgrade Business to Pro rules if they don't have SSO needs and seat count is small
    if (plan === "business" && seats <= 3) {
      recommendedAction = "downgrade";
      recommendedPlan = "pro";
      optimizedUnitCost = 20;
      reason = "For small teams of 3 or less, Cursor Pro provides the same core model capabilities. Downgrade to Pro unless SAML/SSO is required.";
    }

    const itemOptimizedSpend = optimizedUnitCost * seats;
    recommendations.push({
      toolId: "cursor",
      toolName: "Cursor IDE",
      currentPlan: info.plan,
      recommendedAction,
      recommendedPlan,
      optimizedSpend: itemOptimizedSpend,
      savings: computedSpend - itemOptimizedSpend,
      reason
    });
    totalOptimizedSpend += itemOptimizedSpend;
  }

  // --- GITHUB COPILOT ---
  if (tools.copilot && tools.copilot.seats > 0) {
    const info = tools.copilot;
    const plan = info.plan.toLowerCase();
    const seats = info.seats;

    let actualUnitCost = 10;
    if (plan === "individual") actualUnitCost = 10;
    else if (plan === "business") actualUnitCost = 19;
    else if (plan === "enterprise") actualUnitCost = 39;

    let computedSpend = info.currentSpend || (actualUnitCost * seats);
    totalCurrentSpend += computedSpend;

    let recommendedPlan = info.plan;
    let recommendedAction: "keep" | "downgrade" | "consolidate" = "keep";
    let optimizedUnitCost = actualUnitCost;
    let reason = "Your GitHub Copilot billing is optimal.";

    // Check OVERLAP with Cursor:
    // If team has both Cursor (Pro/Business) and GitHub Copilot (Individual) running on the same seats
    if (tools.cursor && tools.cursor.seats > 0) {
      recommendedAction = "consolidate";
      recommendedPlan = "cancelled (override)";
      optimizedUnitCost = 0;
      reason = "Cursor IDE features built-in chat, codebase indexing, and autocompletions. Running Copilot on the same machines is 100% redundant. Consolidate into Cursor.";
    } else if (plan === "enterprise" && payload.primaryUseCase === "coding") {
      recommendedAction = "downgrade";
      recommendedPlan = "business";
      optimizedUnitCost = 19;
      reason = "Copilot Business provides exact autocomplete models. Downgrade from Enterprise to Business unless custom codebase index indexing is actively deployed.";
    }

    const itemOptimizedSpend = optimizedUnitCost * seats;
    recommendations.push({
      toolId: "copilot",
      toolName: "GitHub Copilot",
      currentPlan: info.plan,
      recommendedAction,
      recommendedPlan,
      optimizedSpend: itemOptimizedSpend,
      savings: computedSpend - itemOptimizedSpend,
      reason
    });
    totalOptimizedSpend += itemOptimizedSpend;
  }

  // --- CLAUDE ---
  if (tools.claude && tools.claude.seats > 0) {
    const info = tools.claude;
    const plan = info.plan.toLowerCase();
    const seats = info.seats;

    let actualUnitCost = 20;
    let minSeatsFloor = 1;
    if (plan === "free") actualUnitCost = 0;
    else if (plan === "pro") actualUnitCost = 20;
    else if (plan === "team") {
      actualUnitCost = 30;
      minSeatsFloor = 5; // Claude Team has a 5-seat minimum billing floor!
    } else if (plan === "enterprise") actualUnitCost = 75;

    // Compute standard charge ensuring they fulfill the multiseat minimums or the raw input
    let computedSpend = info.currentSpend;
    if (!computedSpend) {
      const activeBillingSeats = Math.max(seats, minSeatsFloor);
      computedSpend = activeBillingSeats * actualUnitCost;
    }
    totalCurrentSpend += computedSpend;

    let recommendedPlan = info.plan;
    let recommendedAction: "keep" | "downgrade" | "switch" = "keep";
    let optimizedSpend = computedSpend;
    let reason = "Your Claude subscriptions are structured optimally.";

    // Multi-seat floor wastage rule:
    if (plan === "team" && seats < 5) {
      recommendedAction = "downgrade";
      recommendedPlan = "pro";
      // Downgrade to pro for active seats only
      optimizedSpend = seats * 20;
      reason = `Claude Team enforces a 5-seat minimum billing floor ($150/mo). With only ${seats} active users, you pay $150. Downgrade to Claude Pro ($20/seat) to only pay for active seats, saving $${computedSpend - optimizedSpend}/mo.`;
    }

    recommendations.push({
      toolId: "claude",
      toolName: "Claude AI",
      currentPlan: info.plan,
      recommendedAction,
      recommendedPlan,
      optimizedSpend,
      savings: computedSpend - optimizedSpend,
      reason
    });
    totalOptimizedSpend += optimizedSpend;
  }

  // --- CHATGPT ---
  if (tools.chatgpt && tools.chatgpt.seats > 0) {
    const info = tools.chatgpt;
    const plan = info.plan.toLowerCase();
    const seats = info.seats;

    let actualUnitCost = 20;
    let minSeatsFloor = 1;
    if (plan === "free") actualUnitCost = 0;
    else if (plan === "plus") actualUnitCost = 20;
    else if (plan === "team") {
      actualUnitCost = 30;
      minSeatsFloor = 2; // Team has a 2-seat floor
    } else if (plan === "enterprise") actualUnitCost = 60;

    let computedSpend = info.currentSpend;
    if (!computedSpend) {
      const activeBillingSeats = Math.max(seats, minSeatsFloor);
      computedSpend = activeBillingSeats * actualUnitCost;
    }
    totalCurrentSpend += computedSpend;

    let recommendedPlan = info.plan;
    let recommendedAction: "keep" | "downgrade" | "switch" = "keep";
    let optimizedSpend = computedSpend;
    let reason = "Your ChatGPT subscription structure is optimal.";

    if (plan === "team" && seats === 1) {
      recommendedAction = "downgrade";
      recommendedPlan = "plus";
      optimizedSpend = 20; // Plus is singular
      reason = "ChatGPT Team requires a 2-seat minimum charge ($60/mo). For a single user, downgrade to ChatGPT Plus to save $40/mo with similar daily model rates.";
    }

    recommendations.push({
      toolId: "chatgpt",
      toolName: "ChatGPT (OpenAI)",
      currentPlan: info.plan,
      recommendedAction,
      recommendedPlan,
      optimizedSpend,
      savings: computedSpend - optimizedSpend,
      reason
    });
    totalOptimizedSpend += optimizedSpend;
  }

  // --- DEV APIs: ANTHROPIC API DIRECT ---
  if (tools.anthropicApi && tools.anthropicApi.seats > 0) {
    const info = tools.anthropicApi;
    const computedSpend = info.currentSpend || 0;
    totalCurrentSpend += computedSpend;

    let recommendedAction: "keep" | "switch" = "keep";
    let optimizedSpend = computedSpend;
    let reason = "Your API usage tier is in line with standard developer footprints.";

    // If spending heavily on Anthropic API, propose Gemini 3.5 Flash for non-core workflows (summarization, reading context)
    if (computedSpend > 150) {
      recommendedAction = "switch";
      optimizedSpend = Math.round(computedSpend * 0.4); // 60% savings by offloading 80% to Flash
      reason = "High API cost detected. Offload 80% of summarization, layout extraction, and utility prompt calls to Gemini 3.5 Flash ($0.075/M tokens) to secure up to 60% savings.";
    }

    recommendations.push({
      toolId: "anthropicApi",
      toolName: "Anthropic API",
      currentPlan: "API Access",
      recommendedAction,
      recommendedPlan: "Hybrid Integration",
      optimizedSpend,
      savings: computedSpend - optimizedSpend,
      reason
    });
    totalOptimizedSpend += optimizedSpend;
  }

  // --- OPENAI API DIRECT ---
  if (tools.openaiApi && tools.openaiApi.seats > 0) {
    const info = tools.openaiApi;
    const computedSpend = info.currentSpend || 0;
    totalCurrentSpend += computedSpend;

    let recommendedAction: "keep" | "switch" = "keep";
    let optimizedSpend = computedSpend;
    let reason = "Your OpenAI API workloads are performing within regular thresholds.";

    if (computedSpend > 150) {
      recommendedAction = "switch";
      optimizedSpend = Math.round(computedSpend * 0.4); // 65% savings
      reason = "Route non-complex LLM loops, text embeddings, and mini-parsing workloads to Gemini 2.5/3.5 Flash to slash up to 60% off high monthly API costs.";
    }

    recommendations.push({
      toolId: "openaiApi",
      toolName: "OpenAI API",
      currentPlan: "API Keys",
      recommendedAction,
      recommendedPlan: "Hybrid Integration",
      optimizedSpend,
      savings: computedSpend - optimizedSpend,
      reason
    });
    totalOptimizedSpend += optimizedSpend;
  }

  // --- GEMINI ---
  if (tools.gemini && tools.gemini.seats > 0) {
    const info = tools.gemini;
    const computedSpend = info.currentSpend || (20 * info.seats);
    totalCurrentSpend += computedSpend;

    recommendations.push({
      toolId: "gemini",
      toolName: "Gemini Advanced",
      currentPlan: info.plan,
      recommendedAction: "keep",
      recommendedPlan: info.plan,
      optimizedSpend: computedSpend,
      savings: 0,
      reason: "Gemini Pro / Advanced represents a high-efficiency model footprint."
    });
    totalOptimizedSpend += computedSpend;
  }

  // --- v0 by VERCEL ---
  if (tools.v0 && tools.v0.seats > 0) {
    const info = tools.v0;
    const plan = info.plan.toLowerCase();
    const seats = info.seats;

    let actualUnitCost = 20;
    if (plan === "free") actualUnitCost = 0;
    else if (plan === "premium") actualUnitCost = 20;
    else if (plan === "team") actualUnitCost = 30;

    let computedSpend = info.currentSpend || (actualUnitCost * seats);
    totalCurrentSpend += computedSpend;

    let recommendedPlan = info.plan;
    let recommendedAction: "keep" | "downgrade" = "keep";
    let optimizedUnitCost = actualUnitCost;
    let reason = "Vercel v0 styling components are optimally billed.";

    if (plan === "team" && seats === 1) {
      recommendedAction = "downgrade";
      recommendedPlan = "premium";
      optimizedUnitCost = 20;
      reason = "For a single developer workspace, team tiers offer redundant capabilities. Downgrade to v0 Premium to save $10/mo.";
    }

    const itemOptimizedSpend = optimizedUnitCost * seats;
    recommendations.push({
      toolId: "v0",
      toolName: "v0.dev",
      currentPlan: info.plan,
      recommendedAction,
      recommendedPlan,
      optimizedSpend: itemOptimizedSpend,
      savings: computedSpend - itemOptimizedSpend,
      reason
    });
    totalOptimizedSpend += itemOptimizedSpend;
  }

  const netSavings = Math.max(0, totalCurrentSpend - totalOptimizedSpend);

  return {
    currentSpend: totalCurrentSpend,
    optimizedSpend: totalOptimizedSpend,
    savings: netSavings,
    annualCurrent: totalCurrentSpend * 12,
    annualOptimized: totalOptimizedSpend * 12,
    annualSavings: netSavings * 12,
    recommendations,
    teamSize: payload.teamSize,
    primaryUseCase: payload.primaryUseCase
  };
}
