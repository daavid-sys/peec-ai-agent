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
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
        Action Plan
      </div>
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
            <MessageSquare className="h-3.5 w-3.5" /> Query Fanouts ({plan?.qfos.length ?? 0})
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
  if (!plan?.qfos.length) {
    return <div className="py-12 text-center text-sm text-muted-foreground">No query fanouts yet.</div>;
  }
  return (
    <div>
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Fanout Queries</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Additional queries AI engines run to gather context for this prompt
        </p>
      </div>

      <Card className="mt-4 overflow-hidden border-border bg-card p-0">
        <div className="border-b border-border bg-muted/40 px-5 py-3 text-sm text-muted-foreground">
          Latest Fanout Queries
        </div>
        <ul className="divide-y divide-border">
          {plan.qfos.map((q) => (
            <li
              key={q.id}
              className="flex items-start gap-4 px-5 py-4"
            >
              <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center text-muted-foreground">
                <ModelLogo modelId={q.model_id} />
              </div>
              <div className="text-sm leading-relaxed text-foreground">
                {q.query_text}
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function ModelLogo({ modelId }: { modelId: string | null }) {
  const id = (modelId ?? "").toLowerCase();
  if (id.includes("gpt") || id.includes("chatgpt") || id.includes("openai")) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-label="ChatGPT">
        <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365 2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
      </svg>
    );
  }
  if (id.includes("gemini") || id.includes("google")) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-label="Gemini">
        <path d="M12 0c1.236 6.346 5.654 10.764 12 12-6.346 1.236-10.764 5.654-12 12-1.236-6.346-5.654-10.764-12-12C6.346 10.764 10.764 6.346 12 0z" />
      </svg>
    );
  }
  if (id.includes("claude") || id.includes("anthropic")) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-label="Claude">
        <path d="M4.7 16.5 9 7.5h2.6l4.3 9h-2.4l-.9-2H8l-.9 2H4.7zm4-3.7h3.6L10.5 9zM17 16.5v-9h2.3v9H17z" />
      </svg>
    );
  }
  if (id.includes("perplex") || id.includes("sonar")) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-label="Perplexity">
        <path d="M12 2 2 7v10l10 5 10-5V7L12 2zm0 2.2 7.5 3.7-7.5 3.8-7.5-3.8L12 4.2zM4 9.4l7 3.5v7.7l-7-3.5V9.4zm9 11.2v-7.7l7-3.5v7.7l-7 3.5z" />
      </svg>
    );
  }
  // Fallback: dot
  return <div className="h-2 w-2 rounded-full bg-muted-foreground/60" />;
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
