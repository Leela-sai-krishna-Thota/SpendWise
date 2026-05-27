export interface ToolInput {
  plan: string;
  seats: number;
  currentSpend: number;
}

export type PrimaryUseCase = "coding" | "writing" | "data" | "research" | "mixed";

export interface AuditPayload {
  email: string;
  companyName?: string;
  role?: string;
  teamSize: number;
  primaryUseCase: PrimaryUseCase;
  tools: {
    cursor?: ToolInput;
    copilot?: ToolInput;
    claude?: ToolInput;
    chatgpt?: ToolInput;
    anthropicApi?: ToolInput;
    openaiApi?: ToolInput;
    gemini?: ToolInput;
    v0?: ToolInput;
  };
}

export interface Recommendation {
  toolId: string;
  toolName: string;
  currentPlan: string;
  recommendedAction: "downgrade" | "consolidate" | "switch" | "keep" | "upgrade";
  recommendedPlan: string;
  optimizedSpend: number;
  savings: number;
  reason: string;
}

export interface AuditResults {
  id?: string;
  currentSpend: number;
  optimizedSpend: number;
  savings: number;
  annualCurrent: number;
  annualOptimized: number;
  annualSavings: number;
  recommendations: Recommendation[];
  teamSize: number;
  primaryUseCase: PrimaryUseCase;
  summaryText?: string;
  createdAt?: string;
}

export interface dbLead {
  id: string;
  email: string;
  companyName: string;
  role: string;
  teamSize: number;
  primaryUseCase: PrimaryUseCase;
  math: {
    currentSpend: number;
    optimizedSpend: number;
    savings: number;
  };
  createdAt: string;
}
