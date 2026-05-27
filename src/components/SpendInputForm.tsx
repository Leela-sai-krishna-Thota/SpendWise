import React, { useState, useEffect } from "react";
import { AuditPayload, PrimaryUseCase } from "../types";
import { AlertTriangle, HelpCircle, Layers, Check, Calculator } from "lucide-react";

interface SpendInputFormProps {
  onSubmit: (payload: AuditPayload) => void;
  loading: boolean;
}

export default function SpendInputForm({ onSubmit, loading }: SpendInputFormProps) {
  // Main form states
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [teamSize, setTeamSize] = useState(1);
  const [primaryUseCase, setPrimaryUseCase] = useState<PrimaryUseCase>("coding");

  // Tool active states and specs
  const [activeTools, setActiveTools] = useState<Record<string, boolean>>({
    cursor: false,
    copilot: false,
    claude: false,
    chatgpt: false,
    anthropicApi: false,
    openaiApi: false,
    gemini: false,
    v0: false,
  });

  const [toolInputs, setToolInputs] = useState<Record<string, { plan: string; seats: number; currentSpend: number }>>({
    cursor: { plan: "Pro", seats: 1, currentSpend: 20 },
    copilot: { plan: "Individual", seats: 1, currentSpend: 10 },
    claude: { plan: "Pro", seats: 1, currentSpend: 20 },
    chatgpt: { plan: "Plus", seats: 1, currentSpend: 20 },
    anthropicApi: { plan: "API Access", seats: 1, currentSpend: 50 },
    openaiApi: { plan: "API Keys", seats: 1, currentSpend: 50 },
    gemini: { plan: "Pro", seats: 1, currentSpend: 20 },
    v0: { plan: "Premium", seats: 1, currentSpend: 20 },
  });

  // Load from local storage on bootstrap (Task Requirement: Form state must persist)
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem("spend_email");
      const savedCompany = localStorage.getItem("spend_company");
      const savedRole = localStorage.getItem("spend_role");
      const savedSize = localStorage.getItem("spend_teamSize");
      const savedUseCase = localStorage.getItem("spend_useCase");
      const savedActive = localStorage.getItem("spend_activeTools");
      const savedInputs = localStorage.getItem("spend_toolInputs");

      if (savedEmail) setEmail(savedEmail);
      if (savedCompany) setCompanyName(savedCompany);
      if (savedRole) setRole(savedRole);
      if (savedSize) setTeamSize(parseInt(savedSize, 10));
      if (savedUseCase) setPrimaryUseCase(savedUseCase as PrimaryUseCase);
      if (savedActive) setActiveTools(JSON.parse(savedActive));
      if (savedInputs) setToolInputs(JSON.parse(savedInputs));
    } catch (e) {
      console.error("Local storage restoration failed:", e);
    }
  }, []);

  // Save changes to localStorage
  const saveToStorage = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error("Failed to write to local storage", e);
    }
  };

  const handleActiveToggle = (toolId: string) => {
    const updated = { ...activeTools, [toolId]: !activeTools[toolId] };
    setActiveTools(updated);
    saveToStorage("spend_activeTools", JSON.stringify(updated));
  };

  const handleToolChange = (toolId: string, field: string, value: any) => {
    const updated = {
      ...toolInputs,
      [toolId]: {
        ...toolInputs[toolId],
        [field]: value,
      },
    };

    // Auto calculate approximate monthly spend based on updated Plan & Seats rules to make inputs easier
    if (field === "plan" || field === "seats") {
      const planVal = (field === "plan" ? value : toolInputs[toolId].plan).toLowerCase();
      const seatsVal = field === "seats" ? value : toolInputs[toolId].seats;
      let unitCost = 0;

      if (toolId === "cursor") {
        if (planVal === "hobby") unitCost = 0;
        else if (planVal === "pro") unitCost = 20;
        else if (planVal === "business") unitCost = 40;
        else if (planVal === "enterprise") unitCost = 100;
      } else if (toolId === "copilot") {
        if (planVal === "individual") unitCost = 10;
        else if (planVal === "business") unitCost = 19;
        else if (planVal === "enterprise") unitCost = 39;
      } else if (toolId === "claude") {
        if (planVal === "free") unitCost = 0;
        else if (planVal === "pro") unitCost = 20;
        else if (planVal === "team") unitCost = 30;
        else if (planVal === "enterprise") unitCost = 75;
      } else if (toolId === "chatgpt") {
        if (planVal === "plus") unitCost = 20;
        else if (planVal === "team") unitCost = 30;
        else if (planVal === "enterprise") unitCost = 60;
      } else if (toolId === "v0") {
        if (planVal === "free") unitCost = 0;
        else if (planVal === "premium") unitCost = 20;
        else if (planVal === "team") unitCost = 30;
      } else if (toolId === "gemini") {
        unitCost = 20;
      }

      // Respect minimum seat limits for Team packages
      let billableSeats = seatsVal;
      if (toolId === "claude" && planVal === "team") {
        billableSeats = Math.max(seatsVal, 5); // 5-seat floor
      } else if (toolId === "chatgpt" && planVal === "team") {
        billableSeats = Math.max(seatsVal, 2); // 2-seat floor
      }

      updated[toolId].currentSpend = unitCost * billableSeats;
    }

    setToolInputs(updated);
    saveToStorage("spend_toolInputs", JSON.stringify(updated));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Filter tools that are actually checked active
    const finalTools: Record<string, any> = {};
    Object.keys(activeTools).forEach(k => {
      if (activeTools[k]) {
        finalTools[k] = toolInputs[k];
      }
    });

    const payload: AuditPayload = {
      email,
      companyName,
      role,
      teamSize,
      primaryUseCase,
      tools: finalTools,
    };

    onSubmit(payload);
  };

  // Helper lists of plan configurations
  const plansMap: Record<string, string[]> = {
    cursor: ["Hobby", "Pro", "Business", "Enterprise"],
    copilot: ["Individual", "Business", "Enterprise"],
    claude: ["Free", "Pro", "Max", "Team", "Enterprise", "API direct"],
    chatgpt: ["Plus", "Team", "Enterprise", "API direct"],
    anthropicApi: ["API Access"],
    openaiApi: ["API Keys"],
    gemini: ["Pro", "Ultra", "API"],
    v0: ["Free", "Premium", "Team"],
  };

  const toolDisplayNames: Record<string, string> = {
    cursor: "Cursor IDE",
    copilot: "GitHub Copilot",
    claude: "Claude AI (Anthropic)",
    chatgpt: "ChatGPT (OpenAI)",
    anthropicApi: "Anthropic API keys",
    openaiApi: "OpenAI API keys",
    gemini: "Gemini Advanced",
    v0: "v0.dev by Vercel",
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-8">
      {/* SECTION 1: USER AND COMPANY METADATA CARD */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-teal-500/5 blur-3xl rounded-full" />
        <h2 className="text-lg font-medium tracking-tight text-white mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-teal-400" />
          1. Company & Profile Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
              Email Address <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                saveToStorage("spend_email", e.target.value);
              }}
              placeholder="e.g. founder@mycompany.com"
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-teal-500/50 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
              Company Name <span className="text-zinc-500">(Optional)</span>
            </label>
            <input
              type="text"
              value={companyName}
              onChange={e => {
                setCompanyName(e.target.value);
                saveToStorage("spend_company", e.target.value);
              }}
              placeholder="e.g. Acme Tech"
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-teal-400/50 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
              My Role <span className="text-zinc-500">(Optional)</span>
            </label>
            <input
              type="text"
              value={role}
              onChange={e => {
                setRole(e.target.value);
                saveToStorage("spend_role", e.target.value);
              }}
              placeholder="e.g. VP of Engineering"
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-teal-400/50 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
              Productive Team Size
            </label>
            <input
              type="number"
              min={1}
              value={teamSize}
              onChange={e => {
                const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                setTeamSize(val);
                saveToStorage("spend_teamSize", val.toString());
              }}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-teal-400/50 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none transition-colors"
            />
          </div>

          <div className="md:col-span-1 lg:col-span-2">
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
              Primary AI System Use Case
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(["coding", "writing", "data", "research", "mixed"] as PrimaryUseCase[]).map(uc => (
                <button
                  key={uc}
                  type="button"
                  onClick={() => {
                    setPrimaryUseCase(uc);
                    saveToStorage("spend_useCase", uc);
                  }}
                  className={`border text-xs px-2.5 py-2 rounded-lg capitalize font-medium transition-all ${
                    primaryUseCase === uc
                      ? "bg-teal-500/10 border-teal-500/40 text-teal-300"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  {uc}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: AI STACK SELECTOR AND INPUT VALUES */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium tracking-tight text-white flex items-center gap-2">
          <Calculator className="w-5 h-5 text-teal-400" />
          2. Customize Your AI Stack
        </h2>
        <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
          Toggle the checkboxes for the tools your crew utilizes. Fill out the seat counts and monthly bills; we will auto-estimate normal list prices or highlight sneaker contract ceilings!
        </p>

        <div className="grid grid-cols-1 gap-4">
          {Object.keys(toolDisplayNames).map(toolId => {
            const isActive = activeTools[toolId];
            const data = toolInputs[toolId];
            const plans = plansMap[toolId];

            return (
              <div
                key={toolId}
                className={`border rounded-xl p-4 sm:p-5 transition-all duration-200 ${
                  isActive
                    ? "bg-zinc-900 border-teal-500/30 shadow-md shadow-teal-500/5"
                    : "bg-zinc-900/40 border-zinc-800/60 opacity-75 hover:opacity-100 hover:border-zinc-700"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Tool Active Trigger */}
                  <label className="flex items-center gap-3.5 cursor-pointer select-none">
                    <div
                      onClick={() => handleActiveToggle(toolId)}
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                        isActive
                          ? "bg-teal-500 border-teal-500 text-black"
                          : "border-zinc-700 bg-zinc-950"
                      }`}
                    >
                      {isActive && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-white tracking-wide block sm:inline">
                        {toolDisplayNames[toolId]}
                      </span>
                      {toolId === "claude" && isActive && data.plan === "Team" && (
                        <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-1.5 py-0.5 rounded-full ml-2 font-mono">
                          5-seat minimum
                        </span>
                      )}
                      {toolId === "chatgpt" && isActive && data.plan === "Team" && (
                        <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-1.5 py-0.5 rounded-full ml-2 font-mono">
                          2-seat minimum
                        </span>
                      )}
                    </div>
                  </label>

                  {/* Settings Panel (Visible only when tool checkbox is checked) */}
                  {isActive && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full sm:w-auto mt-2 sm:mt-0 animate-fade-in">
                      {/* Plan Column */}
                      <div>
                        <label className="block text-[10px] font-medium text-zinc-500 mb-1 uppercase tracking-wider">
                          Contract Plan
                        </label>
                        <select
                          value={data.plan}
                          onChange={e => handleToolChange(toolId, "plan", e.target.value)}
                          className="bg-zinc-950 border border-zinc-800 focus:border-teal-500/50 rounded-lg text-xs px-2.5 py-1.5 text-zinc-200 w-full focus:outline-none font-medium"
                        >
                          {plans.map(p => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Seats/Users Column */}
                      {!(toolId === "anthropicApi" || toolId === "openaiApi") ? (
                        <div>
                          <label className="block text-[10px] font-medium text-zinc-500 mb-1 uppercase tracking-wider">
                            Seats Utilized
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={data.seats}
                            onChange={e => {
                              const v = Math.max(1, parseInt(e.target.value, 10) || 1);
                              handleToolChange(toolId, "seats", v);
                            }}
                            className="bg-zinc-950 border border-zinc-800 focus:border-teal-500/50 rounded-lg text-xs px-2.5 py-1 text-white w-full sm:w-20 focus:outline-none"
                          />
                        </div>
                      ) : (
                        <div className="invisible hidden sm:block w-20" />
                      )}

                      {/* Custom Monthly Spend input */}
                      <div>
                        <label className="block text-[10px] font-medium text-zinc-500 mb-1 uppercase tracking-wider flex items-center gap-1">
                          Monthly Spend ($)
                          <span title="You can customize standard computed estimates if different." className="text-zinc-600 cursor-help">
                            <HelpCircle className="w-3 h-3" />
                          </span>
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={data.currentSpend}
                          onChange={e => {
                            const val = Math.max(0, parseFloat(e.target.value) || 0);
                            handleToolChange(toolId, "currentSpend", val);
                          }}
                          className="bg-zinc-950 border border-zinc-800 focus:border-teal-500/50 rounded-lg text-xs px-2.5 py-1 text-white w-full sm:w-28 focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SUBMISSION FOOTER WITH HONEYPOT AND TRIGGER ACTIONS */}
      {/* Hidden honeypot field for anti-abuse */}
      <input
        type="text"
        name="honeypot"
        className="hidden absolute -top-96 left-0"
        value=""
        readOnly
      />

      <div className="border-t border-zinc-800/80 pt-6 flex flex-col sm:flex-row items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 text-zinc-500 text-xs">
          <AlertTriangle className="w-4 h-4 text-zinc-600" />
          <span>No login. Secure & client-side parsing. Verified weekly rates.</span>
        </div>

        <button
          type="submit"
          disabled={loading || !email}
          className={`w-full sm:w-auto px-8 py-3.5 rounded-lg text-black font-semibold text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${
            loading || !email
              ? "bg-zinc-700 text-zinc-500 cursor-not-allowed"
              : "bg-teal-400 hover:bg-teal-300 shadow-teal-500/10 cursor-pointer"
          }`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Auditing Stack...
            </span>
          ) : (
            <>
              Compute Audit Report
            </>
          )}
        </button>
      </div>
    </form>
  );
}
