# METRICS.md (Analytics & North Star Framework)

This document establishes the metrics framework for the Spend Audit tool, focusing on its role as a high-intent B2B lead generation asset for Credex.

---

## 1. The North Star Metric
Our North Star Metric is **Weekly SQL Audits** (Qualified Audits demonstrating >$200/month in calculated optimization, where a lead email is captured).

- **Why this metric?** A metric like "Daily Active Users" (DAU) is irrelevant. Founders only audit their tool stack once a quarter or when a bill shifts. What matters is the velocity of *qualified leads* containing high-potential overspend entering the Credex pipeline. It guarantees both user utility (they saw the value and saved) and marketing alignment (Credex receives a warm, high-value conversion opportunity).

---

## 2. Three Input Metrics Driving the North Star
To grow Weekly SQL Audits, we must optimize the following three conversion levers:

1. **Traffic to Initiation Rate (CTR)**: The % of landers who select at least one AI tool and input a plan.
   - *Target*: > 60%. Highly focused display copy and a zero-delay starting field are critical here.
2. **Audit Completion To Lead Capture Rate (Opt-in)**: The % of audited visitors who submit their email on the results page to capture or share their report.
   - *Target*: > 35%. This is maximized by displaying estimated savings first. We never gate the price analysis before email entry.
3. **High-Savings Consult Booked Conversion**: The % of leads with calculated overspend > $500/mo who click through and schedule a Credex secondary credit consultation.
   - *Target*: > 12%. Prominent styling and trust indicators on high-savings results pages directly drive this.

---

## 3. What to Instrument First
Before implementing general pageview tracking, we must instrument **Form Field Drop-off Heatmaps**. 
- Specifically, we need to log where developers stop filling out the form (e.g., at the API token inputs vs the seat count selections). If users drop off at the seat input, we can default the inputs to `1 seat` to reduce input friction. We will instrument this using anonymized client-side event listeners logging to a simple telemetry endpoint.

---

## 4. The Pivot Trigger
If after **1,000 completed audits**, the **Lead-to-Consultation-Booked Conversion** remains below **2%**, it triggers an immediate pivot of the monetization offer. 
- *The Pivot Option*: Instead of pitching a "Consultation Core Meeting," we will pivot to a "One-Click Automator Tool" that auto-generates a ready-to-send PDF cancellation email template for the manager to forward to their accounting team.
