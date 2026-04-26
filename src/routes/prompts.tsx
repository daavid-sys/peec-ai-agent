import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  Sparkles,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScoreBar } from "@/components/score-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { Favicon } from "@/components/favicon";
import { store, useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  getPromptBrandMetrics,
  type PromptBrandMetric,
} from "@/lib/server/get-prompt-brand-metrics";
import {
  getPromptQfos,
  type PromptQfo,
} from "@/lib/server/get-prompt-qfos";
import { QfosTable } from "@/components/qfos-table";
import { PromptsTable } from "@/components/prompts-table";
import {
  getPromptTable,
  type PromptTableRow,
} from "@/lib/server/get-prompt-table";
import {
  getPromptRecommendation,
  type PromptRecommendation,
} from "@/lib/server/get-prompt-recommendation";

export const Route = createFileRoute("/prompts")({
  head: () => ({ meta: [{ title: "Recommended Prompt — Peec AI Openings" }] }),
  component: PromptsPage,
});

function PromptsPage() {
  const prompts = useAppStore((s) => s.prompts);
  const project = useAppStore((s) => s.project);
  const selectedId = useAppStore((s) => s.selectedPromptId);
  const navigate = useNavigate();
  

  if (!project || prompts.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="text-sm text-muted-foreground">Loading prompts…</p>
      </div>
    );
  }

  // Recommended prompt = best_opportunity, but selectedId overrides
  const recommended =
    prompts.find((p) => p.status === "best_opportunity") ?? prompts[0];
  const selected = prompts.find((p) => p.id === selectedId) ?? recommended;

  // Brand metrics for the currently selected prompt (real Peec data)
  const [brandMetrics, setBrandMetrics] = useState<PromptBrandMetric[] | null>(
    null,
  );
  const [brandMetricsLoading, setBrandMetricsLoading] = useState(true);
  const [qfos, setQfos] = useState<PromptQfo[] | null>(null);
  const [qfosLoading, setQfosLoading] = useState(true);
  const [recommendation, setRecommendation] =
    useState<PromptRecommendation | null>(null);
  const [recommendationLoading, setRecommendationLoading] = useState(true);
  const [tableRows, setTableRows] = useState<PromptTableRow[] | null>(null);
  const [tableLoading, setTableLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    setTableLoading(true);
    getPromptTable()
      .then((rows) => {
        if (cancelled) return;
        setTableRows(rows);
      })
      .catch(() => {
        if (cancelled) return;
        setTableRows([]);
      })
      .finally(() => {
        if (cancelled) return;
        setTableLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    let cancelled = false;
    setBrandMetricsLoading(true);
    setBrandMetrics(null);
    setQfosLoading(true);
    setQfos(null);
    setRecommendationLoading(true);
    setRecommendation(null);
    getPromptRecommendation({
      data: { promptId: selected.id, ownBrandName: project.ownBrand.name },
    })
      .then((data) => {
        if (cancelled) return;
        setRecommendation(data);
      })
      .catch(() => {
        if (cancelled) return;
        setRecommendation(null);
      })
      .finally(() => {
        if (cancelled) return;
        setRecommendationLoading(false);
      });
    getPromptBrandMetrics({ data: { promptId: selected.id } })
      .then((rows) => {
        if (cancelled) return;
        setBrandMetrics(rows);
      })
      .catch(() => {
        if (cancelled) return;
        setBrandMetrics([]);
      })
      .finally(() => {
        if (cancelled) return;
        setBrandMetricsLoading(false);
      });
    getPromptQfos({ data: { promptId: selected.id } })
      .then((rows) => {
        if (cancelled) return;
        setQfos(rows);
      })
      .catch(() => {
        if (cancelled) return;
        setQfos([]);
      })
      .finally(() => {
        if (cancelled) return;
        setQfosLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [project.ownBrand.name, selected.id]);

  const selectedStats = recommendation?.prompt;
  const cardMetrics = {
    ownVisibility: selectedStats?.ownVisibility ?? selected.ownVisibility,
    topCompetitor: selectedStats?.topCompetitor ?? selected.topCompetitor,
    topCompetitorVisibility:
      selectedStats?.topCompetitorVisibility ?? selected.topCompetitorVisibility,
    visibilityGap: selectedStats?.visibilityGap ?? selected.visibilityGap,
    opportunityScore: selectedStats?.opportunityScore ?? selected.opportunityScore,
  };
  const cardCounts = recommendation?.counts ?? {
    sources: selected.sourcesFound,
    qfos: selected.hiddenQuestionsFound,
    openings: selected.openingsFound,
  };
  const cardReasons = recommendation?.reasons ?? selected.reasons ?? [];
  const previewOpenings = recommendation?.openingPreviews ?? [];


  const startFlow = () => {
    store.selectPrompt(selected.id);
    navigate({ to: "/openings" });
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] px-6 py-10 2xl:px-10">
      <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        Step 1 · Recommended Opening
        {selected.id !== recommended.id && (
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] normal-case tracking-normal text-muted-foreground">
            custom selection
          </span>
        )}
      </div>
      <h1 className="text-3xl font-semibold tracking-tight">
        Start with the prompt where you can win the most
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        We ranked all {prompts.length} prompts by Opportunity Score. Here&rsquo;s
        the one we&rsquo;d fix first — and a sneak peek of the openings ready
        for you.
      </p>

      {/* Hero recommended-prompt card */}
      <Card className="mt-8 overflow-hidden border-border p-0">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div className="border-b border-border p-7 lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-2 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Recommended prompt
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">
              &ldquo;{selected.text}&rdquo;
            </h2>

            <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
              <Stat
                label="Your visibility"
                value={recommendationLoading ? "…" : `${cardMetrics.ownVisibility}%`}
                tone="destructive"
              />
              <Stat
                label={`${cardMetrics.topCompetitor ?? "Top competitor"} visibility`}
                value={recommendationLoading ? "…" : `${cardMetrics.topCompetitorVisibility}%`}
              />
              <Stat
                label="Visibility gap"
                value={recommendationLoading ? "…" : `${cardMetrics.visibilityGap}%`}
                tone="destructive"
                icon={TrendingDown}
              />
              <Stat
                label="Opportunity score"
                value={recommendationLoading ? "…" : `${cardMetrics.opportunityScore}/100`}
                tone="primary"
              />
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 text-xs">
              <Mini label="Sources found" value={recommendationLoading ? "…" : cardCounts.sources} />
              <Mini label="Query fanouts" value={recommendationLoading ? "…" : cardCounts.qfos} />
              <Mini label="Openings found" value={recommendationLoading ? "…" : cardCounts.openings} />
            </div>

            {cardReasons.length > 0 && (
              <div className="mt-6 space-y-2">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Why this prompt
                </div>
                <ul className="space-y-1.5">
                  {cardReasons.map((r) => (
                    <li
                      key={r}
                      className="flex items-start gap-2 text-sm text-foreground"
                    >
                      <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button size="lg" onClick={startFlow}>
                Start flow with this prompt{" "}
                <ArrowRight className="h-4 w-4" />
              </Button>
              <button
                onClick={() =>
                  document.getElementById("prompt-switcher")?.scrollIntoView({
                    behavior: "smooth",
                  })
                }
                className="text-xs text-muted-foreground underline decoration-dotted underline-offset-2 hover:text-foreground"
              >
                Pick a different prompt
              </button>
            </div>
          </div>

          <div className="bg-secondary/40 p-7">
            <BrandsTable
              metrics={brandMetrics}
              loading={brandMetricsLoading}
              ownBrandName={project.ownBrand.name}
            />

            <div className="mt-7">
              <QfosTable qfos={qfos} loading={qfosLoading} />
            </div>
          </div>
        </div>
      </Card>

      {/* Sneak peek of openings */}
      <div className="mt-12">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Sneak peek · openings for this prompt
            </h2>
            <p className="text-xs text-muted-foreground">
              The first {previewOpenings.length} of {cardCounts.openings}{" "}
              openings already drafted by the agent.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={startFlow}>
            See all openings <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {previewOpenings.map((o) => (
            <OpeningPreviewCard key={o.id} opening={o} onOpen={startFlow} />
          ))}
        </div>
      </div>

      {/* Prompt switcher */}
      <div id="prompt-switcher" className="mt-12">
        <div className="mb-3">
          <h2 className="text-lg font-semibold tracking-tight">
            Or pick a different prompt
          </h2>
          <p className="text-xs text-muted-foreground">
            Selecting a prompt instantly updates the recommendation and the
            openings preview above — no reload.
          </p>
        </div>

        <PromptsTable
          rows={tableRows}
          loading={tableLoading}
          selectedId={selected.id}
          onSelect={(id) => {
            store.selectPrompt(id);
            document
              .getElementById("prompt-switcher")
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        />
      </div>
    </div>
  );
}

function OpeningPreviewCard({
  opening,
  onOpen,
}: {
  opening: PromptRecommendation["openingPreviews"][number];
  onOpen: () => void;
}) {
  let host = "";
  try {
    host = new URL(opening.sourceUrl).hostname.replace(/^www\./, "");
  } catch {
    host = opening.sourceUrl;
  }
  return (
    <button
      onClick={onOpen}
      className="group flex flex-col rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-foreground/30 hover:shadow-sm"
    >
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <Favicon name={host} kind="brand" size={12} />
        <span className="truncate font-mono">{host}</span>
      </div>
      <h3 className="mt-2 line-clamp-2 text-sm font-semibold">
        {opening.sourceName}
      </h3>
      <div className="mt-3 text-[11px] uppercase tracking-wider text-muted-foreground">
        Opening
      </div>
      <div className="text-sm font-medium">{opening.openingType}</div>
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>Impact</span>
        <span className="font-mono text-foreground">
          {opening.impactScore}/100
        </span>
      </div>
      <div className="mt-1">
        <ScoreBar value={opening.impactScore} />
      </div>
      <div className="mt-3 flex items-center justify-end gap-1 text-xs font-medium text-foreground/70 group-hover:text-foreground">
        Open <ArrowRight className="h-3 w-3" />
      </div>
    </button>
  );
}

function Stat({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string;
  tone?: "destructive" | "primary";
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const color =
    tone === "destructive"
      ? "text-destructive"
      : tone === "primary"
        ? "text-primary"
        : "text-foreground";
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-1 flex items-center gap-1 text-2xl font-semibold tabular-nums",
          color,
        )}
      >
        {Icon && <Icon className="h-4 w-4" />}
        {value}
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border bg-background px-3 py-2">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="font-mono text-base font-medium">{value}</div>
    </div>
  );
}

function BrandsTable({
  metrics,
  loading,
  ownBrandName,
}: {
  metrics: PromptBrandMetric[] | null;
  loading: boolean;
  ownBrandName: string;
}) {
  const sorted = useMemo(() => {
    if (!metrics) return [];
    return [...metrics].sort((a, b) => b.visibility - a.visibility);
  }, [metrics]);

  return (
    <div>
      <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
        Top {sorted.length || 5} Brands
        <span
          className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-muted-foreground/40 text-[9px] text-muted-foreground"
          title="Brand visibility, share of voice, sentiment, and average position from AI engine answers"
        >
          i
        </span>
      </div>

      <div className="mt-3 overflow-hidden rounded-lg border border-border bg-background">
        {/* Header row */}
        <div className="grid grid-cols-[24px_minmax(0,1fr)_64px_56px_72px_56px] items-center gap-2 bg-secondary/40 px-4 py-2.5 text-[11px] font-medium text-muted-foreground">
          <div>#</div>
          <div>Brand</div>
          <div className="text-right">Visibility</div>
          <div className="text-right">SOV</div>
          <div className="text-right">Sentiment</div>
          <div className="text-right">Position</div>
        </div>

        {loading ? (
          <ul className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <li
                key={i}
                className="grid grid-cols-[24px_minmax(0,1fr)_64px_56px_72px_56px] items-center gap-2 px-3 py-3"
              >
                <Skeleton className="h-3 w-4" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="ml-auto h-3 w-12" />
                <Skeleton className="ml-auto h-3 w-10" />
                <Skeleton className="ml-auto h-3 w-12" />
                <Skeleton className="ml-auto h-3 w-12" />
              </li>
            ))}
          </ul>
        ) : sorted.length === 0 ? (
          <div className="px-4 py-6 text-center text-xs text-muted-foreground">
            No brand data for this prompt yet.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {sorted.map((m, i) => {
              const isOwn = m.is_own || m.brand_name === ownBrandName;
              return (
                <li
                  key={m.brand_id}
                  className={cn(
                    "grid grid-cols-[24px_minmax(0,1fr)_64px_56px_72px_56px] items-center gap-2 px-3 py-3 text-sm",
                    isOwn && "bg-primary-soft/40",
                  )}
                >
                  <div className="text-muted-foreground tabular-nums">
                    {i + 1}
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <Favicon name={m.brand_name} kind="brand" size={18} />
                    <span
                      className={cn(
                        "truncate",
                        isOwn ? "font-semibold text-primary" : "text-foreground",
                      )}
                    >
                      {m.brand_name}
                    </span>
                  </div>
                  <BrandStat
                    text={`${Math.round(m.visibility * 100)}%`}
                  />
                  <BrandStat
                    text={`${Math.round(m.share_of_voice * 100)}%`}
                  />
                  <BrandStat
                    text={
                      m.sentiment === null
                        ? "—"
                        : String(Math.round(m.sentiment))
                    }
                    leadingDot={m.sentiment !== null}
                  />
                  <BrandStat
                    text={
                      m.position === null
                        ? "—"
                        : `# ${m.position.toFixed(1)}`
                    }
                  />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function BrandStat({
  text,
  leadingDot = false,
}: {
  text: string;
  leadingDot?: boolean;
}) {
  return (
    <div className="flex items-center justify-end gap-1.5 tabular-nums text-foreground">
      {leadingDot && (
        <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
      )}
      <span>{text}</span>
      <span className="text-muted-foreground">–</span>
    </div>
  );
}
