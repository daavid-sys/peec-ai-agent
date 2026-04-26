export interface Brand {
  name: string;
  domain?: string;
}

export interface BrandReportEntry {
  visibility: number;
  shareOfVoice: number;
  sentiment: number;
  position: number;
}

export interface ActionRow {
  action_group_type: string;
  url_classification: string | null;
  domain: string | null;
  opportunity_score: number;
  relative_opportunity_score: number;
  gap_percentage: number;
  coverage_percentage: number;
  used_ratio: number;
  used_total: number;
}

export interface Project {
  id: string;
  name: string;
  ownBrand: Brand;
  competitors: Brand[];
  models: string[];
  promptCount: number;
  lastSyncedAt: string;
  topics?: string[];
  brandReport?: Record<string, BrandReportEntry>;
  topActions?: ActionRow[];
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
  topic?: string;
  volume?: string;
  ownVisibility: number;
  topCompetitor: string;
  topCompetitorVisibility: number;
  visibilityGap: number;
  sourcesFound: number;
  hiddenQuestionsFound: number;
  openingsFound: number;
  opportunityScore: number;
  status: PromptStatus;
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
