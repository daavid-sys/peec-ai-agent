import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { classifyChannel, type Channel } from "@/lib/channel";
import { dedupeOpenings } from "@/lib/server/dedupe-openings";

const MODEL = "google/gemini-3-flash-preview";
const MAX_PER_CALL = 8;

type OpeningRow = {
  id: string;
  title: string;
  action_type: string;
  rationale: string | null;
  recommended_engagement: string | null;
  competitor: string | null;
  prompt_id: string;
  source_id: string | null;
  impact_score: number | null;
};

/** A merged opening to draft for: canonical row + the full competitor list. */
type DraftJob = {
  opening: OpeningRow;
  competitors: string[];
  /** All opening_ids in the merged group (so we can mark them all done). */
  groupIds: string[];
};

type SourceRow = {
  id: string;
  url: string;
  domain: string | null;
  title: string | null;
  classification: string | null;
};

type ScrapeRow = {
  source_id: string;
  summary: string | null;
  raw_content: string | null;
};

type DraftJson = {
  brief: string;
  full_draft: string;
};

const trim = (value: string | null | undefined, max = 1500) => {
  if (!value) return "";
  const cleaned = value.replace(/\s+/g, " ").trim();
  return cleaned.length > max ? `${cleaned.slice(0, max)}…` : cleaned;
};

async function callLovableAi(args: {
  promptText: string;
  ownBrand: string;
  channel: Channel;
  opening: OpeningRow;
  competitors: string[];
  source: SourceRow | null;
  scrape: ScrapeRow | null;
}): Promise<DraftJson> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

  // Up to 4 named competitors keeps drafts strong without rambling.
  const namedCompetitors = args.competitors.slice(0, 4);
  const remainingCompetitors = Math.max(0, args.competitors.length - 4);

  const evidence = {
    promptText: args.promptText,
    ownBrand: args.ownBrand,
    channel: args.channel,
    opening: {
      title: args.opening.title,
      actionType: args.opening.action_type,
      rationale: args.opening.rationale,
      recommendedEngagement: args.opening.recommended_engagement,
      // ONE post can target many competitors at once — name them all in the draft.
      competitors: namedCompetitors,
      additionalCompetitors:
        remainingCompetitors > 0 ? `and ${remainingCompetitors} others` : null,
    },
    source: args.source
      ? {
          domain: args.source.domain,
          title: args.source.title,
          url: args.source.url,
          classification: args.source.classification,
        }
      : null,
    scrapeExcerpt: trim(args.scrape?.summary ?? args.scrape?.raw_content, 2400),
  };

  const systemPrompt = [
    "You are Peec's Engagement Studio drafting agent.",
    "You write PUBLISHABLE platform-native content drafts for the user's brand based on real cited sources and scraped page content.",
    "CRITICAL: full_draft is the actual content that would be PUBLISHED on the platform — NOT a pitch, email, or message to the publication's editor.",
    "For blog/editorial: write the article itself as if it were already accepted and published. Do NOT address the publication (no 'Your recent guide…', no 'I'd love to contribute…', no 'Hi team', no 'caught our attention'). Write in third person or the brand's editorial voice, with H2 headings, body paragraphs, and a closing — exactly like a real blog post a reader would see.",
    "For Reddit: write the comment as it would appear under the thread. For LinkedIn: write the post as it would appear in the feed.",
    "Always cite the specific evidence you saw in the scrape — never invent quotes. The pitch email is generated separately; do not include any pitch framing inside full_draft.",
    "Tone matches the channel: Reddit = candid first-person, LinkedIn = professional but human, blog/editorial = structured editorial argument, listicle/comparison = factual entry.",
    "Never use marketing fluff. No emojis unless channel is reddit/twitter and tone allows it.",
  ].join(" ");

  const tools = [
    {
      type: "function",
      function: {
        name: "submit_draft",
        description:
          "Return the brief overview and the actual publishable draft content for this opening.",
        parameters: {
          type: "object",
          properties: {
            brief: {
              type: "string",
              description:
                "1-2 sentence plain-language overview of what this draft does and why it wins for this prompt. Specific to the cited source. Max 240 chars.",
            },
            full_draft: {
              type: "string",
              description:
                "The actual PUBLISHED content as it would appear on the platform — NEVER a pitch or email to the publication. For Reddit: the comment body. For LinkedIn: the post body. For editorial/blog: a 250-450 word standalone article with H2 headings, written in editorial voice — do NOT address the publication's editors, do NOT start with 'Your recent guide' or 'I'd love to contribute', do NOT include any pitch framing. The article should reference the cited source as a reader would (e.g. 'A recent guide on lead routing notes that…') rather than as a pitch. For listicle: the proposed insertion entry (50-120 words). For comparison: the missing row content.",
            },
          },
          required: ["brief", "full_draft"],
          additionalProperties: false,
        },
      },
    },
  ];

  const response = await fetch(
    "https://ai.gateway.lovable.dev/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify(evidence) },
        ],
        tools,
        tool_choice: { type: "function", function: { name: "submit_draft" } },
      }),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AI gateway ${response.status}: ${text.slice(0, 300)}`);
  }

  const json = (await response.json()) as {
    choices?: {
      message?: {
        content?: string;
        tool_calls?: { function?: { arguments?: string } }[];
      };
    }[];
  };
  const message = json.choices?.[0]?.message;
  const args2 = message?.tool_calls?.[0]?.function?.arguments ?? message?.content;
  if (!args2) throw new Error("Empty AI response");
  const parsed = JSON.parse(args2) as Partial<DraftJson>;
  if (!parsed.brief || !parsed.full_draft) {
    throw new Error("AI response missing brief or full_draft");
  }
  return { brief: parsed.brief, full_draft: parsed.full_draft };
}

async function generateDraftFor(
  opening: OpeningRow,
  ctx: {
    promptText: string;
    ownBrand: string;
    ownDomain: string | null;
    sourceById: Map<string, SourceRow>;
    scrapeBySource: Map<string, ScrapeRow>;
  },
) {
  const source = opening.source_id ? ctx.sourceById.get(opening.source_id) ?? null : null;
  const scrape = opening.source_id ? ctx.scrapeBySource.get(opening.source_id) ?? null : null;
  const channel = classifyChannel({
    actionType: opening.action_type,
    classification: source?.classification,
    domain: source?.domain,
    ownDomain: ctx.ownDomain,
  });

  // Mark drafting
  await supabaseAdmin
    .from("opening_drafts")
    .upsert(
      {
        opening_id: opening.id,
        platform: channel,
        status: "drafting",
        model: MODEL,
        error: null,
      },
      { onConflict: "opening_id" },
    );

  try {
    const draft = await callLovableAi({
      promptText: ctx.promptText,
      ownBrand: ctx.ownBrand,
      channel,
      opening,
      source,
      scrape,
    });
    await supabaseAdmin
      .from("opening_drafts")
      .upsert(
        {
          opening_id: opening.id,
          platform: channel,
          status: "ready",
          brief: draft.brief,
          full_draft: draft.full_draft,
          model: MODEL,
          generated_at: new Date().toISOString(),
          error: null,
        },
        { onConflict: "opening_id" },
      );
  } catch (err) {
    await supabaseAdmin
      .from("opening_drafts")
      .upsert(
        {
          opening_id: opening.id,
          platform: channel,
          status: "failed",
          error: err instanceof Error ? err.message : String(err),
          model: MODEL,
        },
        { onConflict: "opening_id" },
      );
  }
}

export type EnqueueDraftsResult = {
  promptId: string;
  totalOpenings: number;
  alreadyHaveDraft: number;
  enqueued: number;
  finishedThisCall: number;
};

/**
 * Eagerly create drafts for any opening on this prompt that doesn't yet have one.
 * Returns immediately after at most MAX_PER_CALL drafts have been generated;
 * the client polls getOpeningsOverview to see the rest stream in (calling this
 * fn again will pick up the next batch).
 */
export const enqueueOpeningDrafts = createServerFn({ method: "POST" })
  .inputValidator(
    (input: { promptId: string; ownBrand: string; ownDomain?: string | null }) =>
      input,
  )
  .handler(async ({ data }): Promise<EnqueueDraftsResult> => {
    const { promptId, ownBrand } = data;
    const ownDomain = data.ownDomain ?? null;

    const promptRes = await supabaseAdmin
      .from("prompts")
      .select("text")
      .eq("id", promptId)
      .maybeSingle();
    const promptText = promptRes.data?.text ?? "";

    const openingsRes = await supabaseAdmin
      .from("action_openings")
      .select(
        "id, title, action_type, rationale, recommended_engagement, competitor, prompt_id, source_id",
      )
      .eq("prompt_id", promptId)
      .order("impact_score", { ascending: false });
    if (openingsRes.error) throw new Error(openingsRes.error.message);
    const openings = (openingsRes.data ?? []) as OpeningRow[];

    if (openings.length === 0) {
      return {
        promptId,
        totalOpenings: 0,
        alreadyHaveDraft: 0,
        enqueued: 0,
        finishedThisCall: 0,
      };
    }

    const draftsRes = await supabaseAdmin
      .from("opening_drafts")
      .select("opening_id, status")
      .in(
        "opening_id",
        openings.map((o) => o.id),
      );
    const haveDraft = new Map<string, string>();
    for (const d of draftsRes.data ?? []) {
      haveDraft.set(d.opening_id, d.status ?? "pending");
    }

    // We re-try failed drafts but skip ready / drafting (someone else is on it).
    const todo = openings.filter((o) => {
      const s = haveDraft.get(o.id);
      return !s || s === "pending" || s === "failed";
    });

    if (todo.length === 0) {
      return {
        promptId,
        totalOpenings: openings.length,
        alreadyHaveDraft: openings.length,
        enqueued: 0,
        finishedThisCall: 0,
      };
    }

    const batch = todo.slice(0, MAX_PER_CALL);

    // Mark all of them pending immediately so concurrent callers don't double-do work.
    await supabaseAdmin
      .from("opening_drafts")
      .upsert(
        batch.map((o) => ({
          opening_id: o.id,
          platform: "other",
          status: "pending",
        })),
        { onConflict: "opening_id" },
      );

    const sourceIds = Array.from(
      new Set(batch.map((o) => o.source_id).filter((x): x is string => !!x)),
    );
    const [sourcesRes, scrapesRes] = await Promise.all([
      sourceIds.length
        ? supabaseAdmin
            .from("prompt_sources")
            .select("id, url, domain, title, classification")
            .in("id", sourceIds)
        : Promise.resolve({ data: [] as SourceRow[] } as const),
      sourceIds.length
        ? supabaseAdmin
            .from("source_scrapes")
            .select("source_id, summary, raw_content")
            .in("source_id", sourceIds)
        : Promise.resolve({ data: [] as ScrapeRow[] } as const),
    ]);
    const sourceById = new Map<string, SourceRow>();
    for (const s of (sourcesRes.data ?? []) as SourceRow[]) sourceById.set(s.id, s);
    const scrapeBySource = new Map<string, ScrapeRow>();
    for (const s of (scrapesRes.data ?? []) as ScrapeRow[]) {
      if (s.source_id) scrapeBySource.set(s.source_id, s);
    }

    await Promise.all(
      batch.map((o) =>
        generateDraftFor(o, {
          promptText,
          ownBrand,
          ownDomain,
          sourceById,
          scrapeBySource,
        }),
      ),
    );

    return {
      promptId,
      totalOpenings: openings.length,
      alreadyHaveDraft: openings.length - todo.length,
      enqueued: batch.length,
      finishedThisCall: batch.length,
    };
  });
