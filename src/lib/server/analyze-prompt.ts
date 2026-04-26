import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

interface TavilyExtractResult {
  url: string;
  raw_content?: string;
  content?: string;
}

interface TavilyResponse {
  results?: TavilyExtractResult[];
  failed_results?: { url: string; error: string }[];
}

interface AIOpening {
  competitor: string;
  quote: string;
  context: string;
  action_type: string;
  title: string;
  rationale: string;
  recommended_engagement: string;
  impact_score: number;
  risk_level: "low" | "medium" | "high";
}

const SYSTEM_PROMPT = `You analyze a web page that an AI search engine cited when answering a user's question about CRM software.
The user's brand (the "own brand") is currently NOT mentioned on the page, but one or more competitor brands ARE mentioned.

Your job: find the EXACT passages where each competitor is recommended/mentioned, then propose a concrete, fast action that would get the own brand inserted into the same conversation.

Return strictly valid JSON matching this TypeScript type:
{
  "mentions": [
    {
      "competitor": string,           // e.g. "HubSpot"
      "quote": string,                // 1-3 sentence verbatim excerpt that mentions the competitor
      "context": string,              // 1 sentence describing where in the page (e.g. "in the round-up of top tools", "in a top reply by user X")
      "action_type": "reddit_comment" | "blog_pitch" | "youtube_pitch" | "linkedin_comment" | "review_campaign" | "faq_schema" | "alternative_page" | "outreach_email" | "owned_listicle",
      "title": string,                // short imperative title for the action, e.g. "Reply on r/CRM thread with Attio benchmark"
      "rationale": string,            // 1-2 sentences why this action will work
      "recommended_engagement": string, // 2-4 sentences of concrete content to post/pitch, in the brand's voice
      "impact_score": number,         // 0-100
      "risk_level": "low" | "medium" | "high"
    }
  ]
}
Return at most 3 mentions per page, prioritised by how strong the competitor recommendation is. Never invent quotes — if you cannot find the competitor mentioned, return an empty mentions array.`;

async function tavilyExtract(urls: string[]): Promise<TavilyResponse> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) throw new Error("TAVILY_API_KEY is not configured");

  const res = await fetch("https://api.tavily.com/extract", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ urls, extract_depth: "basic" }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Tavily ${res.status}: ${text}`);
  }
  return (await res.json()) as TavilyResponse;
}

async function aiAnalyze(args: {
  ownBrand: string;
  competitors: string[];
  promptText: string;
  pageUrl: string;
  pageTitle: string;
  pageContent: string;
}): Promise<AIOpening[]> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

  const truncated = args.pageContent.slice(0, 18000);

  const userPrompt = `Own brand: ${args.ownBrand}
Competitors present: ${args.competitors.join(", ")}
User's question to the AI engine: "${args.promptText}"
Page: ${args.pageUrl}
Page title: ${args.pageTitle}

PAGE CONTENT:
"""
${truncated}
"""`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Lovable AI ${res.status}: ${text}`);
  }
  const data = (await res.json()) as {
    choices: { message: { content: string } }[];
  };
  const content = data.choices?.[0]?.message?.content ?? "{}";
  try {
    const parsed = JSON.parse(content) as { mentions?: AIOpening[] };
    return parsed.mentions ?? [];
  } catch {
    return [];
  }
}

export const analyzePrompt = createServerFn({ method: "POST" })
  .inputValidator(
    (input: { promptId: string; maxSources?: number; ownBrand?: string }) =>
      input,
  )
  .handler(async ({ data }) => {
    const promptId = data.promptId;
    const maxSources = data.maxSources ?? 8;
    const ownBrand = data.ownBrand ?? "Attio";

    const { data: prompt, error: promptErr } = await supabaseAdmin
      .from("prompts")
      .select("*")
      .eq("id", promptId)
      .maybeSingle();
    if (promptErr) throw promptErr;
    if (!prompt) throw new Error(`Prompt ${promptId} not found`);

    const { data: sources, error: srcErr } = await supabaseAdmin
      .from("prompt_sources")
      .select("*")
      .eq("prompt_id", promptId)
      .eq("own_brand_present", false)
      .gt("gap_score", 0)
      .order("retrieval_count", { ascending: false })
      .limit(maxSources);
    if (srcErr) throw srcErr;
    if (!sources || sources.length === 0) {
      return { processed: 0, openings: 0 };
    }

    let totalOpenings = 0;

    for (const src of sources) {
      // Skip if already scraped successfully
      const { data: existing } = await supabaseAdmin
        .from("source_scrapes")
        .select("id, status")
        .eq("source_id", src.id)
        .maybeSingle();
      if (existing && existing.status === "done") continue;

      let raw = "";
      let scrapeStatus: "done" | "failed" = "failed";
      let scrapeError: string | null = null;
      try {
        const tavily = await tavilyExtract([src.url]);
        const result = tavily.results?.[0];
        raw = result?.raw_content || result?.content || "";
        scrapeStatus = raw ? "done" : "failed";
        if (!raw) scrapeError = "Empty content from Tavily";
      } catch (e) {
        scrapeError = e instanceof Error ? e.message : String(e);
      }

      await supabaseAdmin.from("source_scrapes").upsert(
        {
          source_id: src.id,
          status: scrapeStatus,
          raw_content: raw.slice(0, 200000),
          error: scrapeError,
          scraped_at: new Date().toISOString(),
        },
        { onConflict: "source_id" },
      );

      if (scrapeStatus !== "done") continue;

      let mentions: AIOpening[] = [];
      try {
        mentions = await aiAnalyze({
          ownBrand,
          competitors: src.competitor_brands ?? [],
          promptText: prompt.text,
          pageUrl: src.url,
          pageTitle: src.title ?? src.url,
          pageContent: raw,
        });
      } catch (e) {
        console.error("AI analyze failed for", src.url, e);
        continue;
      }

      for (const m of mentions) {
        const { data: ins, error: mErr } = await supabaseAdmin
          .from("competitor_mentions")
          .insert({
            source_id: src.id,
            prompt_id: promptId,
            competitor: m.competitor,
            quote: m.quote.slice(0, 2000),
            context: m.context?.slice(0, 500) ?? null,
          })
          .select("id")
          .single();
        if (mErr) {
          console.error("mention insert", mErr);
          continue;
        }
        await supabaseAdmin.from("action_openings").insert({
          prompt_id: promptId,
          source_id: src.id,
          competitor: m.competitor,
          action_type: m.action_type,
          title: m.title.slice(0, 200),
          rationale: m.rationale?.slice(0, 1000) ?? null,
          recommended_engagement: m.recommended_engagement?.slice(0, 2000) ?? null,
          impact_score: Math.max(0, Math.min(100, Math.round(m.impact_score ?? 50))),
          risk_level: m.risk_level ?? "low",
          status: "ready",
        });
        totalOpenings += 1;
        void ins;
      }
    }

    return { processed: sources.length, openings: totalOpenings };
  });
