import express from "express";
import path from "path";
import fs from "fs/promises";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { runAudit } from "./src/auditEngine";
import { AuditPayload } from "./src/types";

// Load environment variables
dotenv.config();

export const app = express();
const PORT = 3000;
const DATA_DIR = process.env.NETLIFY === "true"
  ? path.join("/tmp", "data")
  : path.join(process.cwd(), "data");

// Initialize state directory
async function initDatabase() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    console.log(`[Storage] Storage directory confirmed at: ${DATA_DIR}`);
  } catch (err) {
    console.error("[Storage] Failed to instantiate directory:", err);
  }
}
initDatabase();

app.use(express.json());

// Handle Netlify function path rewrites to match standard Express routes
app.use((req, res, next) => {
  if (req.url.startsWith("/.netlify/functions/api")) {
    req.url = req.url.replace("/.netlify/functions/api", "/api");
  } else if (req.url.startsWith("/.netlify/functions")) {
    req.url = req.url.replace("/.netlify/functions", "/api");
  }
  next();
});

// 1. IN-MEMORY HIGH-PERFORMANCE RATE LIMITER (Zero third-party dependency)
interface RateLimitRecord {
  timestamps: number[];
}
const rateLimits = new Map<string, RateLimitRecord>();
const TIME_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 15; // Max 15 audits per minute from same IP

function rateLimiter(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = req.ip || req.headers["x-forwarded-for"] as string || "unknown-client";
  const now = Date.now();
  
  if (!rateLimits.has(ip)) {
    rateLimits.set(ip, { timestamps: [] });
  }
  
  const record = rateLimits.get(ip)!;
  // Clean expired timestamps
  record.timestamps = record.timestamps.filter(ts => now - ts < TIME_WINDOW_MS);
  
  if (record.timestamps.length >= MAX_REQUESTS) {
    res.status(429).json({
      error: "Rate Limit Exceeded",
      message: "You have requested multiple audits in a short window. Please wait 60 seconds."
    });
    return;
  }
  
  record.timestamps.push(now);
  next();
}

// 2. LAZY-INITIALIZED GEMINI SDK UTILITY WITH GRACEFUL FALLBACKS
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("[Gemini] GEMINI_API_KEY variable is absent. Summaries will leverage templated generation fallback.");
      return null;
    }
    try {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });
      console.log("[Gemini] Google GenAI SDK initialized successfully.");
    } catch (err) {
      console.error("[Gemini] Client instantiation crashed:", err);
      return null;
    }
  }
  return aiClient;
}

// REST API: Run Audit payload and save
app.get("/api/admin/leads", async (req, res) => {
  try {
    let files: string[] = [];
    try {
      files = await fs.readdir(DATA_DIR);
    } catch (_) {
      // Directory may not exist yet or is empty
    }
    const leads = [];
    for (const file of files) {
      if (file.endsWith(".json")) {
        const filePath = path.join(DATA_DIR, file);
        try {
          const raw = await fs.readFile(filePath, "utf8");
          leads.push(JSON.parse(raw));
        } catch (e) {
          // ignore broken parses
        }
      }
    }
    leads.sort((a, b) => {
      const da = new Date(a.createdAt || a.results?.createdAt || 0).getTime();
      const db = new Date(b.createdAt || b.results?.createdAt || 0).getTime();
      return db - da;
    });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: "Failed to read data files." });
  }
});

app.post("/api/audit", rateLimiter, async (req, res) => {
  try {
    const payload = req.body as AuditPayload;
    
    // HONEYPOT check: discard basic spam bots
    if (req.body.honeypot !== undefined && req.body.honeypot !== "") {
      console.log("[Abuse Defense] Bot request flagged inside Honeypot trap.");
      res.status(400).json({ error: "Invalid submission metadata format." });
      return;
    }

    if (!payload.email) {
      res.status(400).json({ error: "Email address is mandatory to log audit stats." });
      return;
    }

    // Run deterministic arithmetic
    const auditResults = runAudit(payload);
    
    // Generate AI Summary or template fallback
    let summaryParagraph = "";
    const ai = getGeminiClient();

    if (ai) {
      try {
        const toolDetailsList = auditResults.recommendations
          .map(r => `- ${r.toolName}: Current Plan "${r.currentPlan}" -> Recommend Plan "${r.recommendedPlan}" (${r.recommendedAction.toUpperCase()}). Net Monthly Savings: $${r.savings}. Reason: ${r.reason}`)
          .join("\n");

        const prompt = `Here is the raw audit data from the startup's AI spend audit:
- Total Current Spend: $${auditResults.currentSpend}/month ($${auditResults.annualCurrent}/year)
- Total Optimized Spend: $${auditResults.optimizedSpend}/month ($${auditResults.annualOptimized}/year)
- Net Monthly Savings: $${auditResults.savings}/month ($${auditResults.annualSavings}/year)
- Team Size: ${auditResults.teamSize} members
- Primary Stack/Use Case: ${payload.primaryUseCase}

Per-Tool Breakdown:
${toolDetailsList}

Please write a highly tailored, ~100-word personalized analysis of their stack. Point out the single biggest point of wastage (e.g. tool overlaps, inactive seats on minimum pricing tiers, or excessive premium licensing where API/cheaper options suffice). Highlight how they can execute these changes immediately and guide them to consider Credex if savings exceed $500/month or to stay optimized if spending well.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            systemInstruction: "You are an expert Chief Technology Officer (CTO) and corporate CFO specialized in optimization of startup infrastructure, SaaS toolchains, and developer tools. Write a concise, highly insightful, and authoritative 100-word summary of the potential savings and recommendations. Use actual numbers.",
          }
        });

        if (response.text) {
          summaryParagraph = response.text.trim();
        }
      } catch (aiErr) {
        console.error("[Gemini] API text summary generation failed, activating template output:", aiErr);
      }
    }

    // Default template fallback if API fails or is not configured
    if (!summaryParagraph) {
      const positiveSavings = auditResults.savings > 0;
      if (positiveSavings) {
        summaryParagraph = `Your AI software stack shows a net optimization potential of $${auditResults.savings} per month ($${auditResults.annualSavings} annually). The largest wastage vectors arise from licensing redundancies and unexploited tool integrations. We strongly advise standardizing on a core tool pairing like Cursor to eliminate overlapping costs from other autocomplete editors. This can be executed immediately by your administrative roles to shrink overall technical debt.`;
      } else {
        summaryParagraph = `Fantastic news! Your current technical toolkit is running at near-flawless efficiency levels. There are no redundant seats, unutilized minimum plan floors, or license overlap margins detected across Cursor, Claude, or ChatGPT. You are spending accurately. We suggest subscribing to our newsletter below so we can keep you notified the second new premium credit bundles or license optimizations are available for your stack.`;
      }
    }

    // Bind computed values
    auditResults.summaryText = summaryParagraph;
    const auditId = `audit-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    auditResults.id = auditId;
    auditResults.createdAt = new Date().toISOString();

    // Persist complete lead (with private coordinates)
    const completeData = {
      id: auditId,
      email: payload.email,
      companyName: payload.companyName || "Anonymized Startup",
      role: payload.role || "Developer",
      teamSize: payload.teamSize,
      primaryUseCase: payload.primaryUseCase,
      tools: payload.tools,
      results: auditResults
    };

    try {
      await fs.writeFile(
        path.join(DATA_DIR, `${auditId}.json`),
        JSON.stringify(completeData, null, 2),
        "utf8"
      );
      console.log(`[Storage] Audit record saved successfully for ID: ${auditId}`);
    } catch (saveErr) {
      console.warn(`[Storage Warning] Failed to persist data file for ID ${auditId} (Non-blocking fallback):`, saveErr);
    }

    res.json(auditResults);
  } catch (error) {
    console.error("[Billing Server Error] Failed to compute stack audit:", error);
    res.status(500).json({ error: "Server error occurred while computing audit math." });
  }
});

// REST API: Get Anonymized audit report from stored JSON (Strips emails/company labels)
app.get("/api/share/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const filePath = path.join(DATA_DIR, `${id}.json`);
    
    try {
      const raw = await fs.readFile(filePath, "utf8");
      const full = JSON.parse(raw);
      
      // ANONYMIZE client coordinates (Security & Privacy rules)
      const sanitized = {
        id: full.results.id,
        currentSpend: full.results.currentSpend,
        optimizedSpend: full.results.optimizedSpend,
        savings: full.results.savings,
        annualCurrent: full.results.annualCurrent,
        annualOptimized: full.results.annualOptimized,
        annualSavings: full.results.annualSavings,
        recommendations: full.results.recommendations,
        teamSize: full.results.teamSize,
        primaryUseCase: full.results.primaryUseCase,
        summaryText: full.results.summaryText,
        createdAt: full.results.createdAt,
        // Include raw tool models sans seats name details
        tools: Object.keys(full.tools || {}).reduce((acc: any, key) => {
          acc[key] = {
            plan: full.tools[key].plan,
            seats: full.tools[key].seats,
          };
          return acc;
        }, {})
      };
      
      res.json(sanitized);
    } catch {
      res.status(404).json({ error: "Audit audit report not found." });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to parse public audit file." });
  }
});

// DYNAMIC OG INTERPOLATOR FOR PUBLIC SHARE LINK
async function serveOGHandshake(req: express.Request, res: express.Response, isProd: boolean) {
  const { id } = req.params;
  const indexDocPath = path.join(process.cwd(), isProd ? "dist" : "", "index.html");
  
  try {
    const htmlContent = await fs.readFile(indexDocPath, "utf8");
    const recordPath = path.join(DATA_DIR, `${id}.json`);
    
    let title = "StackWise — Startup AI Spend Audit Calculator";
    let desc = "Compute and find overspending inside Cursor, ChatGPT Pro, Claude Team licensing instantly.";
    
    try {
      const rawRecord = await fs.readFile(recordPath, "utf8");
      const record = JSON.parse(rawRecord);
      const savingsVal = record.results.savings;
      
      if (savingsVal > 0) {
        title = `AI Spend Audit: Saved $${savingsVal}/mo!`;
        desc = `SpendWise computed an optimized stack savings of $${record.results.annualSavings}/year. See their detailed tool downgrade pathways now.`;
      } else {
        title = "AI Spend Audit: 100% Optimized!";
        desc = "This startup toolkit is running at peak fiscal optimization levels. Verify your own SaaS spend indices here.";
      }
    } catch {
      // Keep defaults if file parsing defaults occur
    }
    
    const metaTags = `
      <title>${title}</title>
      <meta property="og:title" content="${title}" />
      <meta property="og:description" content="${desc}" />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="${title}" />
      <meta name="twitter:description" content="${desc}" />
    `;

    // Dynamic replacement of headers
    const patchedHtml = htmlContent.replace("<head>", `<head>${metaTags}`);
    res.send(patchedHtml);
  } catch (err) {
    console.error("[OG Interceptor] Header translation failed:", err);
    res.sendFile(indexDocPath);
  }
}

// SETUP MIXED DEV/PROD ROUTING
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });

    // Intercept share routes for OG tags in dev
    app.get("/share/:id", async (req, res) => {
      await serveOGHandshake(req, res, false);
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    
    app.use(express.static(distPath, { index: false }));

    // Intercept share route for OG tags in production
    app.get("/share/:id", async (req, res) => {
      await serveOGHandshake(req, res, true);
    });

    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Credex Backend] Running on http://localhost:${PORT}`);
  });
}

if (process.env.NETLIFY !== "true") {
  startServer();
}
