import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Loader2, RefreshCw, Sparkles, Target, MessageSquare, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Favicon } from "@/components/favicon";
import { useAppStore } from "@/lib/store";
import { getActionPlan, type ActionPlan } from "@/lib/server/get-action-plan";
import { QfosTable } from "@/components/qfos-table";
import type { PromptQfo } from "@/lib/server/get-prompt-qfos";

export const Route = createFileRoute("/openings")({
  head: () => ({ meta: [{ title: "Action Plan — Peec AI Openings" }] }),
  loader: async () => {
    // We can't read selected prompt at SSR time, return empty; fetch on client.
    return { initial: null as ActionPlan | null };
  },
  component: OpeningsPage,
});

function OpeningsPage() {
  const selectedPromptId = useAppStore((s) => s.selectedPromptId);
  const prompts = useAppStore((s) => s.prompts);
  const fallbackPromptId = "pr_05a66669-478c-4b25-94bc-9119409e5e2f";
  const promptId = selectedPromptId ?? fallbackPromptId;
  const localPrompt = prompts.find((p) => p.id === promptId);

  const [plan, setPlan] = useState<ActionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await getActionPlan({ data: { promptId } });
      setPlan(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function runAnalyze() {
    setAnalyzing(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptId, maxSources: 6 }),
      });
      if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setAnalyzing(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promptId]);

  const promptText = plan?.prompt?.text ?? localPrompt?.text ?? "Selected prompt";

  return (
    <div className="mx-auto w-full max-w-[1600px] px-6 py-10 2xl:px-10">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <h1 className="text-3xl font-semibold tracking-tight">
            <span className="text-primary">&ldquo;{promptText}&rdquo;</span>
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Every source the AI engines retrieved for this prompt — pulled from real Peec data.
            Sources where competitors are mentioned but your brand isn&rsquo;t are scraped via Tavily,
            then analysed to find the exact passage and a fast way to insert your brand.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => void runAnalyze()} disabled={analyzing}>
            {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {analyzing ? "Scraping & analysing…" : "Run analysis"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <SummaryStrip plan={plan} loading={loading} />

      <Tabs defaultValue="sources" className="mt-8">
        <TabsList>
          <TabsTrigger value="sources">
            <Search className="h-3.5 w-3.5" /> Sources ({plan?.sources.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="competitors">
            <Target className="h-3.5 w-3.5" /> Competitors
          </TabsTrigger>
          <TabsTrigger value="qfos">
            <MessageSquare className="h-3.5 w-3.5" /> Query fanouts ({plan?.qfos.length ?? 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sources" className="mt-4">
          <SourcesTab plan={plan} loading={loading} />
        </TabsContent>
        <TabsContent value="competitors" className="mt-4">
          <CompetitorsTab plan={plan} />
        </TabsContent>
        <TabsContent value="qfos" className="mt-4">
          <QfosTab plan={plan} />
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <Button variant="ghost" asChild>
          <Link to="/prompts">← Back to prompts</Link>
        </Button>
      </div>
    </div>
  );
}

function SummaryStrip({ plan, loading }: { plan: ActionPlan | null; loading: boolean }) {
  const s = plan?.summary;
  const items = [
    { label: "Sources AI reads", value: s?.total_sources ?? 0 },
    { label: "Gap sources", value: s?.gap_sources ?? 0 },
    { label: "Pages scraped", value: s?.scraped ?? 0 },
    { label: "Competitor mentions", value: s?.competitor_mentions ?? 0 },
    { label: "Openings generated", value: s?.openings ?? 0, accent: true },
  ];
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
      {items.map((it) => (
        <Card
          key={it.label}
          className={
            "border-border bg-card p-4" + (it.accent ? " border-primary/30 bg-primary-soft" : "")
          }
        >
          <div className="text-xs text-muted-foreground">{it.label}</div>
          <div className="mt-1 text-2xl font-semibold tabular-nums">
            {loading ? "…" : it.value}
          </div>
        </Card>
      ))}
    </div>
  );
}

function SourcesTab({ plan, loading }: { plan: ActionPlan | null; loading: boolean }) {
  if (loading && !plan) {
    return <div className="py-12 text-center text-sm text-muted-foreground">Loading sources…</div>;
  }
  if (!plan?.sources.length) {
    return <div className="py-12 text-center text-sm text-muted-foreground">No sources yet.</div>;
  }
  return (
    <div className="space-y-3">
      {plan.sources.map((src) => (
        <Card key={src.id} className="border-border bg-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="font-normal">
                  {src.classification ?? "OTHER"}
                </Badge>
                <span className="font-mono">{src.domain}</span>
                <span>·</span>
                <span>retrieved {src.retrieval_count}×</span>
                <span>·</span>
                <span>{src.citation_count} citations</span>
                {src.scrape_status === "done" && (
                  <Badge variant="secondary" className="font-normal">scraped</Badge>
                )}
                {src.scrape_status === "failed" && (
                  <Badge variant="destructive" className="font-normal">scrape failed</Badge>
                )}
              </div>
              <a
                href={src.url}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-sm font-semibold hover:text-primary"
              >
                {src.title ?? src.url}
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                {src.own_brand_present ? (
                  <Badge variant="secondary">Your brand mentioned</Badge>
                ) : (
                  <Badge variant="destructive">Gap: your brand absent</Badge>
                )}
                {src.competitor_brands.map((b) => (
                  <span key={b} className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-muted-foreground">
                    <Favicon name={b} kind="brand" size={12} />
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {src.mentions.length > 0 && (
            <>
              <Separator className="my-4" />
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Competitor mentions found
              </div>
              <div className="mt-2 space-y-2">
                {src.mentions.map((m) => (
                  <div key={m.id} className="rounded-md border border-border bg-secondary/30 p-3">
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <Favicon name={m.competitor} kind="brand" size={14} /> {m.competitor}
                      {m.context && (
                        <span className="font-normal text-muted-foreground">— {m.context}</span>
                      )}
                    </div>
                    <p className="mt-1 text-sm italic text-foreground">&ldquo;{m.quote}&rdquo;</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {src.openings.length > 0 && (
            <>
              <Separator className="my-4" />
              <div className="text-[11px] uppercase tracking-wider text-primary">
                Recommended actions
              </div>
              <div className="mt-2 space-y-2">
                {src.openings.map((o) => (
                  <OpeningRow key={o.id} opening={o} />
                ))}
              </div>
            </>
          )}
        </Card>
      ))}
    </div>
  );
}

type OpeningItem = ActionPlan["openings"][number];

function CompetitorsTab({ plan }: { plan: ActionPlan | null }) {
  const grouped = useMemo(() => {
    if (!plan) return [] as { competitor: string; sources: number; mentions: number; openings: OpeningItem[] }[];
    const map = new Map<string, { sources: Set<string>; mentions: number; openings: OpeningItem[] }>();
    for (const src of plan.sources) {
      for (const c of src.competitor_brands) {
        if (!map.has(c)) map.set(c, { sources: new Set(), mentions: 0, openings: [] });
        map.get(c)!.sources.add(src.id);
        map.get(c)!.mentions += src.mentions.filter((m) => m.competitor === c).length;
      }
    }
    for (const o of plan.openings) {
      if (!o.competitor) continue;
      if (!map.has(o.competitor)) map.set(o.competitor, { sources: new Set(), mentions: 0, openings: [] });
      map.get(o.competitor)!.openings.push(o);
    }
    return Array.from(map.entries())
      .map(([competitor, v]) => ({
        competitor,
        sources: v.sources.size,
        mentions: v.mentions,
        openings: v.openings,
      }))
      .sort((a, b) => b.sources - a.sources);
  }, [plan]);

  if (!grouped.length) {
    return <div className="py-12 text-center text-sm text-muted-foreground">No competitor data yet.</div>;
  }

  return (
    <div className="space-y-3">
      {grouped.map((g) => (
        <Card key={g.competitor} className="border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Favicon name={g.competitor} kind="brand" size={18} />
              <h3 className="text-base font-semibold">{g.competitor}</h3>
            </div>
            <div className="text-xs text-muted-foreground">
              {g.sources} sources · {g.mentions} verified mentions · {g.openings.length} openings
            </div>
          </div>
          {g.openings.length > 0 && (
            <div className="mt-3 space-y-2">
              {g.openings.slice(0, 5).map((o) => (
                <OpeningRow key={o.id} opening={o} />
              ))}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

function QfosTab({ plan }: { plan: ActionPlan | null }) {
  const qfos: PromptQfo[] | null = plan
    ? plan.qfos.map((q) => ({
        id: q.id,
        query_text: q.query_text,
        model_id: q.model_id,
        occurrence_count: q.occurrence_count,
      }))
    : null;
  return (
    <div>
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Query fanouts</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sub-queries AI engines fan out to while answering this prompt
        </p>
      </div>
      <div className="mt-4">
        <QfosTable qfos={qfos} loading={!plan} />
      </div>
    </div>
  );
}

function OpeningRow({ opening }: { opening: ActionPlan["openings"][number] }) {
  return (
    <div className="rounded-md border border-primary/20 bg-primary-soft p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-semibold">{opening.title}</div>
        <div className="flex items-center gap-2 text-[11px]">
          <Badge variant="outline" className="font-normal">{opening.action_type}</Badge>
          <span className="text-muted-foreground">impact {opening.impact_score}</span>
          <span
            className="rounded-full px-2 py-0.5 capitalize"
            style={{
              color:
                opening.risk_level === "high"
                  ? "var(--destructive)"
                  : opening.risk_level === "medium"
                    ? "var(--warning)"
                    : "var(--success)",
            }}
          >
            {opening.risk_level} risk
          </span>
        </div>
      </div>
      {opening.rationale && (
        <p className="mt-1.5 text-xs text-muted-foreground">{opening.rationale}</p>
      )}
      {opening.recommended_engagement && (
        <p className="mt-2 text-sm text-foreground">{opening.recommended_engagement}</p>
      )}
    </div>
  );
}
