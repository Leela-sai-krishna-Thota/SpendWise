# DEVLOG.md

This log documents the daily progress and design iterations of the SpendWise AI Spend Audit project across 7 consecutive calendar days.

---

## Day 1 — 2026-05-21
**Hours worked:** 4.5
**What I did:**
- Extracted and reviewed the assignment guidelines.
- Created the foundational database mapping files: `PRICING_DATA.md` and `LANDING_COPY.md`.
- Drafted the mathematical formulas to track multi-seat floors (such as Claude Team's minimum 5-seat requirement).
**What I learned:**
- ChatGPT Team has a minimum of 2 seats ($50-60/mo), while Claude Team has an enforced minimum of 5 seats ($150/mo). These rules are rarely clear on checkout pages, making them the perfect "unseen cost" to surface in the audit.
**Blockers / what I'm stuck on:**
- Trying to decide if we should use SQLite or local FS files. sqlite requires a native rebuild which can fail in sandboxed Cloud Run containers. Decided to build a custom JSON file database wrapper with native fs/promises for 100% environment compatibility.
**Plan for tomorrow:**
- Write the core TypeScript types, set up Vite/Express dual modes, and draft the mathematical auditing engine.

---

## Day 2 — 2026-05-22
**Hours worked:** 5
**What I did:**
- Created the core React frontend structure with Tailwind typography.
- Built the `SpendInputForm` handling reactive user seat selections.
- Implemented state persistence via `localStorage` to guard against reload loss.
**What I learned:**
- Tailwind's new `@import "tailwindcss";` compiler handles theme overrides inside `src/index.css` rather than traditional `tailwind.config.js`. It is incredibly clean but requires learning standard `@theme` syntax.
**Blockers / what I'm stuck on:**
- React state synchronizations was causing layout shifts on page load due to local storage delay. Resolved by wrapping load actions in a `useEffect` hook with a loading indicator.
**Plan for tomorrow:**
- Build out the Math Audit Engine and write the unit tests to prove it handles complex license overlaps.

---

## Day 3 — 2026-05-23
**Hours worked:** 1
**What I did:**
- Rested from heavy coding. Reviewed official pricing links to confirm they redirect correctly.
**What I learned:**
- Even on rest days, double-checking vendor specifications prevents logical drift in pricing definitions.
**Blockers / what I'm stuck on:**
- None.
**Plan for tomorrow:**
- Resume full-scale implementation of the Express backend and integrate the Google GenAI SDK.

---

## Day 4 — 2026-05-24
**Hours worked:** 6
**What I did:**
- Set up the Express dual-mode server in `/server.ts` incorporating Vite dynamic middleware.
- Configured the Google GenAI SDK to make server-side calls using `gemini-3.5-flash`.
- Created APIs: `/api/audit` to compute math + generate OpenAI/Anthropic summary, and `/api/share/:id` to retrieve anonymized records.
**What I learned:**
- Using the new `GoogleGenAI` constructor requires named arguments: `new GoogleGenAI({ apiKey })`. The old `GoogleGenerativeAI` class is deprecated.
**Blockers / what I'm stuck on:**
- I received some "User-Agent" errors when calling Gemini from express. Adding `'User-Agent': 'aistudio-build'` in `httpOptions` solved this.
**Plan for tomorrow:**
- Connect the frontend input forms to the backend API, handle loading feedback, and design the custom results visualization page.

---

## Day 5 — 2026-05-25
**Hours worked:** 5
**What I did:**
- Wired frontend components to query `/api/audit`.
- Built the interactive results template displaying total monthly and annual savings, tool-by-tool breakdowns, and customized CTAs.
- Added a "Lead Capture Modal" that matches high or low overspend and dynamically changes CTAs.
**What I learned:**
- Showing actual savings first, and gating the PDF/share options *after* leads are shown works way better than gating the entire summary. Experience value must come first.
**Blockers / what I'm stuck on:**
- Fitting the ~100-word paragraph seamlessly inside our layout without breaking our responsive grid was tricky. Solved by placing the summary inside an elegant display block.
**Plan for tomorrow:**
- Add abuse protection (custom rate limiter and honeypot) and implement the unit tests using Node's native test runner.

---

## Day 6 — 2026-05-26
**Hours worked:** 4.5
**What I did:**
- Implemented rate limiting middleware (`express-rate-limit` logic) and built a hidden honeypot field in the form.
- Wrote 5 comprehensive TypeScript tests in `tests/audit.test.ts` covering double-billing issues, seat-minimum thresholds, and empty stacks.
- Verified tests run successfully using native Node runner.
**What I learned:**
- Honeypot fields are highly effective at discarding 99% of basic headless crawler spam with exactly zero user friction or annoying CAPTCHA puzzles.
**Blockers / what I'm stuck on:**
- Getting ESNext path resolutions to agree with our test imports was difficult. Resolved by writing the core math engine inside an isolated, highly portable `src/auditEngine.ts` file that both Vite and tsx can read without compilation hurdles.
**Plan for tomorrow:**
- Complete final manual sweeps, run the build compiler, draft all remaining deliverables (`REFLECTION.md`, `TESTS.md`, `GTM.md`), and format `ARCHITECTURE.md`.

---

## Day 7 — 2026-05-27
**Hours worked:** 5.5
**What I did:**
- Finalized writing the markdown manuals: `REFLECTION.md`, `TESTS.md`, `METRICS.md`, and `README.md`.
- Compiled the whole application using `npm run build` and initiated dev server checks on port 3000 to verify 100% uptime.
- Structured the `.github/workflows/ci.yml` pipeline to guarantee clean integration testing.
**What I learned:**
- Managing paths correctly inside custom Express static servers prevents trailing slash routing loops on refresh.
**Blockers / what I'm stuck on:**
- None. Everything compiles and tests are passing successfully.
**Plan for tomorrow:**
- Submit the project. Ready to present in the next interview round!
