import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { CHANNELS, classifyChannel, type Channel } from "@/lib/channel";

export type StudioDraft = {
  id: string;
  openingId: string;
  channel: Channel;
  channelLabel: string;
  channelAccent: string;
  title: string;
  actionType: string;
  competitor: string | null;
  rationale: string | null;
  impactScore: number;
  source: {
    id: string | null;
    url: string | null;
    domain: string | null;
    title: string | null;
    excerpt: string | null;
  };
  brief: string;
  fullDraft: string;
  generatedAt: string | null;
};

export type StudioDraftsResponse = {
  promptId: string;
  promptText: string | null;
  drafts: StudioDraft[];
  pendingCount: number;
};

const trimExcerpt = (value: string | null | undefined) => {
  if (!value) return null;
  const cleaned = value.replace(/\s+/g, " ").trim();
  if (!cleaned) return null;
  return cleaned.length > 280 ? `${cleaned.slice(0, 280).trimEnd()}…` : cleaned;
};

export const getStudioDrafts = createServerFn({ method: "GET" })
  .inputValidator(
    (input: { promptId: string; ownDomain?: string | null }) => input,
  )
  .handler(async ({ data }): Promise<StudioDraftsResponse> => {
    const { promptId } = data;
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
          "id, title, action_type, rationale, impact_score, competitor, source_id",
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
        drafts: [],
        pendingCount: 0,
      };
    }

    const openingIds = openings.map((o) => o.id);
    const sourceIds = Array.from(
      new Set(openings.map((o) => o.source_id).filter((x): x is string => !!x)),
    );

    const [draftsRes, sourcesRes, scrapesRes] = await Promise.all([
      supabaseAdmin
        .from("opening_drafts")
        .select(
          "opening_id, status, platform, brief, full_draft, generated_at",
        )
        .in("opening_id", openingIds),
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
    ]);

    type DraftRow = NonNullable<typeof draftsRes.data>[number];
    type SourceRow = NonNullable<typeof sourcesRes.data>[number];
    type ScrapeRow = NonNullable<typeof scrapesRes.data>[number];

    const draftByOpening = new Map<string, DraftRow>();
    for (const d of (draftsRes.data ?? []) as DraftRow[]) {
      draftByOpening.set(d.opening_id, d);
    }
    const sourceById = new Map<string, SourceRow>();
    for (const s of (sourcesRes.data ?? []) as SourceRow[]) {
      sourceById.set(s.id, s);
    }
    const scrapeBySource = new Map<string, ScrapeRow>();
    for (const s of (scrapesRes.data ?? []) as ScrapeRow[]) {
      if (s.source_id) scrapeBySource.set(s.source_id, s);
    }

    const drafts: StudioDraft[] = [];
    let pendingCount = 0;

    for (const o of openings) {
      const draft = draftByOpening.get(o.id);
      const source = o.source_id ? sourceById.get(o.source_id) ?? null : null;
      const scrape = o.source_id ? scrapeBySource.get(o.source_id) ?? null : null;
      const channel = classifyChannel({
        actionType: o.action_type,
        classification: source?.classification,
        domain: source?.domain,
        ownDomain,
      });

      if (!draft || draft.status !== "ready" || !draft.full_draft) {
        if (!draft || draft.status === "pending" || draft.status === "drafting" || draft.status === "missing") {
          pendingCount += 1;
        }
        continue;
      }

      const meta = CHANNELS[channel];
      drafts.push({
        id: o.id,
        openingId: o.id,
        channel,
        channelLabel: meta.label,
        channelAccent: meta.accent,
        title: o.title,
        actionType: o.action_type,
        competitor: o.competitor,
        rationale: o.rationale,
        impactScore: o.impact_score ?? 50,
        source: {
          id: source?.id ?? null,
          url: source?.url ?? null,
          domain: source?.domain ?? null,
          title: source?.title ?? null,
          excerpt: trimExcerpt(scrape?.summary ?? scrape?.raw_content ?? null),
        },
        brief: draft.brief ?? "",
        fullDraft: draft.full_draft,
        generatedAt: draft.generated_at,
      });
    }

    // Deduplicate drafts that would render as the same post on the same
    // platform (same channel + title + source URL + competitor + draft body
    // prefix). Multiple openings can target the same source/title with the
    // same action template, which previously surfaced as visible duplicates.
    const seen = new Set<string>();
    const uniqueDrafts: StudioDraft[] = [];
    for (const d of drafts) {
      const bodyKey = (d.fullDraft ?? "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 200)
        .toLowerCase();
      const key = [
        d.channel,
        (d.title ?? "").trim().toLowerCase(),
        (d.source.url ?? "").toLowerCase(),
        (d.competitor ?? "").toLowerCase(),
        bodyKey,
      ].join("|");
      if (seen.has(key)) continue;
      seen.add(key);
      uniqueDrafts.push(d);
    }

    return {
      promptId,
      promptText: promptRes.data?.text ?? null,
      drafts: uniqueDrafts,
      pendingCount,
    };
  });
