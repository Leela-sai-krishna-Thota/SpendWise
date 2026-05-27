# ECONOMICS.md (Unit Economics & Projections)

This document maps out the unit economics, Customer Acquisition Cost (CAC), and commercial model for Credex if this Spend Audit tool is deployed tomorrow.

---

## 1. Converted Lead Lifetime Value (LTV) to Credex

At its core, Credex helps startups purchase bulk discounted AI infrastructure credits (Cursor, Claude, ChatGPT, OpenAI API, etc.).
Let's analyze the average value of a client who buys their AI credit pool through Credex:

- **Average Startup AI SaaS Spend**: $800/month (typical for a 10-person dev team: Cursor seats + API keys).
- **Credex Discount Offered**: 25% average discount. The startup enjoys $800/mo worth of credits for $600/mo, saving $200/mo.
- **Credex Net Revenue (Take-Rate)**: Credex sources these credentials from pivoted companies at ~50% face value and sells them at 75% face value. This leaves a **25% take-rate margin** for Credex.
- **Monthly Net Revenue to Credex**: $800 * 25% = **$200/month**.
- **Customer Lifetime (Retency)**: Average startup stays with this setup for **18 months** (representing typical pivot/fundraising cycles).
- **Customer Lifetime Value (LTV)**: $200/mo * 18 months = **$3,600**.

---

## 2. Customer Acquisition Cost (CAC) by Channel

Our GTM channels are high-leverage and low-cost relative to general marketing:

| GTM Channel | Direct Costs | Time Invested (Equity Equiv.) | Expected Customer CAC |
| :--- | :--- | :--- | :--- |
| **LinkedIn VPE Outbound DMs** | $0 SaaS | ~1.5 hours per conversion ($45) | **$45** |
| **Hacker News & IndieHub Traffic**| $0 SaaS | ~4 hours per thread ($120) | **$120** |
| **VC Platform bulk recommendations**| $0 SaaS | ~5 hours per fund signon ($150 / 5) | **$30** |

- **Blended CAC**: **$65** per actual converted customer.
- **LTV to CAC Ratio**: $3,600 / $65 = **55.3x**. This is an exceptionally efficient acquisition funnel.

---

## 3. The Funnel Conversion & Profitability Threshold

To verify profitability, let's trace a sample batch of 1,000 visitors who initiate the Audit:

```
1,000 Visitors (Audits Initiated)
  │
  ├──► 750 Completons (75% Completion Rate)
  │      │
  │      └──► 337 Leads Captured (45% Opt-in Email Gate)
  │             │
  │             └──► 33 consultations booked (10% of Email Leads) [High-Overspend Cases]
  │                    │
  │                    └──► 5 Purchases of Credex Credits (15% close rate)
```

- **Visitor to Customer Conversion Rate**: 5 / 1000 = **0.5%**
- **SaaS Operating costs per audit (including Gemini API token usage)**: $0.005 per audit.
- **Total infrastructure cost for 1,000 audits**: $5.00
- **Total Blended CAC + Infra Cost for 5 acquired customers**: (5 * $65) + $5 = **$330**
- **Total Revenue (LTV) generated**: 5 * $3,600 = **$18,000**
- **Net Profit**: $18,000 - $330 = **$17,670**

This proves that even if our Consultation-to-Purchase conversion rate dropped to **1%** (yielding just 1 client), we would make **$3,600** on a **$330** total campaign spend, remaining highly profitable.

---

## 4. Path to $1,000,000 ARR in 18 Months

To hit $1M in ARR ($83,333/month in net revenue for Credex), let's calculate what must be true:

- **Target Credex Net Revenue per Month**: $83,333
- **Average Customer Monthly Revenue**: $200
- **Total Active Customers Needed**: $83,333 / $200 = **417 organic active startups** on the Credex platform.
- **Acquisitions needed per month over 18 months**: 417 / 18 = **24 new customers per month**.

### Mathematical Funnel Requirements to achieve 24 clients/mo:

- **Audits Completed**: 4,800/month (~160 audits per day).
- **Leads Captured**: 2,160 emails/month.
- **Consultations Booked**: 216 calls/month (~7 calls per day).
- **Average Traffic Required**: 6,400 monthly unique visitors.

To sustain 160 audits per day, our marketing activities must secure permanent integrations on VC Resource pages, rank for key search terms related to Cursor/ChatGPT billing, and sustain outbound automation to expanding startups.
