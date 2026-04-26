import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type ActionPlanSource = {
  id: string;
  url: string;
  domain: string | null;
  title: string | null;
  classification: string | null;
  citation_count: number;
  retrieval_count: number;
  citation_rate: number;
  own_brand_present: boolean;
  competitor_brands: string[];
  gap_score: number;
  scrape_status: string | null;
  mentions: ActionPlanMention[];
  openings: ActionPlanOpening[];
};

export type ActionPlanMention = {
  id: string;
  competitor: string;
  quote: string;
  context: string | null;
};

export type ActionPlanOpening = {
  id: string;
  source_id: string | null;
  competitor: string | null;
  action_type: string;
  title: string;
  rationale: string | null;
  recommended_engagement: string | null;
  impact_score: number;
  risk_level: string;
  status: string;
};

export type ActionPlanQfo = {
  id: string;
  query_text: string;
  model_id: string | null;
};

export type ActionPlan = {
  prompt: {
    id: string;
    text: string;
    topic: string | null;
    own_visibility: number;
    top_competitor: string | null;
    top_competitor_visibility: number;
    visibility_gap: number;
    opportunity_score: number;
    hidden_questions: string[];
    competitor_breakdown: { brand: string; visibility: number }[];
  } | null;
  sources: ActionPlanSource[];
  qfos: ActionPlanQfo[];
  openings: ActionPlanOpening[];
  summary: {
    total_sources: number;
    gap_sources: number;
    competitor_mentions: number;
    openings: number;
    scraped: number;
  };
};

export const getActionPlan = createServerFn({ method: "GET" })
  .inputValidator((input: { promptId: string }) => input)
  .handler(async ({ data }): Promise<ActionPlan> => {
    const promptId = data.promptId;

    const [{ data: promptRow }, { data: sourceRows }, { data: qfoRows }, { data: scrapeRows }, { data: mentionRows }, { data: openingRows }] =
      await Promise.all([
        supabaseAdmin.from("prompts").select("*").eq("id", promptId).maybeSingle(),
        supabaseAdmin
          .from("prompt_sources")
          .select("*")
          .eq("prompt_id", promptId)
          .order("retrieval_count", { ascending: false }),
        supabaseAdmin
          .from("prompt_qfos")
          .select("id, query_text, model_id")
          .eq("prompt_id", promptId),
        supabaseAdmin.from("source_scrapes").select("source_id, status"),
        supabaseAdmin
          .from("competitor_mentions")
          .select("id, source_id, competitor, quote, context")
          .eq("prompt_id", promptId),
        supabaseAdmin
          .from("action_openings")
          .select(
            "id, source_id, competitor, action_type, title, rationale, recommended_engagement, impact_score, risk_level, status",
          )
          .eq("prompt_id", promptId)
          .order("impact_score", { ascending: false }),
      ]);

    const scrapeBySource = new Map<string, string>();
    for (const s of scrapeRows ?? []) {
      if (s.source_id) scrapeBySource.set(s.source_id, s.status);
    }
    const mentionsBySource = new Map<string, ActionPlanMention[]>();
    for (const m of mentionRows ?? []) {
      const arr = mentionsBySource.get(m.source_id) ?? [];
      arr.push({
        id: m.id,
        competitor: m.competitor,
        quote: m.quote,
        context: m.context,
      });
      mentionsBySource.set(m.source_id, arr);
    }
    const openingsBySource = new Map<string, ActionPlanOpening[]>();
    for (const o of openingRows ?? []) {
      if (!o.source_id) continue;
      const arr = openingsBySource.get(o.source_id) ?? [];
      arr.push({
        id: o.id,
        source_id: o.source_id,
        competitor: o.competitor,
        action_type: o.action_type,
        title: o.title,
        rationale: o.rationale,
        recommended_engagement: o.recommended_engagement,
        impact_score: o.impact_score ?? 50,
        risk_level: o.risk_level ?? "low",
        status: o.status ?? "ready",
      });
      openingsBySource.set(o.source_id, arr);
    }

    const sources: ActionPlanSource[] = (sourceRows ?? []).map((s) => ({
      id: s.id,
      url: s.url,
      domain: s.domain,
      title: s.title,
      classification: s.classification,
      citation_count: s.citation_count ?? 0,
      retrieval_count: s.retrieval_count ?? 0,
      citation_rate: Number(s.citation_rate ?? 0),
      own_brand_present: !!s.own_brand_present,
      competitor_brands: s.competitor_brands ?? [],
      gap_score: s.gap_score ?? 0,
      scrape_status: scrapeBySource.get(s.id) ?? null,
      mentions: mentionsBySource.get(s.id) ?? [],
      openings: openingsBySource.get(s.id) ?? [],
    }));

    const allOpenings: ActionPlanOpening[] = (openingRows ?? []).map((o) => ({
      id: o.id,
      source_id: o.source_id,
      competitor: o.competitor,
      action_type: o.action_type,
      title: o.title,
      rationale: o.rationale,
      recommended_engagement: o.recommended_engagement,
      impact_score: o.impact_score ?? 50,
      risk_level: o.risk_level ?? "low",
      status: o.status ?? "ready",
    }));

    const promptOut = promptRow
      ? {
          id: promptRow.id,
          text: promptRow.text,
          topic: promptRow.topic,
          own_visibility: Number(promptRow.own_visibility ?? 0),
          top_competitor: promptRow.top_competitor,
          top_competitor_visibility: Number(promptRow.top_competitor_visibility ?? 0),
          visibility_gap: Number(promptRow.visibility_gap ?? 0),
          opportunity_score: Number(promptRow.opportunity_score ?? 0),
          hidden_questions: (promptRow.hidden_questions as string[]) ?? [],
          competitor_breakdown:
            (promptRow.competitor_breakdown as { brand: string; visibility: number }[]) ?? [],
        }
      : null;

    return {
      prompt: promptOut,
      sources,
      qfos: (qfoRows ?? []).map((q) => ({
        id: q.id,
        query_text: q.query_text,
        model_id: q.model_id,
      })),
      openings: allOpenings,
      summary: {
        total_sources: sources.length,
        gap_sources: sources.filter((s) => s.gap_score > 0).length,
        competitor_mentions: mentionRows?.length ?? 0,
        openings: allOpenings.length,
        scraped: Array.from(scrapeBySource.values()).filter((s) => s === "done").length,
      },
    };
  });
