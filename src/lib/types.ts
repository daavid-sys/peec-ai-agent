export interface Brand {
  name: string;
  domain?: string;
}

export interface Project {
  id: string;
  name: string;
  ownBrand: Brand;
  competitors: Brand[];
  models: string[];
  promptCount: number;
  lastSyncedAt: string;
}

export type PromptStatus =
  | "best_opportunity"
  | "critical_gap"
  | "quick_win"
  | "high_impact"
  | "already_strong"
  | "low_priority";

export interface PromptOpportunity {
  id: string;
  text: string;
  ownVisibility: number;
  topCompetitor: string;
  topCompetitorVisibility: number;
  visibilityGap: number;
  sourcesFound: number;
  hiddenQuestionsFound: number;
  openingsFound: number;
  opportunityScore: number;
  status: PromptStatus;
  // for the recommendation reasoning
  reasons?: string[];
  hiddenQuestions?: string[];
  competitorBreakdown?: { brand: string; visibility: number }[];
}

export type OpeningType =
  | "Reddit comment opportunity"
  | "Blog/editorial update pitch"
  | "YouTube creator pitch"
  | "Review request campaign"
  | "LinkedIn founder comment"
  | "FAQ/schema update"
  | "Community/forum reply"
  | "Owned comparison page"
  | "Blocked: unsafe source action";

export interface Opening {
  id: string;
  promptId: string;
  sourceName: string;
  sourceUrl: string;
  sourceType: string;
  influencedQuestions: string[];
  brandMentions: Record<string, number>;
  ownBrandPresent: boolean;
  competitorPresent: boolean;
  openingType: OpeningType;
  impactScore: number;
  riskLevel: "low" | "medium" | "high";
  status: "ready" | "needs_input" | "blocked";
  whyItMatters: string;
  missingProof: string;
  recommendedEngagement: string;
  // x-ray extras
  citationCount?: number;
  retrievalCount?: number;
  citationRate?: number;
  domainInfluence?: number;
  painSignals?: string[];
  repeatedClaims?: string[];
  blockedReason?: string;
}

export interface QualityCheck {
  label: string;
  status: "pass" | "warning" | "fail";
  note: string;
}

export interface Engagement {
  id: string;
  openingId: string;
  title: string;
  draft: string;
  targetQuestions: string[];
  targetSource: string;
  missingProofAddressed: string;
  qualityChecks: QualityCheck[];
  status: "draft" | "approved" | "sent" | "blocked";
  disclosure?: string;
  format?: "comment" | "pitch_email" | "faq_schema" | "review_brief" | "creator_pitch";
}
