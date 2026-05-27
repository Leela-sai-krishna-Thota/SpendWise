# TESTS.md (Automated Testing Documentation)

This document contains instructions on how to execute our automated test suite, accompanied by a detailed description of each test scenario.

---

## 1. Test Suite Configuration
We utilize Node.js's built-in, lightweight native test runner (`node:test` + `node:assert`) combined with `tsx` to run our TypeScript assertions directly. This approach ensures maximum test execution speed and avoids complex third-party testing dependencies.

- **Test Target**: `/src/auditEngine.ts` (Core deterministic savings calculator)
- **Test Suite File**: `/tests/audit.test.ts`

---

## 2. Compilation and Execution
To execute the test suite, run the following command in the project terminal:

```bash
npm run test
```

Inside your `package.json`, this maps directly to:
```json
"test": "tsx --test tests/audit.test.ts"
```

---

## 3. List of Automated Tests (Total: 5 scenarios)

### Test 1: Empty Tech Stack
- **Filename**: `tests/audit.test.ts`
- **Focus**: Verifies how the engine behaves when a client starts with an empty tech stack.
- **Assertion**: Total current spend, optimized spend, and annual savings must all return exactly `0`. No false recommendations or suggestions should be generated.

### Test 2: Cursor & GitHub Copilot Double-Billing
- **Filename**: `tests/audit.test.ts`
- **Focus**: Evaluates a single developer double-paying for both Cursor Pro ($20/mo) and Copilot Individual ($10/mo).
- **Assertion**: Surfaces the redundancy, recommends canceling the GitHub Copilot seat because Cursor has native chat and autocomplete features, and verifies net monthly savings of `$10`.

### Test 3: Claude Team Enforced Multi-Seat Floors
- **Filename**: `tests/audit.test.ts`
- **Focus**: Evaluates a startup paying for 2 Claude Team seats ($30/mo each), which is below the Claude Team 5-seat billing minimum ($150/mo floor).
- **Assertion**: Surfaces this multi-seat floor overspend, recommends downgrading to Claude Pro ($20/mo each), and asserts a calculated savings of `$110/mo` (saving the $110/mo premium difference).

### Test 4: ChatGPT Team Seat Overspend
- **Filename**: `tests/audit.test.ts`
- **Focus**: Evaluates 1 user on a ChatGPT Team account ($30/mo), which requires a minimum of 2 seats ($60/mo floor).
- **Assertion**: Highlights the single-user waste, suggests switching to ChatGPT Plus ($20/mo), and asserts a total monthly savings of `$40/mo`.

### Test 5: Optimal Stack No-savings Honesty Test
- **Filename**: `tests/audit.test.ts`
- **Focus**: Confirms the engine does not manufacture savings for a well-paying startup (e.g., 5 seats of Cursor Pro only).
- **Assertion**: Returns exactly `0` savings, confirms the stack as "Optimal", and triggers the honest `"Notify Me on Upgrades"` marketing screen rather than showing unneeded notifications.
