import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileText,
  Globe,
  Mail,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScoreBar } from "@/components/score-bar";
import { Favicon } from "@/components/favicon";
import { PromptHeaderCard } from "@/components/prompt-header-card";
import { useAppStore } from "@/lib/store";
import {
  getStudioDrafts,
  type StudioDraft,
  type StudioDraftsResponse,
} from "@/lib/server/get-studio-drafts";
import {
  getResultsMetrics,
  type ResultsMetrics,
} from "@/lib/server/get-results-metrics";
import {
  getPromptTable,
  type PromptTableRow,
} from "@/lib/server/get-prompt-table";
import { classifyTask, getTaskTitle, type TaskType } from "@/lib/task-type";

export const Route = createFileRoute("/results")({
  head: () => ({ meta: [{ title: "Results — Peec AI Openings" }] }),
  component: ResultsPage,
});

const TYPE_META: Record<TaskType, { label: string; icon: typeof Mail; tone: string }> = {
  email_pitch: { label: "Email pitch", icon: Mail, tone: "var(--warning, #d97706)" },
  cms_publish: { label: "Owned blog", icon: Globe, tone: "var(--primary)" },
  platform_post: { label: "Platform post", icon: Sparkles, tone: "var(--success)" },
};

function ResultsPage() {
  const engagements = useAppStore((s) => s.engagements);
  const sent = engagements.filter((e) => e.status === "sent" || e.status === "approved").length;

  const selectedPromptId = useAppStore((s) => s.selectedPromptId);
  const project = useAppStore((s) => s.project);
  const promptId = selectedPromptId ?? "pr_05a66669-478c-4b25-94bc-9119409e5e2f";
  const ownBrand = useMemo(
    () => ({
      name: project?.ownBrand.name ?? "Attio",
      domain: project?.ownBrand.domain ?? "attio.com",
    }),
    [project],
  );

  const [response, setResponse] = useState<StudioDraftsResponse | null>(null);
  const [metrics, setMetrics] = useState<ResultsMetrics | null>(null);
  const [promptRow, setPromptRow] = useState<PromptTableRow | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [completedRestored, setCompletedRestored] = useState(false);

  // Prompt-row metrics (visibility + competitor mention logos) — same source
  // the openings page header uses.
  useEffect(() => {
    let cancelled = false;
    setPromptRow(null);
    getPromptTable()
      .then((rows) => {
        if (cancelled) return;
        setPromptRow(rows.find((r) => r.id === promptId) ?? null);
      })
      .catch(() => !cancelled && setPromptRow(null));
    return () => {
      cancelled = true;
    };
  }, [promptId]);

  // Restore queue progress
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`queue:progress:${promptId}`);
      if (raw) {
        const saved = JSON.parse(raw) as { completed?: string[] };
        if (saved.completed?.length) setCompletedIds(new Set(saved.completed));
      }
    } catch {
      /* ignore */
    }
    setCompletedRestored(true);
  }, [promptId]);

  // Drafts
  useEffect(() => {
    let cancelled = false;
    setResponse(null);
    void getStudioDrafts({ data: { promptId, ownDomain: ownBrand.domain } }).then(
      (res) => {
        if (!cancelled) setResponse(res);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [promptId, ownBrand.domain]);

  // Real metrics — re-fetch when completion set changes so projected lift moves.
  useEffect(() => {
    if (!completedRestored) return;
    let cancelled = false;
    setMetrics(null);
    void getResultsMetrics({
      data: {
        promptId,
        ownDomain: ownBrand.domain,
        completedOpeningIds: Array.from(completedIds),
      },
    }).then((res) => {
      if (!cancelled) setMetrics(res);
    });
    return () => {
      cancelled = true;
    };
  }, [promptId, ownBrand.domain, completedIds, completedRestored]);

  const drafts = response?.drafts ?? [];
  const completedDrafts = drafts.filter((d) => completedIds.has(d.id));

  // Realistic projected visibility:
  // - Headroom is the gap between current own visibility and the top competitor.
  // - Each completed draft captures a share of that headroom proportional to
  //   the source citation_rate (capped at 6pp per post to stay grounded).
  // - Lift is bounded by available headroom.
  const projection = useMemo(() => {
    if (!metrics) return null;
    const before = metrics.beforeVisibility;
    const ceiling = Math.max(metrics.topCompetitorVisibility, before);
    const headroom = Math.max(0, ceiling - before);

    // Per-completed-source lift: pull citation_rate from the matching SourceProgress row.
    const completedSources = metrics.sources.filter((s) => s.completed);
    const perPostCap = 6; // pp per completed action — kept conservative
    const rawLift = completedSources.reduce((acc, s) => {
      // Approximate authority weight: COMPETITOR/REFERENCE sources hit harder.
      const weight =
        s.classification === "REFERENCE"
          ? 1.4
          : s.classification === "COMPETITOR"
            ? 1.2
            : 1;
      return acc + Math.min(perPostCap, 3 * weight);
    }, 0);
    const lift = Math.min(headroom, Math.round(rawLift));
    return {
      before,
      ceiling,
      after: before + lift,
      lift,
      completedActions: completedSources.length,
    };
  }, [metrics]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          Step 4: Track Results
        </h1>
        <Link
          to="/prompts"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Go back to Openings <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {metrics?.promptText ? (
        <div className="mt-6 rounded-lg border border-border bg-card px-6 py-5 text-center">
          <p className="text-lg font-semibold tracking-tight text-foreground">
            &ldquo;{metrics.promptText}&rdquo;
          </p>
        </div>
      ) : (
        <Skeleton className="mt-6 h-[68px] w-full rounded-lg" />
      )}

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {metrics && projection ? (
          <>
            <BigStat
              label="Current visibility"
              value={`${Math.round(projection.before)}%`}
              sub={
                metrics.fanoutCount
                  ? `Across ${metrics.fanoutCount} query fanouts`
                  : "Live from Peec brand metrics"
              }
            />
            <BigStat
              label="Projected after queue"
              value={`${Math.round(projection.after)}%`}
              sub={
                projection.completedActions
                  ? `${projection.completedActions} completed action${projection.completedActions === 1 ? "" : "s"} factored in`
                  : "Mark tasks complete to model the lift"
              }
              accent
            />
            <BigStat
              label="Expected visibility lift"
              value={`+${projection.lift}pp`}
              sub={
                metrics.topCompetitor
                  ? `Capped by ${metrics.topCompetitor} at ${Math.round(metrics.topCompetitorVisibility)}%`
                  : "Capped by competitor ceiling"
              }
              tone="success"
              icon={ArrowUpRight}
            />
          </>
        ) : (
          <>
            <StatSkeleton />
            <StatSkeleton accent />
            <StatSkeleton />
          </>
        )}
      </div>

      {/* Collapsible completed tasks */}
      <CollapsibleSection
        title="Completed tasks"
        count={completedDrafts.length}
        defaultOpen
      >
        {!response ? (
          <ListSkeleton rows={3} />
        ) : completedDrafts.length === 0 ? (
          <p className="px-1 py-4 text-xs text-muted-foreground">
            No tasks marked complete yet — head back to{" "}
            <Link to="/queue" className="text-primary hover:underline">
              the queue
            </Link>{" "}
            to work through them.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {completedDrafts.map((d) => (
              <CompletedTaskRow
                key={d.id}
                draft={d}
                ownDomain={ownBrand.domain}
                promptId={promptId}
              />
            ))}
          </ul>
        )}
      </CollapsibleSection>

      {/* Collapsible: all content created (every draft generated, regardless of status) */}
      <CollapsibleSection
        title="All content drafted"
        count={drafts.length}
      >
        {!response ? (
          <ListSkeleton rows={4} />
        ) : drafts.length === 0 ? (
          <p className="px-1 py-4 text-xs text-muted-foreground">
            Nothing drafted in this prompt yet.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {drafts.map((d) => (
              <CompletedTaskRow
                key={d.id}
                draft={d}
                ownDomain={ownBrand.domain}
                promptId={promptId}
                showCompletedBadge={completedIds.has(d.id)}
              />
            ))}
          </ul>
        )}
      </CollapsibleSection>

      <Card className="mt-8 border-border p-6">
        <h2 className="text-sm font-semibold">Per-source progress</h2>
        <div className="mt-4 space-y-4">
          {!metrics ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i}>
                  <div className="mb-1 flex items-center justify-between">
                    <Skeleton className="h-4 w-56" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              ))}
            </div>
          ) : metrics.sources.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No sources tracked for this prompt yet.
            </p>
          ) : (
            metrics.sources.map((s) => (
              <div key={s.id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <div className="flex min-w-0 items-center gap-2">
                    <Favicon name={s.domain} kind="brand" size={14} />
                    <span className="truncate font-medium">{s.domain}</span>
                    <span className="ml-1 truncate text-xs text-muted-foreground">
                      {s.action}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">
                    {s.current}% → {s.target}%
                  </span>
                </div>
                <ScoreBar
                  value={s.target}
                  tone={
                    s.target === 0
                      ? "destructive"
                      : s.completed
                        ? "success"
                        : "primary"
                  }
                />
              </div>
            ))
          )}
        </div>
      </Card>

      <div className="mt-8 rounded-md border border-dashed border-border bg-secondary/30 p-5 text-center text-xs text-muted-foreground">
        Visibility tracking starts after actions are marked as published. {sent}{" "}
        action{sent === 1 ? "" : "s"} approved so far in this session.
      </div>

      <Card className="mt-8 border-primary/20 bg-primary-soft p-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
          <div>
            <div className="text-sm font-semibold">The Peec loop is closed.</div>
            <p className="mt-1 text-sm text-foreground">
              Peec measures AI visibility. Our Agent helps you act on it. New
              mentions land in Peec, and the next-best actions surfaces
              automatically.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function CollapsibleSection({
  title,
  count,
  defaultOpen = false,
  children,
}: {
  title: string;
  count: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="mt-6 border-border p-0 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-5 py-4 text-left transition hover:bg-muted/40"
      >
        <div className="flex items-center gap-2">
          {open ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <h2 className="text-sm font-semibold">{title}</h2>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground">
            {count}
          </span>
        </div>
      </button>
      {open && <div className="border-t border-border px-5 py-2">{children}</div>}
    </Card>
  );
}

function CompletedTaskRow({
  draft,
  ownDomain,
  promptId,
  showCompletedBadge,
}: {
  draft: StudioDraft;
  ownDomain: string;
  promptId: string;
  showCompletedBadge?: boolean;
}) {
  const type = classifyTask(draft, ownDomain);
  const title = getTaskTitle(draft, type, ownDomain);
  const Icon = TYPE_META[type].icon;
  const tone = TYPE_META[type].tone;
  const host = draft.source.domain ?? "—";

  return (
    <li>
      <Link
        to="/task/$id"
        params={{ id: draft.id }}
        search={{ promptId }}
        className="group flex items-center gap-3 py-3 transition hover:bg-muted/30 -mx-1 px-1 rounded-md"
      >
        <span
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full"
          style={{
            backgroundColor: `color-mix(in oklab, ${tone} 14%, transparent)`,
            color: tone,
          }}
        >
          {type === "platform_post" && draft.source.domain ? (
            <Favicon name={draft.source.domain} kind="brand" size={16} className="rounded-sm" />
          ) : (
            <Icon className="h-3.5 w-3.5" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <span className="truncate">{title}</span>
            {showCompletedBadge && (
              <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-1.5 py-0.5 text-[10px] font-medium text-success">
                <CheckCircle2 className="h-2.5 w-2.5" /> done
              </span>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Favicon name={host} kind="brand" size={10} />
            <span className="font-mono lowercase">{host}</span>
            <span className="text-border">·</span>
            <span className="truncate">{draft.title}</span>
          </div>
        </div>
        <FileText className="h-4 w-4 shrink-0 text-muted-foreground/60 transition group-hover:text-primary" />
      </Link>
    </li>
  );
}

function BigStat({
  label,
  value,
  sub,
  accent,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
  tone?: "success";
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card
      className={
        "p-5 " + (accent ? "border-primary/30 bg-primary-soft" : "border-border bg-card")
      }
    >
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className="mt-1 flex items-center gap-1 text-3xl font-semibold tabular-nums"
        style={tone === "success" ? { color: "var(--success)" } : undefined}
      >
        {Icon && <Icon className="h-5 w-5" />}
        {value}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
    </Card>
  );
}

function StatSkeleton({ accent }: { accent?: boolean }) {
  return (
    <Card
      className={
        "p-5 " + (accent ? "border-primary/30 bg-primary-soft" : "border-border bg-card")
      }
    >
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-2 h-8 w-20" />
      <Skeleton className="mt-2 h-3 w-40" />
    </Card>
  );
}

function ListSkeleton({ rows }: { rows: number }) {
  return (
    <ul className="divide-y divide-border">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="flex items-center gap-3 py-3">
          <Skeleton className="h-7 w-7 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </li>
      ))}
    </ul>
  );
}
