import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type ReasonCardPayload = {
  /** Action-oriented headline, e.g. "Get mentioned on LinkedIn" or "Beat HubSpot on G2". */
  headline: string;
  /** Markdown-formatted explanation aimed at the business owner. May contain **bold** brand/platform names. */
  body: string;
  /** Domain of the platform/source this card is about (used to render a favicon next to the headline). */
  platformDomain?: string | null;
  /** Domains of competitors mentioned in the body (used to render small favicons inline). */
  competitorDomains?: string[];
  /** Optional category hint for icon/tone selection. */
  category?: "platform" | "competitor" | "content" | "speed" | "win" | "gap";
};

export type PromptRecommendation = {
  prompt: {
    id: string;
    text: string;
    topic: string | null;
    volume: string | null;
    ownVisibility: number;
    topCompetitor: string | null;
    topCompetitorVisibility: number;
    visibilityGap: number;
    opportunityScore: number;
  } | null;
  counts: {
    sources: number;
    qfos: number;
    openings: number;
  };
  reasons: ReasonCardPayload[];
  topSourceDomains: string[];
  qfoModels: string[];
  openingPreviews: {
    id: string;
    sourceName: string;
    sourceUrl: string;
    openingType: string;
    impactScore: number;
  }[];
};

type MetricRow = {
  brand_name: string;
  is_own: boolean;
  visibility: number | string | null;
  share_of_voice: number | string | null;
};

type RationaleEvidence = {
  promptText: string;
  ownBrandName: string;
  ownBrandDomain: string | null;
  competitors: { name: string; domain: string | null }[];
  ownVisibility: number;
  topCompetitor: string | null;
  topCompetitorVisibility: number;
  visibilityGap: number;
  opportunityScore: number;
  counts: PromptRecommendation["counts"];
  topBrands: { brand: string; visibility: number; shareOfVoice: number }[];
  topSources: {
    domain: string | null;
    title: string | null;
    classification: string | null;
    retrievalCount: number;
    citationCount: number;
    ownBrandPresent: boolean;
    competitorBrands: string[];
  }[];
  topOpenings: {
    title: string;
    actionType: string;
    rationale: string | null;
    recommendedEngagement: string | null;
    impactScore: number;
    sourceDomain: string | null;
    sourceTitle: string | null;
    scrapeExcerpt: string | null;
  }[];
};

const percent = (value: number | string | null | undefined) =>
  Math.round(Number(value ?? 0) * 100);

const humanizeActionType = (value: string) =>
  value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const cleanExcerpt = (value: string | null | undefined) => {
  const cleaned = value?.replace(/\s+/g, " ").trim();
  return cleaned ? cleaned.slice(0, 700) : null;
};

function fallbackReasons(evidence: RationaleEvidence): ReasonCardPayload[] {
  const cards: ReasonCardPayload[] = [];
  const brand = evidence.ownBrandName;
  const competitorDomains = evidence.competitors
    .map((c) => c.domain)
    .filter((d): d is string => !!d)
    .slice(0, 3);

  // 1. Top source / platform play
  const bestSource = evidence.topSources[0];
  if (bestSource?.domain) {
    const compsHere = bestSource.competitorBrands.slice(0, 3);
    const compsBold = compsHere.map((c) => `**${c}**`).join(", ");
    cards.push({
      headline: `Get ${brand} mentioned on ${bestSource.domain}`,
      body: compsHere.length
        ? `**${bestSource.domain}** is cited ${bestSource.retrievalCount}× for this prompt and already lists ${compsBold}. Adding ${brand} here puts you in the same answer set as your closest competitors — not as an afterthought.`
        : `**${bestSource.domain}** is cited ${bestSource.retrievalCount}× for this prompt but doesn't yet mention ${brand}. Getting added here is the single fastest way to start showing up in answers.`,
      platformDomain: bestSource.domain,
      competitorDomains: evidence.competitors
        .filter((c) => compsHere.some((b) => b.toLowerCase() === c.name.toLowerCase()))
        .map((c) => c.domain)
        .filter((d): d is string => !!d),
      category: "platform",
    });
  }

  // 2. Visibility gap vs top competitor
  if (evidence.topCompetitor) {
    const compDomain =
      evidence.competitors.find(
        (c) => c.name.toLowerCase() === evidence.topCompetitor!.toLowerCase(),
      )?.domain ?? null;
    cards.push({
      headline: `Close the gap with ${evidence.topCompetitor}`,
      body: `**${brand}** shows up ${evidence.ownVisibility}% of the time on this prompt — **${evidence.topCompetitor}** shows up ${evidence.topCompetitorVisibility}%. Every answer they appear in and you don't is a deal you're not even being considered for.`,
      competitorDomains: compDomain ? [compDomain] : [],
      category: "competitor",
    });
  }

  // 3. Concrete openings exist
  const bestOpening = evidence.topOpenings[0];
  if (bestOpening) {
    cards.push({
      headline: bestOpening.sourceDomain
        ? `Drafted opening on ${bestOpening.sourceDomain}`
        : `Ready-to-send opening drafted`,
      body: `${bestOpening.rationale ?? `A specific insertion point is already drafted${bestOpening.sourceDomain ? ` on **${bestOpening.sourceDomain}**` : ""} — no research needed, just review and ship.`}`,
      platformDomain: bestOpening.sourceDomain,
      category: "speed",
    });
  }

  // 4. Coverage breadth
  cards.push({
    headline: `${evidence.counts.openings} openings across ${evidence.counts.sources} sources`,
    body: `This isn't one lucky placement — there are **${evidence.counts.openings} concrete openings** across **${evidence.counts.sources} cited sources** and **${evidence.counts.qfos} query fanouts**. Working this prompt compounds across the whole answer surface.`,
    competitorDomains: competitorDomains.slice(0, 2),
    category: "win",
  });

  // Pad to exactly 4 cards using whatever evidence is left so the UI is never short.
  const usedDomains = new Set(cards.map((c) => c.platformDomain).filter(Boolean));
  const extraSources = evidence.topSources.filter(
    (s) => s.domain && !usedDomains.has(s.domain),
  );
  const extraCompetitors = evidence.competitors.filter(
    (c) => c.name.toLowerCase() !== (evidence.topCompetitor ?? "").toLowerCase(),
  );

  while (cards.length < 4) {
    const nextSource = extraSources.shift();
    if (nextSource?.domain) {
      cards.push({
        headline: `Show up on ${nextSource.domain}`,
        body: `**${nextSource.domain}** is another cited source for this prompt where **${brand}** isn't represented yet. Each additional source you appear on widens the set of answers that mention you.`,
        platformDomain: nextSource.domain,
        category: "platform",
      });
      continue;
    }
    const nextCompetitor = extraCompetitors.shift();
    if (nextCompetitor) {
      cards.push({
        headline: `Stay ahead of ${nextCompetitor.name}`,
        body: `**${nextCompetitor.name}** is competing for the same answer surface as **${brand}** on this prompt. Owning the cited sources here keeps them from compounding awareness at your expense.`,
        competitorDomains: nextCompetitor.domain ? [nextCompetitor.domain] : [],
        category: "competitor",
      });
      continue;
    }
    cards.push({
      headline: `Compounding awareness for ${brand}`,
      body: `Every answer that includes **${brand}** on this prompt builds long-term awareness with buyers actively researching this exact need. Skipping it leaves that ground to whoever shows up instead.`,
      category: "win",
    });
  }

  return cards.slice(0, 4);
}

async function generateReasons(evidence: RationaleEvidence): Promise<ReasonCardPayload[]> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) return fallbackReasons(evidence);

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: [
              `You write hyper-personalized "Why this prompt" cards for ${evidence.ownBrandName}, the business owner.`,
              `Each card explains, in business-owner language, why ${evidence.ownBrandName} should care about this specific prompt.`,
              `RULES:`,
              `- You MUST return EXACTLY 4 cards. Never fewer. If evidence is thin, lean on competitors, brand awareness, or compounding visibility — but always produce 4 distinct, non-repeating cards.`,
              `- Headlines must be ACTION-ORIENTED and reference a specific platform, source, or competitor by name. Examples: "Get mentioned on LinkedIn", "Beat HubSpot on G2", "Own the 'best CRM' listicle on Forbes". NEVER use vague phrases like "Maximum opportunity score", "High visibility gap", or any internal Peec metric name.`,
              `- Bodies are 1-2 sentences of plain markdown explaining what's at stake for the BUSINESS (deals, awareness, trust) — not for Peec. Use **bold** around every brand name (own brand, competitors) and platform/source domain you mention.`,
              `- Use the supplied evidence only. Never invent platforms, competitors, or numbers.`,
              `- Set platformDomain to the source/platform the card is about (bare domain like "linkedin.com" or "g2.com"). Set competitorDomains to the bare domains of any competitors mentioned in the body — match them from the supplied competitor list.`,
              `- Pick category: "platform" (a specific source/platform play), "competitor" (closing a gap vs a named competitor), "content" (a content piece to publish), "speed" (a fast/easy win), "win" (compounding opportunity), or "gap" (visibility gap).`,
            ].join("\n"),
          },
          {
            role: "user",
            content: JSON.stringify(evidence),
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "explain_prompt_opportunity",
              description:
                "Return EXACTLY 4 hyper-personalized, action-oriented cards explaining why this prompt matters to the business owner.",
              parameters: {
                type: "object",
                properties: {
                  reasons: {
                    type: "array",
                    minItems: 4,
                    maxItems: 4,
                    items: {
                      type: "object",
                      properties: {
                        headline: { type: "string" },
                        body: { type: "string" },
                        platformDomain: { type: "string" },
                        competitorDomains: {
                          type: "array",
                          items: { type: "string" },
                        },
                        category: {
                          type: "string",
                          enum: ["platform", "competitor", "content", "speed", "win", "gap"],
                        },
                      },
                      required: ["headline", "body"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["reasons"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: {
          type: "function",
          function: { name: "explain_prompt_opportunity" },
        },
      }),
    });

    if (!response.ok) return fallbackReasons(evidence);

    const result = (await response.json()) as {
      choices?: {
        message?: {
          content?: string;
          tool_calls?: { function?: { arguments?: string } }[];
        };
      }[];
    };
    const message = result.choices?.[0]?.message;
    const args = message?.tool_calls?.[0]?.function?.arguments ?? message?.content;
    if (!args) return fallbackReasons(evidence);

    const parsed = JSON.parse(args) as { reasons?: unknown };
    if (!Array.isArray(parsed.reasons)) return fallbackReasons(evidence);

    const cards = parsed.reasons
      .map((r): ReasonCardPayload | null => {
        if (!r || typeof r !== "object") return null;
        const raw = r as Record<string, unknown>;
        const headline = typeof raw.headline === "string" ? raw.headline.trim() : "";
        const body = typeof raw.body === "string" ? raw.body.trim() : "";
        if (!headline || !body) return null;
        const competitorDomains = Array.isArray(raw.competitorDomains)
          ? raw.competitorDomains.filter((d): d is string => typeof d === "string")
          : [];
        return {
          headline,
          body,
          platformDomain:
            typeof raw.platformDomain === "string" ? raw.platformDomain : null,
          competitorDomains,
          category:
            typeof raw.category === "string"
              ? (raw.category as ReasonCardPayload["category"])
              : undefined,
        };
      })
      .filter((c): c is ReasonCardPayload => c !== null)
      .slice(0, 4);

    if (!cards.length) return fallbackReasons(evidence);

    // Always pad to exactly 4 cards using fallback content the LLM didn't already cover.
    if (cards.length < 4) {
      const usedHeadlines = new Set(cards.map((c) => c.headline.toLowerCase()));
      for (const fb of fallbackReasons(evidence)) {
        if (cards.length >= 4) break;
        if (!usedHeadlines.has(fb.headline.toLowerCase())) {
          cards.push(fb);
          usedHeadlines.add(fb.headline.toLowerCase());
        }
      }
    }

    return cards.slice(0, 4);
  } catch {
    return fallbackReasons(evidence);
  }
}

export const getPromptRecommendation = createServerFn({ method: "GET" })
  .inputValidator(
    (input: {
      promptId: string;
      ownBrandName: string;
      ownBrandDomain?: string | null;
      competitors?: { name: string; domain?: string | null }[];
    }) => input,
  )
  .handler(async ({ data }): Promise<PromptRecommendation> => {
    const promptId = data.promptId;
    const ownBrandName = data.ownBrandName;
    const ownBrandDomain = data.ownBrandDomain ?? null;
    const competitors = (data.competitors ?? []).map((c) => ({
      name: c.name,
      domain: c.domain ?? null,
    }));

    const [promptRes, metricsRes, sourcesRes, qfosRes, openingsRes] = await Promise.all([
      supabaseAdmin.from("prompts").select("*").eq("id", promptId).maybeSingle(),
      supabaseAdmin
        .from("prompt_brand_metrics")
        .select("brand_name, is_own, visibility, share_of_voice")
        .eq("prompt_id", promptId),
      supabaseAdmin
        .from("prompt_sources")
        .select("id, url, domain, title, classification, citation_count, retrieval_count, own_brand_present, competitor_brands")
        .eq("prompt_id", promptId)
        .order("retrieval_count", { ascending: false }),
      supabaseAdmin.from("prompt_qfos").select("id, model_id").eq("prompt_id", promptId),
      supabaseAdmin
        .from("action_openings")
        .select("id, source_id, action_type, title, rationale, recommended_engagement, impact_score")
        .eq("prompt_id", promptId)
        .order("impact_score", { ascending: false }),
    ]);

    if (promptRes.error) throw new Error(promptRes.error.message);
    if (metricsRes.error) throw new Error(metricsRes.error.message);
    if (sourcesRes.error) throw new Error(sourcesRes.error.message);
    if (qfosRes.error) throw new Error(qfosRes.error.message);
    if (openingsRes.error) throw new Error(openingsRes.error.message);

    const prompt = promptRes.data;
    const metrics = ((metricsRes.data ?? []) as MetricRow[]).map((metric) => ({
      brandName: metric.brand_name,
      isOwn: metric.is_own || metric.brand_name.toLowerCase() === ownBrandName.toLowerCase(),
      visibility: percent(metric.visibility),
      shareOfVoice: percent(metric.share_of_voice),
    }));
    const ownMetric = metrics.find((metric) => metric.isOwn);
    const topCompetitorMetric = metrics
      .filter((metric) => !metric.isOwn)
      .sort((a, b) => b.visibility - a.visibility)[0];

    const sourceRows = sourcesRes.data ?? [];
    const sourceById = new Map(sourceRows.map((source) => [source.id, source]));
    const sourceIds = sourceRows.map((source) => source.id);
    let scrapeRows: { source_id: string; raw_content: string | null; summary: string | null }[] = [];
    if (sourceIds.length > 0) {
      const { data: scrapes, error } = await supabaseAdmin
        .from("source_scrapes")
        .select("source_id, raw_content, summary")
        .in("source_id", sourceIds);
      if (error) throw new Error(error.message);
      scrapeRows = scrapes ?? [];
    }
    const scrapeBySource = new Map(scrapeRows.map((scrape) => [scrape.source_id, scrape]));

    const openingRows = openingsRes.data ?? [];
    const counts = {
      sources: sourceRows.length,
      qfos: qfosRes.data?.length ?? 0,
      openings: openingRows.length,
    };
    const ownVisibility = ownMetric?.visibility ?? Number(prompt?.own_visibility ?? 0);
    const topCompetitor = topCompetitorMetric?.brandName ?? prompt?.top_competitor ?? null;
    const topCompetitorVisibility =
      topCompetitorMetric?.visibility ?? Number(prompt?.top_competitor_visibility ?? 0);
    const visibilityGap = ownVisibility - topCompetitorVisibility;
    const opportunityScore = Math.round(Number(prompt?.opportunity_score ?? 0));

    // Dedupe previews by source domain so we don't show the same site 3×
    // (and skip placeholder "default.com" sources). Openings are already sorted
    // by impact_score DESC, so the first hit per domain is the best one.
    const seenDomains = new Set<string>();
    const openingPreviews: PromptRecommendation["openingPreviews"] = [];
    for (const opening of openingRows) {
      const source = opening.source_id ? sourceById.get(opening.source_id) : null;
      const domainKey = (source?.domain ?? "").toLowerCase().trim();
      if (!domainKey || domainKey === "default.com") continue;
      if (seenDomains.has(domainKey)) continue;
      seenDomains.add(domainKey);
      openingPreviews.push({
        id: opening.id,
        sourceName: source?.title ?? source?.domain ?? opening.title,
        sourceUrl: source?.url ?? "",
        openingType: humanizeActionType(opening.action_type),
        impactScore: opening.impact_score ?? 50,
      });
      if (openingPreviews.length >= 3) break;
    }

    const evidence: RationaleEvidence = {
      promptText: prompt?.text ?? promptId,
      ownBrandName,
      ownBrandDomain,
      competitors,
      ownVisibility,
      topCompetitor,
      topCompetitorVisibility,
      visibilityGap,
      opportunityScore,
      counts,
      topBrands: metrics
        .slice()
        .sort((a, b) => b.visibility - a.visibility)
        .slice(0, 5)
        .map((metric) => ({
          brand: metric.brandName,
          visibility: metric.visibility,
          shareOfVoice: metric.shareOfVoice,
        })),
      topSources: sourceRows.slice(0, 6).map((source) => ({
        domain: source.domain,
        title: source.title,
        classification: source.classification,
        retrievalCount: source.retrieval_count ?? 0,
        citationCount: source.citation_count ?? 0,
        ownBrandPresent: !!source.own_brand_present,
        competitorBrands: source.competitor_brands ?? [],
      })),
      topOpenings: openingRows.slice(0, 6).map((opening) => {
        const source = opening.source_id ? sourceById.get(opening.source_id) : null;
        const scrape = opening.source_id ? scrapeBySource.get(opening.source_id) : null;
        return {
          title: opening.title,
          actionType: opening.action_type,
          rationale: opening.rationale,
          recommendedEngagement: opening.recommended_engagement,
          impactScore: opening.impact_score ?? 50,
          sourceDomain: source?.domain ?? null,
          sourceTitle: source?.title ?? null,
          scrapeExcerpt: cleanExcerpt(scrape?.summary ?? scrape?.raw_content),
        };
      }),
    };

    return {
      prompt: prompt
        ? {
            id: prompt.id,
            text: prompt.text,
            topic: prompt.topic,
            volume: prompt.volume,
            ownVisibility,
            topCompetitor,
            topCompetitorVisibility,
            visibilityGap,
            opportunityScore,
          }
        : null,
      counts,
      reasons: await generateReasons(evidence),
      topSourceDomains: Array.from(
        new Set(
          sourceRows
            .map((s) => s.domain)
            .filter(
              (d): d is string =>
                typeof d === "string" && d.length > 0 && d !== "default.com",
            ),
        ),
      ).slice(0, 4),
      qfoModels: Array.from(
        new Set(
          (qfosRes.data ?? [])
            .map((q: { model_id: string | null }) => q.model_id)
            .filter((m): m is string => typeof m === "string" && m.length > 0),
        ),
      ),
      openingPreviews,
    };
  });