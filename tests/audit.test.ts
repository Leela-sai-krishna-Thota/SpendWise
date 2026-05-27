import test from "node:test";
import assert from "node:assert";
import { runAudit } from "../src/auditEngine";
import { AuditPayload } from "../src/types";

// Setup Test 1: Empty Stack
test("Test 1: Empty stack returns exactly 0 calculations", () => {
  const payload: AuditPayload = {
    email: "test@empty.com",
    teamSize: 5,
    primaryUseCase: "coding",
    tools: {}
  };

  const results = runAudit(payload);
  assert.strictEqual(results.currentSpend, 0);
  assert.strictEqual(results.optimizedSpend, 0);
  assert.strictEqual(results.savings, 0);
});

// Setup Test 2: Cursor + Copilot Overlap
test("Test 2: Cursor and GitHub Copilot double-billing consolidation", () => {
  const payload: AuditPayload = {
    email: "test@overlap.com",
    teamSize: 2,
    primaryUseCase: "coding",
    tools: {
      cursor: { plan: "pro", seats: 2, currentSpend: 40 },
      copilot: { plan: "individual", seats: 2, currentSpend: 20 }
    }
  };

  const results = runAudit(payload);
  
  // Find Copilot recommendation
  const copilotRec = results.recommendations.find(r => r.toolId === "copilot");
  assert.ok(copilotRec);
  assert.strictEqual(copilotRec.recommendedAction, "consolidate");
  assert.strictEqual(copilotRec.optimizedSpend, 0);
  assert.strictEqual(copilotRec.savings, 20);
  assert.strictEqual(results.savings, 20); // Saves $20/mo
});

// Setup Test 3: Claude Team Multi-seat floors
test("Test 3: Claude Team multi-seat billing floors (under 5 seats)", () => {
  const payload: AuditPayload = {
    email: "test@claude. Saas",
    teamSize: 2,
    primaryUseCase: "writing",
    tools: {
      claude: { plan: "team", seats: 2, currentSpend: 150 } // Enforced 5-seat minimum gives $150
    }
  };

  const results = runAudit(payload);
  const claudeRec = results.recommendations.find(r => r.toolId === "claude");
  assert.ok(claudeRec);
  assert.strictEqual(claudeRec.recommendedAction, "downgrade");
  assert.strictEqual(claudeRec.recommendedPlan, "pro");
  assert.strictEqual(claudeRec.optimizedSpend, 40); // 2 seats of Pro = $40
  assert.strictEqual(claudeRec.savings, 110); // 150 - 40 = 110
});

// Setup Test 4: ChatGPT Team Seat Overspend
test("Test 4: ChatGPT Team single user floor waste", () => {
  const payload: AuditPayload = {
    email: "test@chatgpt.org",
    teamSize: 1,
    primaryUseCase: "mixed",
    tools: {
      chatgpt: { plan: "team", seats: 1, currentSpend: 60 } // Enforced 2-seat minimum gives $60
    }
  };

  const results = runAudit(payload);
  const gptRec = results.recommendations.find(r => r.toolId === "chatgpt");
  assert.ok(gptRec);
  assert.strictEqual(gptRec.recommendedAction, "downgrade");
  assert.strictEqual(gptRec.recommendedPlan, "plus");
  assert.strictEqual(gptRec.optimizedSpend, 20); // Plus is $20
  assert.strictEqual(gptRec.savings, 40); // 60 - 20 = 40
});

// Setup Test 5: Optimal stack without fake savings
test("Test 5: Optimal stack returns zero fabricated savings", () => {
  const payload: AuditPayload = {
    email: "test@clean.com",
    teamSize: 5,
    primaryUseCase: "data",
    tools: {
      cursor: { plan: "pro", seats: 5, currentSpend: 100 }
    }
  };

  const results = runAudit(payload);
  assert.strictEqual(results.savings, 0);
  assert.strictEqual(results.currentSpend, 100);
});
