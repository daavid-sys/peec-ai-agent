import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { classifyChannel, type Channel } from "@/lib/channel";

export type SourceProgress = {
  id: string;
  domain: string;
  classification: string | null;
  channel: Channel;
  /** Current visibility for own brand on this source (0 or 100). */
  current: number;
  /** Projected visibility after the queued action lands (0–100). */
  target: number;
  /** Short description of the action — drives the row label. */
  action: string;
  /** Whether the user has marked the related task complete. */
  completed: boolean;
  /** Whether any draft exists for this source. */
  hasDraft: boolean;
};

export type ResultsMetrics = {
  promptId: string;
  promptText: string | null;
  /** Own brand visibility (0–100) for this prompt today. */
  beforeVisibility: number;
  /** Top competitor name and visibility (0–100). Acts as the realistic ceiling. */
  topCompetitor: string | null;
  topCompetitorVisibility: number;
  /** How many query fanouts we ran for this prompt (count of prompt_qfos). */
  fanoutCount: number;
  /** Sources ranked for this prompt — used for per-source progress UI. */
  sources: SourceProgress[];
};

export const getResultsMetrics = createServerFn({ method: "GET" })
  .inputValidator(
    (input: {
      promptId: string;
      ownDomain?: string | null;
      /** opening_drafts.opening_id values the user has marked done locally. */
      completedOpeningIds?: string[];
    }) => input,
  )
  .handler(async ({ data }): Promise<ResultsMetrics> => {
    const { promptId, ownDomain } = data;
    const completedSet = new Set(data.completedOpeningIds ?? []);

    const [promptRes, sourcesRes, openingsRes, qfosRes] = await Promise.all([
      supabaseAdmin
        .from("prompts")
        .select(
          "text, own_visibility, top_competitor, top_competitor_visibility",
        )
        .eq("id", promptId)
        .maybeSingle(),
      supabaseAdmin
        .from("prompt_sources")
        .select(
          "id, domain, classification, gap_score, own_brand_present, citation_count, citation_rate",
        )
        .eq("prompt_id", promptId)
        .order("gap_score", { ascending: false, nullsFirst: false })
        .limit(8),
      supabaseAdmin
        .from("action_openings")
        .select("id, source_id, action_type")
        .eq("prompt_id", promptId),
      supabaseAdmin
        .from("prompt_qfos")
        .select("id", { count: "exact", head: true })
        .eq("prompt_id", promptId),
    ]);

    if (promptRes.error) throw new Error(promptRes.error.message);
    if (sourcesRes.error) throw new Error(sourcesRes.error.message);
    if (openingsRes.error) throw new Error(openingsRes.error.message);

    const prompt = promptRes.data;
    const sources = sourcesRes.data ?? [];
    const openings = openingsRes.data ?? [];

    // Map source → opening_ids targeting it.
    const openingsBySource = new Map<string, { id: string; actionType: string | null }[]>();
    for (const o of openings) {
      if (!o.source_id) continue;
      const arr = openingsBySource.get(o.source_id) ?? [];
      arr.push({ id: o.id, actionType: o.action_type ?? null });
      openingsBySource.set(o.source_id, arr);
    }

    const actionLabel = (actionType: string | null, hasDraft: boolean): string => {
      if (!hasDraft) return "Blocked — no draft generated yet";
      switch ((actionType ?? "").toLowerCase()) {
        case "comment":
        case "reply":
          return "Helpful comment posted";
        case "pitch":
        case "email":
        case "outreach":
          return "Editor pitch sent";
        case "review":
          return "Review campaign launching";
        case "creator_pitch":
          return "Creator pitch sent";
        case "edit":
        case "wiki":
          return "Source edit submitted";
        case "publish":
        case "owned":
          return "Owned post published";
        default:
          return "Insertion action queued";
      }
    };

    const sourceProgress: SourceProgress[] = sources.map((s) => {
      const related = openingsBySource.get(s.id) ?? [];
      const hasDraft = related.length > 0;
      const completed = related.some((r) => completedSet.has(r.id));
      const current = s.own_brand_present ? 100 : 0;
      // Once the related action is marked complete, project source coverage to 100%.
      // Otherwise the target sits at current (no projected lift on that source yet).
      const target = completed ? 100 : current;
      const channel = classifyChannel({
        actionType: related[0]?.actionType ?? null,
        classification: s.classification ?? null,
        domain: s.domain ?? null,
        ownDomain: ownDomain ?? null,
      });
      return {
        id: s.id,
        domain: s.domain ?? "—",
        classification: s.classification ?? null,
        channel,
        current,
        target,
        action: actionLabel(related[0]?.actionType ?? null, hasDraft),
        completed,
        hasDraft,
      };
    });

    return {
      promptId,
      promptText: prompt?.text ?? null,
      beforeVisibility: Number(prompt?.own_visibility ?? 0),
      topCompetitor: prompt?.top_competitor ?? null,
      topCompetitorVisibility: Number(prompt?.top_competitor_visibility ?? 0),
      fanoutCount: qfosRes.count ?? 0,
      sources: sourceProgress,
    };
  });
