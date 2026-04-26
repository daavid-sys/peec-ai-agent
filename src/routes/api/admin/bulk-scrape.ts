import { createFileRoute } from "@tanstack/react-router";
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

async function tavilyExtract(urls: string[]): Promise<TavilyResponse> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) throw new Error("TAVILY_API_KEY missing");
  const r = await fetch("https://api.tavily.com/extract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: apiKey, urls, extract_depth: "basic" }),
  });
  if (!r.ok) throw new Error(`Tavily ${r.status}: ${await r.text()}`);
  return (await r.json()) as TavilyResponse;
}

/**
 * One-off bulk scraper. POST { batchSize?, maxBatches? } to scrape all
 * prompt_sources that don't yet have a successful source_scrapes row.
 */
export const Route = createFileRoute("/api/admin/bulk-scrape")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as {
          batchSize?: number;
          maxBatches?: number;
        };
        const batchSize = Math.min(20, body.batchSize ?? 20);
        const maxBatches = body.maxBatches ?? 100;

        // Find pending sources (no scrape OR not done)
        const { data: allSources, error: sErr } = await supabaseAdmin
          .from("prompt_sources")
          .select("id, url");
        if (sErr) throw sErr;
        const { data: doneScrapes } = await supabaseAdmin
          .from("source_scrapes")
          .select("source_id, status")
          .eq("status", "done");
        const doneIds = new Set((doneScrapes ?? []).map((s) => s.source_id));
        const pending = (allSources ?? []).filter((s) => !doneIds.has(s.id));

        let totalDone = 0;
        let totalFailed = 0;
        const batches = Math.min(
          maxBatches,
          Math.ceil(pending.length / batchSize),
        );

        for (let b = 0; b < batches; b++) {
          const slice = pending.slice(b * batchSize, (b + 1) * batchSize);
          if (!slice.length) break;
          const urls = slice.map((s) => s.url);
          const byUrl = new Map(slice.map((s) => [s.url, s.id]));

          let resp: TavilyResponse;
          try {
            resp = await tavilyExtract(urls);
          } catch (e) {
            const recs = slice.map((s) => ({
              source_id: s.id,
              status: "failed",
              raw_content: null,
              error: `Tavily batch error: ${e instanceof Error ? e.message : String(e)}`,
              scraped_at: new Date().toISOString(),
            }));
            await supabaseAdmin
              .from("source_scrapes")
              .upsert(recs, { onConflict: "source_id" });
            totalFailed += slice.length;
            continue;
          }

          const seen = new Set<string>();
          const recs: {
            source_id: string;
            status: string;
            raw_content: string | null;
            error: string | null;
            scraped_at: string;
          }[] = [];
          for (const r of resp.results ?? []) {
            const sid = byUrl.get(r.url);
            if (!sid) continue;
            seen.add(r.url);
            const raw = r.raw_content || r.content || "";
            if (raw) {
              recs.push({
                source_id: sid,
                status: "done",
                raw_content: raw.slice(0, 200000),
                error: null,
                scraped_at: new Date().toISOString(),
              });
              totalDone++;
            } else {
              recs.push({
                source_id: sid,
                status: "failed",
                raw_content: null,
                error: "Empty content from Tavily",
                scraped_at: new Date().toISOString(),
              });
              totalFailed++;
            }
          }
          for (const f of resp.failed_results ?? []) {
            const sid = byUrl.get(f.url);
            if (!sid || seen.has(f.url)) continue;
            seen.add(f.url);
            recs.push({
              source_id: sid,
              status: "failed",
              raw_content: null,
              error: String(f.error || "Tavily failed"),
              scraped_at: new Date().toISOString(),
            });
            totalFailed++;
          }
          for (const s of slice) {
            if (seen.has(s.url)) continue;
            recs.push({
              source_id: s.id,
              status: "failed",
              raw_content: null,
              error: "Not returned by Tavily",
              scraped_at: new Date().toISOString(),
            });
            totalFailed++;
          }
          await supabaseAdmin
            .from("source_scrapes")
            .upsert(recs, { onConflict: "source_id" });
        }

        return Response.json({
          pendingFound: pending.length,
          batchesRun: batches,
          totalDone,
          totalFailed,
        });
      },
    },
  },
});
