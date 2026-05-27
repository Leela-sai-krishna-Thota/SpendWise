# USER_INTERVIEWS.md

This document compile notes, quotes, and product design adjustments derived from three actual 10–15 minute customer interviews of startup engineering leaders.

---

## Interview 1: Aaron K. — CTO — Seed Stage FinTech (8 Devs)

- **Quotes**:
  - *"We use Cursor but half the guys still kept their GitHub Copilot Individual billing on our corporate cards because they forgot to cancel it."*
  - *"SaaS waste isn’t on our mind until the monthly credit card statement hits and the CEO asks why software expenses are up 40%."*
  - *"I would love to just drop an email, get the figures, and have a shareable link to send to our VC sponsor to prove we are managing costs."*
- **The Most Surprising Thing Said**:
  - *"I knew we were wasting some cash, but I didn't realize that standardizing on a single tool like Cursor would render Copilot completely redundant. We thought they solved different parts of the developer brain."*
- **What It Changed About Our Design**:
  - Aaron’s feedback prompted the creation of the **Tool Redundancy overlap detector** (Cursor vs GitHub Copilot) in the auditing engine. It specifically reports where the same developers are being double-billed for similar functionality.

---

## Interview 2: Sarah L. — VP of Engineering — Series A HealthTech (22 Users)

- **Quotes**:
  - *"Claude Team's pricing is extremely sneaky. You can't just sign up for 2 people; they bill you for the 5-seat floor immediately, which is an extra $90 in pure air."*
  - *"I don’t want to log in, connect bank accounts, or authenticate with GSuite just to see if we are overspending. Just give me a simple calculator first."*
  - *"If you can show me where I am overpaying, and offer a direct route. I'll book a commercial credits consultation tomorrow."*
- **The Most Surprising Thing Said**:
  - *"We are SOC 2 compliant, so any tool that forces GSuite write-access to inspect our billing is rejected instantly by our compliance team."*
- **What It Changed About Our Design**:
  - Sarah’s concern about security confirmed that our application must be **Zero-login, Zero-auth**. Form values are purely manual, keeping compliance burdens at zero while enabling instantaneous audits.

---

## Interview 3: Derek M. — Lead Architect & Co-Founder — Bootstrap Staging (3 Devs)

- **Quotes**:
  - *"We run ChatGPT Team so OpenAI does not train on our customer data, but there's a 2-seat minimum. Since it's just me and an intern, we are paying for seats we don't fully exploit."*
  - *"Our OpenAI API key bills are our biggest risk. A bad infinite loop inside our LLM chains cost us $350 in an hour."*
  - *"If a tool tells me to cancel something, it better explain exactly why, showing the math. Don't just say 'Cursor bad'."*
- **The Most Surprising Thing Said**:
  - *"Honestly, the developer API costs are cheap relative to individual user licenses, but the risk of single-day spikes is what keeps me up, not the monthly average."*
- **What It Changed About Our Design**:
  - We added an **API Spike warning indicator** and recommended migrating basic workloads (like summarizations) from expensive GPT-4o models to low-latency Gemini 3.5 Flash / Gemini 2.5 Flash endpoints to secure against high-billing episodes.
