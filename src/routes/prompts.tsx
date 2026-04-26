import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, ChevronDown, Sparkles, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Favicon } from "@/components/favicon";
import { store, useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  getPromptBrandMetrics,
  type PromptBrandMetric,
} from "@/lib/server/get-prompt-brand-metrics";
import { PromptsTable, computePromptAggregates } from "@/components/prompts-table";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";
import { ModelLogo } from "@/components/qfos-table";
import {
  getPromptTable,
  type PromptTableRow,
} from "@/lib/server/get-prompt-table";
import {
  getPromptRecommendation,
  type PromptRecommendation,
} from "@/lib/server/get-prompt-recommendation";
import { enqueueOpeningDrafts } from "@/lib/server/enqueue-opening-drafts";
import { getOpeningsOverview } from "@/lib/server/get-openings-overview";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/prompts")({
  head: () => ({ meta: [{ title: "Your openings — Peec AI" }] }),
  component: PromptsPage,
});

function PromptsPage() {
  const prompts = useAppStore((s) => s.prompts);
  const project = useAppStore((s) => s.project);
  const selectedId = useAppStore((s) => s.selectedPromptId);
  const visitedPromptIds = useAppStore((s) => s.visitedPromptIds);
  const navigate = useNavigate();

  if (!project || prompts.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="text-sm text-muted-foreground">Loading prompts…</p>
      </div>
    );
  }

  const recommended =
    prompts.find((p) => p.status === "best_opportunity") ?? prompts[0];
  const selected = prompts.find((p) => p.id === selectedId) ?? recommended;

  const [brandMetrics, setBrandMetrics] = useState<PromptBrandMetric[] | null>(
    null,
  );
  const [recommendation, setRecommendation] =
    useState<PromptRecommendation | null>(null);
  const [recommendationLoading, setRecommendationLoading] = useState(true);
  const [tableRows, setTableRows] = useState<PromptTableRow[] | null>(null);
  const [tableLoading, setTableLoading] = useState(true);
  const [tableQuery, setTableQuery] = useState("");
  const [tableOpen, setTableOpen] = useState(true);
  const tableAgg = useMemo(() => computePromptAggregates(tableRows), [tableRows]);

  useEffect(() => {
    let cancelled = false;
    setTableLoading(true);
    getPromptTable()
      .then((rows) => !cancelled && setTableRows(rows))
      .catch(() => !cancelled && setTableRows([]))
      .finally(() => !cancelled && setTableLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setRecommendationLoading(true);
    setRecommendation(null);
    setBrandMetrics(null);

    getPromptRecommendation({
      data: {
        promptId: selected.id,
        ownBrandName: project.ownBrand.name,
        ownBrandDomain: project.ownBrand.domain ?? null,
        competitors: project.competitors.map((c) => ({
          name: c.name,
          domain: c.domain ?? null,
        })),
      },
    })
      .then((data) => !cancelled && setRecommendation(data))
      .catch(() => !cancelled && setRecommendation(null))
      .finally(() => !cancelled && setRecommendationLoading(false));

    getPromptBrandMetrics({ data: { promptId: selected.id } })
      .then((rows) => !cancelled && setBrandMetrics(rows))
      .catch(() => !cancelled && setBrandMetrics([]));

    // Pre-warm drafts in the background
    void (async () => {
      for (let i = 0; i < 6; i++) {
        if (cancelled) return;
        try {
          const res = await enqueueOpeningDrafts({
            data: {
              promptId: selected.id,
              ownBrand: project.ownBrand.name,
              ownDomain: project.ownBrand.domain ?? null,
            },
          });
          if (res.enqueued === 0) return;
        } catch {
          return;
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [project.ownBrand.name, project.ownBrand.domain, selected.id]);

  const stats = recommendation?.prompt;
  const ownMetric = brandMetrics?.find(
    (m) => m.is_own || m.brand_name === project.ownBrand.name,
  );
  const topCompetitor = brandMetrics
    ?.filter((m) => !m.is_own && m.brand_name !== project.ownBrand.name)
    .slice()
    .sort((a, b) => b.visibility - a.visibility)[0];

  const ownVis =
    stats?.ownVisibility ??
    (ownMetric ? Math.round(ownMetric.visibility * 100) : null);
  const compVis =
    stats?.topCompetitorVisibility ??
    (topCompetitor ? Math.round(topCompetitor.visibility * 100) : null);
  const compName =
    stats?.topCompetitor ?? topCompetitor?.brand_name ?? "Competitor";
  const visGap = stats?.visibilityGap ?? null;
  const opp = stats?.opportunityScore ?? null;
  const counts = recommendation?.counts ?? null;

  const visitedPrompts = useMemo(
    () =>
      visitedPromptIds
        .map((id) => prompts.find((p) => p.id === id))
        .filter((p): p is NonNullable<typeof p> => Boolean(p)),
    [visitedPromptIds, prompts],
  );

  type VisitedStatus = {
    loading: boolean;
    ready: number;
    inProgress: number;
    total: number;
  };
  const [visitedStatus, setVisitedStatus] = useState<
    Record<string, VisitedStatus>
  >({});

  useEffect(() => {
    let cancelled = false;
    const ownDomain = project.ownBrand.domain ?? null;
    setVisitedStatus((prev) => {
      const next = { ...prev };
      for (const p of visitedPrompts) {
        if (!next[p.id]) {
          next[p.id] = { loading: true, ready: 0, inProgress: 0, total: 0 };
        }
      }
      return next;
    });
    visitedPrompts.forEach((p) => {
      getOpeningsOverview({ data: { promptId: p.id, ownDomain } })
        .then((res) => {
          if (cancelled) return;
          const all = res.groups.flatMap((g) => g.openings);
          const ready = all.filter((o) => o.draft.status === "ready").length;
          const inProgress = all.filter(
            (o) =>
              o.draft.status === "drafting" || o.draft.status === "pending",
          ).length;
          setVisitedStatus((prev) => ({
            ...prev,
            [p.id]: { loading: false, ready, inProgress, total: all.length },
          }));
        })
        .catch(() => {
          if (cancelled) return;
          setVisitedStatus((prev) => ({
            ...prev,
            [p.id]: { loading: false, ready: 0, inProgress: 0, total: 0 },
          }));
        });
    });
    return () => {
      cancelled = true;
    };
  }, [visitedPrompts, project.ownBrand.domain]);

  const startFlow = (id: string) => {
    store.selectPrompt(id);
    store.markPromptVisited(id);
    navigate({ to: "/openings" });
  };

  const fmt = (v: number | null, suffix = "%") =>
    recommendationLoading ? "…" : v === null ? "—" : `${v}${suffix}`;

  return (
    <div className="mx-auto w-full max-w-[1500px] px-6 py-10 2xl:px-10">
      <h1 className="text-3xl font-semibold tracking-tight">Let our agent increase your visibility</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Turn signals into actions. Select a prompt you want to work on
      </p>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        {/* Left — recommended prompt hero */}
        <Card className="flex flex-col gap-6 border-border p-7">
          <div className="flex items-center gap-2 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Recommended prompt
          </div>

          <div className="flex items-center justify-between gap-4">
            {recommendationLoading ? (
              <div className="flex-1 space-y-2">
                <Skeleton className="h-7 w-11/12" />
                <Skeleton className="h-7 w-2/3" />
              </div>
            ) : (
              <h2 className="text-2xl font-semibold leading-snug tracking-tight text-balance">
                &ldquo;{selected.text}&rdquo;
              </h2>
            )}
            <ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground" />
          </div>

          <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3">
            <KPI
              label="Your visibility"
              value={fmt(ownVis)}
              tone="destructive"
              loading={recommendationLoading}
            />
            <KPI
              label={
                recommendationLoading ? (
                  <Skeleton className="h-3 w-28" />
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    <Favicon name={compName} kind="brand" size={14} className="rounded-sm" />
                    <span>{compName} visibility</span>
                  </span>
                )
              }
              value={fmt(compVis)}
              loading={recommendationLoading}
            />
            <KPI
              label="Visibility gap"
              value={
                visGap === null
                  ? "—"
                  : `${visGap > 0 ? "+" : ""}${visGap}%`
              }
              tone={visGap !== null && visGap < 0 ? "destructive" : undefined}
              icon={
                visGap !== null && visGap < 0 ? (
                  <TrendingDown className="h-4 w-4" />
                ) : undefined
              }
              loading={recommendationLoading}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Mini
              label="Sources found"
              value={counts?.sources ?? "—"}
              loading={recommendationLoading}
              favicons={recommendation?.topSourceDomains}
            />
            <Mini
              label="Query fanouts"
              value={counts?.qfos ?? "—"}
              loading={recommendationLoading}
              modelIds={recommendation?.qfoModels}
            />
            <Mini
              label="Openings found"
              value={counts?.openings ?? "—"}
              loading={recommendationLoading}
            />
          </div>

          <Button
            size="lg"
            className="mt-2 h-14 w-full text-base"
            onClick={() => startFlow(selected.id)}
          >
            Work on this prompt <ArrowRight className="h-5 w-5" />
          </Button>
        </Card>

        {/* Right — recent prompts */}
        <Card className="flex flex-col gap-4 border-border p-6">
          <h3 className="text-sm font-semibold text-foreground">
            Results of prompts you have worked on
          </h3>
          {visitedPrompts.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-md border border-dashed border-border/60 px-4 py-8 text-center">
              <p className="text-xs text-muted-foreground">
                Prompts you work on will appear here.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {visitedPrompts.map((p) => {
                const st = visitedStatus[p.id];
                return (
                  <button
                    key={p.id}
                    onClick={() => startFlow(p.id)}
                    className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3 text-left transition-colors hover:border-foreground/30 hover:bg-card"
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="line-clamp-1 text-sm font-medium text-foreground">
                        &ldquo;{p.text}&rdquo;
                      </span>
                      {!st || st.loading ? (
                        <Skeleton className="h-3 w-32" />
                      ) : st.total === 0 ? (
                        <span className="text-[11px] text-muted-foreground">
                          No openings yet
                        </span>
                      ) : st.inProgress > 0 ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          {st.ready} ready · {st.inProgress} drafting
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">
                          <span className="font-medium text-foreground tabular-nums">
                            {st.ready}
                          </span>{" "}
                          / {st.total} drafts ready
                        </span>
                      )}
                    </div>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                  </button>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Prompt switcher */}
      <div id="prompt-switcher" className="mt-12">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setTableOpen((v) => !v)}
              className="group inline-flex items-center gap-2 text-base font-semibold tracking-tight text-foreground transition-colors hover:text-foreground/80"
              aria-expanded={tableOpen}
              aria-controls="prompts-table-region"
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  tableOpen ? "rotate-0" : "-rotate-90",
                )}
              />
              Select a prompt
              {!tableOpen && tableRows && (
                <span className="text-xs font-normal text-muted-foreground">
                  ({tableRows.length})
                </span>
              )}
            </button>
            {tableOpen && (
              <div className="relative w-72">
                <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={tableQuery}
                  onChange={(e) => setTableQuery(e.target.value)}
                  placeholder="Search a prompt"
                  className="h-8 pl-8 text-[13px]"
                />
              </div>
            )}
          </div>
          {tableOpen && (
            <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
              <span>
                Visibility{" "}
                <span className="font-semibold text-foreground tabular-nums">
                  {tableAgg.visibility}%
                </span>
              </span>
              <span className="text-border">|</span>
              <span className="inline-flex items-center gap-1.5">
                Sentiment{" "}
                <span className="inline-flex items-center gap-1 font-semibold text-foreground tabular-nums">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  {tableAgg.sentiment}
                </span>
              </span>
              <span className="text-border">|</span>
              <span>
                Position{" "}
                <span className="font-semibold text-foreground tabular-nums">
                  # {tableAgg.position.toFixed(1)}
                </span>
              </span>
            </div>
          )}
        </div>

        {tableOpen && (
          <div id="prompts-table-region">
            <PromptsTable
              rows={tableRows}
              loading={tableLoading}
              selectedId={selected.id}
              query={tableQuery}
              onSelect={(id) => {
                store.selectPrompt(id);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function KPI({
  label,
  value,
  tone,
  icon,
  loading,
}: {
  label: React.ReactNode;
  value: string;
  tone?: "destructive";
  icon?: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      {loading ? (
        <Skeleton className="mt-2 h-8 w-20" />
      ) : (
        <div
          className={cn(
            "mt-1 flex items-center gap-1 text-3xl font-semibold tabular-nums",
            tone === "destructive" ? "text-destructive" : "text-foreground",
          )}
        >
          {icon}
          {value}
        </div>
      )}
    </div>
  );
}

function Mini({
  label,
  value,
  loading,
  favicons,
  modelIds,
}: {
  label: string;
  value: number | string;
  loading?: boolean;
  favicons?: string[];
  modelIds?: string[];
}) {
  return (
    <div className="rounded-md border border-border bg-background px-3 py-2.5">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      {loading ? (
        <Skeleton className="mt-1 h-5 w-10" />
      ) : (
        <div className="mt-1 flex items-center justify-between gap-2">
          <div className="font-mono text-base font-medium leading-none">
            {value}
          </div>
          {favicons && favicons.length > 0 && (
            <div className="flex -space-x-1.5">
              {favicons.slice(0, 4).map((domain) => (
                <img
                  key={domain}
                  src={`https://www.google.com/s2/favicons?sz=32&domain=${domain}`}
                  alt={domain}
                  title={domain}
                  loading="lazy"
                  className="h-5 w-5 rounded-full border border-border bg-background object-contain p-0.5"
                />
              ))}
            </div>
          )}
          {modelIds && modelIds.length > 0 && (
            <div className="flex -space-x-1.5">
              {modelIds.slice(0, 4).map((id) => (
                <div
                  key={id}
                  title={id}
                  className="flex h-5 w-5 items-center justify-center rounded-full border border-border bg-background text-foreground/80"
                >
                  <ModelLogo modelId={id} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
