import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

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
  reasons: string[];
  topSourceDomains: string[];
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

function fallbackReasons(evidence: RationaleEvidence) {
  const reasons: string[] = [];
  if (evidence.topCompetitor) {
    reasons.push(
      `${evidence.ownBrandName} is at ${evidence.ownVisibility}% visibility while ${evidence.topCompetitor} is at ${evidence.topCompetitorVisibility}%, so the gap is specific and measurable for this prompt.`,
    );
  }
  reasons.push(
    `${evidence.counts.openings} openings are mapped across ${evidence.counts.sources} cited sources and ${evidence.counts.qfos} query fanouts, giving this prompt concrete places to act rather than a generic visibility issue.`,
  );
  const bestOpening = evidence.topOpenings[0];
  if (bestOpening) {
    reasons.push(
      `Fastest win: ${bestOpening.title}${bestOpening.sourceDomain ? ` on ${bestOpening.sourceDomain}` : ""}. ${bestOpening.rationale ?? "It targets a cited source where competitors already appear and Attio can be added with focused proof."}`,
    );
  }
  const bestSource = evidence.topSources[0];
  if (bestSource) {
    reasons.push(
      `${bestSource.title ?? bestSource.domain ?? "The top cited source"} is retrieved ${bestSource.retrievalCount}× and already references ${bestSource.competitorBrands.slice(0, 3).join(", ") || "competitors"}, making it a practical insertion point for a fast visibility lift.`,
    );
  }
  return reasons.slice(0, 4);
}

async function generateReasons(evidence: RationaleEvidence) {
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
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "You are a Peec analyst. Explain why one prompt is a high-priority opening using only the supplied metrics, source evidence, scrape excerpts, and generated openings. Be specific, concise, and action-oriented.",
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
                "Return 3-4 specific reasons this prompt and its openings can create fast wins.",
              parameters: {
                type: "object",
                properties: {
                  reasons: {
                    type: "array",
                    minItems: 3,
                    maxItems: 4,
                    items: { type: "string" },
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
    const reasons = Array.isArray(parsed.reasons)
      ? parsed.reasons.filter((reason): reason is string => typeof reason === "string")
      : [];
    return reasons.map((reason) => reason.trim()).filter(Boolean).slice(0, 4);
  } catch {
    return fallbackReasons(evidence);
  }
}

export const getPromptRecommendation = createServerFn({ method: "GET" })
  .inputValidator((input: { promptId: string; ownBrandName: string }) => input)
  .handler(async ({ data }): Promise<PromptRecommendation> => {
    const promptId = data.promptId;
    const ownBrandName = data.ownBrandName;

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
      supabaseAdmin.from("prompt_qfos").select("id").eq("prompt_id", promptId),
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
      openingPreviews,
    };
  });