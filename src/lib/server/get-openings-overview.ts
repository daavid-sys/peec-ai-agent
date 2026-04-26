import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { CHANNELS, classifyChannel, type Channel } from "@/lib/channel";
import { dedupeOpenings } from "@/lib/server/dedupe-openings";

export type OpeningOverviewItem = {
  id: string;
  title: string;
  actionType: string;
  rationale: string | null;
  recommendedEngagement: string | null;
  impactScore: number;
  riskLevel: string;
  /** All competitors targeted by this single opening (post can call out many at once). */
  competitors: string[];
  source: {
    id: string | null;
    url: string | null;
    domain: string | null;
    title: string | null;
    classification: string | null;
    excerpt: string | null;
  };
  draft: {
    status: "pending" | "drafting" | "ready" | "failed" | "missing";
    platform: string | null;
    brief: string | null;
    fullDraft: string | null;
    generatedAt: string | null;
    error: string | null;
  };
};

export type OpeningChannelGroup = {
  channel: Channel;
  label: string;
  description: string;
  accent: string;
  total: number;
  topImpact: number;
  openings: OpeningOverviewItem[];
};

export type OpeningsOverview = {
  promptId: string;
  promptText: string | null;
  totalOpenings: number;
  groups: OpeningChannelGroup[];
};

const trimExcerpt = (value: string | null | undefined) => {
  if (!value) return null;
  const cleaned = value.replace(/\s+/g, " ").trim();
  if (!cleaned) return null;
  return cleaned.length > 360 ? `${cleaned.slice(0, 360).trimEnd()}…` : cleaned;
};

export const getOpeningsOverview = createServerFn({ method: "GET" })
  .inputValidator(
    (input: { promptId: string; ownDomain?: string | null }) => input,
  )
  .handler(async ({ data }): Promise<OpeningsOverview> => {
    const promptId = data.promptId;
    const ownDomain = data.ownDomain ?? null;

    const [promptRes, openingsRes] = await Promise.all([
      supabaseAdmin
        .from("prompts")
        .select("text")
        .eq("id", promptId)
        .maybeSingle(),
      supabaseAdmin
        .from("action_openings")
        .select(
          "id, title, action_type, rationale, recommended_engagement, impact_score, risk_level, competitor, source_id",
        )
        .eq("prompt_id", promptId)
        .order("impact_score", { ascending: false }),
    ]);
    if (openingsRes.error) throw new Error(openingsRes.error.message);

    const openings = openingsRes.data ?? [];
    if (openings.length === 0) {
      return {
        promptId,
        promptText: promptRes.data?.text ?? null,
        totalOpenings: 0,
        groups: [],
      };
    }

    const sourceIds = Array.from(
      new Set(openings.map((o) => o.source_id).filter((x): x is string => !!x)),
    );
    const openingIds = openings.map((o) => o.id);

    const [sourcesRes, scrapesRes, draftsRes] = await Promise.all([
      sourceIds.length
        ? supabaseAdmin
            .from("prompt_sources")
            .select("id, url, domain, title, classification")
            .in("id", sourceIds)
        : Promise.resolve({ data: [], error: null } as const),
      sourceIds.length
        ? supabaseAdmin
            .from("source_scrapes")
            .select("source_id, summary, raw_content")
            .in("source_id", sourceIds)
        : Promise.resolve({ data: [], error: null } as const),
      supabaseAdmin
        .from("opening_drafts")
        .select(
          "opening_id, status, platform, brief, full_draft, generated_at, error",
        )
        .in("opening_id", openingIds),
    ]);

    type SourceRow = NonNullable<typeof sourcesRes.data>[number];
    type ScrapeRow = NonNullable<typeof scrapesRes.data>[number];
    type DraftRow = NonNullable<typeof draftsRes.data>[number];

    const sourceById = new Map<string, SourceRow>();
    for (const s of (sourcesRes.data ?? []) as SourceRow[]) {
      sourceById.set(s.id, s);
    }
    const scrapeBySource = new Map<string, ScrapeRow>();
    for (const s of (scrapesRes.data ?? []) as ScrapeRow[]) {
      if (s.source_id) scrapeBySource.set(s.source_id, s);
    }
    const draftByOpening = new Map<string, DraftRow>();
    for (const d of (draftsRes.data ?? []) as DraftRow[]) {
      draftByOpening.set(d.opening_id, d);
    }

    // Collapse duplicate rows that target the same (source, action_type) with
    // different competitors — they're a single post that calls out many.
    const merged = dedupeOpenings(
      openings.map((o) => ({
        ...o,
        impact_score: o.impact_score ?? 0,
      })),
    );

    // Pick the best draft across the merged group: prefer a ready draft on
    // ANY of the merged rows, then drafting/pending, else fall back to the
    // canonical row's draft (or missing).
    const draftStatusRank: Record<string, number> = {
      ready: 5,
      drafting: 4,
      pending: 3,
      missing: 2,
      failed: 1,
    };
    const bestDraftFor = (groupIds: string[]) => {
      let best: DraftRow | null = null;
      let bestRank = -1;
      for (const id of groupIds) {
        const d = draftByOpening.get(id);
        const rank = d?.status ? (draftStatusRank[d.status] ?? 0) : 0;
        if (rank > bestRank) {
          bestRank = rank;
          best = d ?? null;
        }
      }
      return best;
    };

    const groups = new Map<Channel, OpeningOverviewItem[]>();

    for (const m of merged) {
      const o = m.canonical;
      const source = o.source_id ? sourceById.get(o.source_id) ?? null : null;
      const scrape = o.source_id ? scrapeBySource.get(o.source_id) ?? null : null;
      const channel = classifyChannel({
        actionType: o.action_type,
        classification: source?.classification,
        domain: source?.domain,
        ownDomain,
      });
      const draft = bestDraftFor(m.groupIds);

      const item: OpeningOverviewItem = {
        id: o.id,
        title: o.title,
        actionType: o.action_type,
        rationale: o.rationale,
        recommendedEngagement: o.recommended_engagement,
        impactScore: o.impact_score ?? 50,
        riskLevel: o.risk_level ?? "low",
        competitors: m.competitors,
        source: {
          id: source?.id ?? null,
          url: source?.url ?? null,
          domain: source?.domain ?? null,
          title: source?.title ?? null,
          classification: source?.classification ?? null,
          excerpt: trimExcerpt(scrape?.summary ?? scrape?.raw_content ?? null),
        },
        draft: {
          status: (draft?.status as OpeningOverviewItem["draft"]["status"]) ?? "missing",
          platform: draft?.platform ?? null,
          brief: draft?.brief ?? null,
          fullDraft: draft?.full_draft ?? null,
          generatedAt: draft?.generated_at ?? null,
          error: draft?.error ?? null,
        },
      };

      const arr = groups.get(channel) ?? [];
      arr.push(item);
      groups.set(channel, arr);
    }

    const channelOrder: Channel[] = [
      "reddit",
      "linkedin",
      "editorial",
      "listicle",
      "comparison",
      "medium",
      "youtube",
      "twitter",
      "forum",
      "owned",
      "other",
    ];

    const orderedGroups: OpeningChannelGroup[] = channelOrder
      .filter((c) => groups.has(c))
      .map((c) => {
        const items = (groups.get(c) ?? []).sort(
          (a, b) => b.impactScore - a.impactScore,
        );
        const meta = CHANNELS[c];
        return {
          channel: c,
          label: meta.label,
          description: meta.description,
          accent: meta.accent,
          total: items.length,
          topImpact: items[0]?.impactScore ?? 0,
          openings: items,
        };
      });

    return {
      promptId,
      promptText: promptRes.data?.text ?? null,
      totalOpenings: openings.length,
      groups: orderedGroups,
    };
  });
