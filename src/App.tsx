import React, { useState, useEffect } from "react";
import SpendInputForm from "./components/SpendInputForm";
import ReportView from "./components/ReportView";
import { AuditPayload, AuditResults } from "./types";
import { CreditCard, ShieldCheck, Cpu } from "lucide-react";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AuditResults | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Custom router logic to parse share pages (e.g. /share/:id) on iframe/browser refreshes
  const [shareId, setShareId] = useState<string | null>(null);

  useEffect(() => {
    const pathParts = window.location.pathname.split("/");
    const id = pathParts[1] === "share" ? pathParts[2] : null;
    
    if (id) {
      setShareId(id);
      fetchSharedReport(id);
    }
  }, []);

  const fetchSharedReport = async (id: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch(`/api/share/${id}`);
      if (!response.ok) {
        throw new Error(`This audit session could not be retrieved (${response.status}: ${response.statusText || "Not Found"}).`);
      }
      
      let data;
      try {
        data = await response.json();
      } catch (err) {
        throw new Error("Invalid response format received from the server. Please match server setup configurations.");
      }
      setResults(data);
    } catch (e: any) {
      setErrorMsg(e.message || "An unexpected error occurred while parsing the share link.");
    } finally {
      setLoading(false);
    }
  };

  const handleAuditSubmit = async (payload: AuditPayload) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errMsg = "Server error occurred while executing the savings audit.";
        try {
          const errData = await response.json();
          errMsg = errData.message || errData.error || errData.errorMessage || errMsg;
        } catch (_) {
          // If response is not JSON (e.g. gateway timeout or raw HTML error from server/Netlify)
          errMsg = `Server error (${response.status}): ${response.statusText || "Unable to complete request"}`;
        }
        throw new Error(errMsg);
      }

      let data;
      try {
        data = await response.json();
      } catch (err) {
        throw new Error("Unable to parse successful response logic into JSON format.");
      }
      setResults(data);
      
      // Update history state so URL updates smoothly without full reloads
      if (data.id) {
        window.history.pushState(null, "", `/share/${data.id}`);
      }
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to finalize the audit. Verify connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setErrorMsg(null);
    setShareId(null);
    window.history.pushState(null, "", "/");
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans selection:bg-teal-500/30 selection:text-teal-200">
      {/* GLOBAL HIGH-LEVEL BRANDED NAVIGATION HEADER */}
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={handleReset}>
            <div className="w-8 h-8 rounded-lg bg-teal-400 flex items-center justify-center text-black font-extrabold text-sm shadow-md shadow-teal-500/20">
              C
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-white text-base">
                SpendWise
              </span>
              <span className="text-[10px] text-zinc-500 font-mono block -mt-1">
                by CREDEX
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-semibold text-zinc-400">
            <a
              href="https://credex.rocks"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-500 hover:text-white transition-colors"
            >
              credex.rocks
            </a>
          </div>
        </div>
      </header>

      {/* CORE WRAPPER SECTION */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* HERO TYPOGRAPHY */}
        {!results && !loading && (
          <div className="space-y-4 mb-10 text-center max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-4.5xl font-black text-white tracking-tight leading-tighter">
              Stop Overpaying for Developer AI Tooling.
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              Find multi-seat licensing floors, overlapping editor subscriptions, and custom downgrade pathways in 60 seconds. Privacy-first, zero login.
            </p>
          </div>
        )}

        {/* LOADING SCREEN CONTAINER */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border border-teal-500/25 border-t-teal-400 animate-spin" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <Cpu className="w-5 h-5 text-teal-400" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">Evaluating Stack Metrics...</p>
              <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
                Applying deterministic contract rules regarding Claude Team boundaries and resolving Cursor redundancies.
              </p>
            </div>
          </div>
        )}

        {/* ERROR HANDLERS */}
        {errorMsg && !loading && (
          <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-5 text-center space-y-3 mb-8 max-w-lg mx-auto">
            <p className="text-xs font-semibold text-red-400">{errorMsg}</p>
            <button
              onClick={handleReset}
              className="text-xs font-bold text-white bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded transition-colors"
            >
              Return Home
            </button>
          </div>
        )}

        {/* AUDITING INTERFACES */}
        {!loading && !errorMsg && (
          <div>
            {results ? (
              <ReportView
                results={results}
                onReset={handleReset}
                isSharedView={!!shareId}
              />
            ) : (
              <SpendInputForm onSubmit={handleAuditSubmit} loading={loading} />
            )}
          </div>
        )}
      </main>

      {/* SECURE SUB-FOOTER SUMMARY INFORMATION */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <h4 className="text-xs uppercase font-extrabold tracking-widest text-white">
              Data Privacy & Security
            </h4>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              StackWise is a utility built with high data integrity constraints. Because we require manual configuration, we never request GSuite write access, conserving high-security startup parameters.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs uppercase font-extrabold tracking-widest text-white">
              Deterministic Logic
            </h4>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Every computed layout recommendation matches the verified list terms within our public repositories. No unneeded calculations are ever injected. See <span className="text-teal-400 font-semibold font-mono">PRICING_DATA.md</span>.
            </p>
          </div>

          <div className="space-y-1">
            <h4 className="text-xs uppercase font-extrabold tracking-widest text-white">
              Credex Arbitrage
            </h4>
            <div className="flex items-center gap-1.5 p-2 bg-zinc-900 border border-zinc-805/50 rounded-lg">
              <div className="w-5 h-5 rounded bg-teal-500/10 flex items-center justify-center text-[10px] text-teal-400 font-mono font-bold">
                $
              </div>
              <p className="text-[10px] text-zinc-400 leading-relaxed">
                Secondary credit bundles represent verified failed-startup asset transfers, helping secure 25%+ retail SaaS margins perfectly.
              </p>
            </div>
          </div>
        </div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-10 border-t border-zinc-900/60 pt-6 flex flex-col sm:flex-row sm:justify-between items-center gap-4">
          <span className="text-[10px] text-zinc-600 font-mono">
            © 2026 Credex Inc. All rights reserved.
          </span>
          <span className="text-[10px] text-zinc-600 font-mono">
            Designed for Round 1 Web Developer Assignment
          </span>
        </div>
      </footer>
    </div>
  );
}
