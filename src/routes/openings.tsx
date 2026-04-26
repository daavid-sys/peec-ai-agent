import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ExternalLink,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Favicon } from "@/components/favicon";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { CHANNELS, type Channel } from "@/lib/channel";
import {
  getOpeningsOverview,
  type OpeningChannelGroup,
  type OpeningOverviewItem,
  type OpeningsOverview,
} from "@/lib/server/get-openings-overview";
import { enqueueOpeningDrafts } from "@/lib/server/enqueue-opening-drafts";

export const Route = createFileRoute("/openings")({
  head: () => ({ meta: [{ title: "Content Plan — Peec AI Openings" }] }),
  component: OpeningsPage,
});

function OpeningsPage() {
  const selectedPromptId = useAppStore((s) => s.selectedPromptId);
  const prompts = useAppStore((s) => s.prompts);
  const project = useAppStore((s) => s.project);
  const fallbackPromptId = "pr_05a66669-478c-4b25-94bc-9119409e5e2f";
  const promptId = selectedPromptId ?? fallbackPromptId;
  const localPrompt = prompts.find((p) => p.id === promptId);
  const navigate = useNavigate();

  const [overview, setOverview] = useState<OpeningsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  // Track in-flight enqueue calls so we don't spam.
  const enqueuingRef = useRef(false);

  async function load() {
    try {
      const res = await getOpeningsOverview({
        data: { promptId, ownDomain: project?.ownBrand.domain ?? null },
      });
      setOverview(res);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    setOverview(null);
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promptId]);

  // Background drafting + polling: while any draft is missing/pending/drafting,
  // keep enqueuing batches and re-fetching the overview.
  useEffect(() => {
    if (!overview || !project) return;
    const pending = overview.groups.flatMap((g) =>
      g.openings.filter(
        (o) =>
          o.draft.status === "missing" ||
          o.draft.status === "pending" ||
          o.draft.status === "drafting" ||
          o.draft.status === "failed",
      ),
    );
    if (pending.length === 0) return;

    let cancelled = false;
    const tick = async () => {
      if (cancelled) return;
      if (!enqueuingRef.current) {
        enqueuingRef.current = true;
        try {
          await enqueueOpeningDrafts({
            data: {
              promptId,
              ownBrand: project.ownBrand.name,
              ownDomain: project.ownBrand.domain ?? null,
            },
          });
        } catch {
          /* ignore */
        } finally {
          enqueuingRef.current = false;
        }
      }
      if (cancelled) return;
      await load();
    };
    const handle = window.setTimeout(tick, 2500);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [overview, project, promptId]);

  const promptText =
    overview?.promptText ?? localPrompt?.text ?? "Selected prompt";

  const totalReady = useMemo(() => {
    if (!overview) return 0;
    return overview.groups.reduce(
      (acc, g) =>
        acc + g.openings.filter((o) => o.draft.status === "ready").length,
      0,
    );
  }, [overview]);

  return (
    <div className="mx-auto w-full max-w-[1500px] px-6 py-10 2xl:px-10">
      <div className="flex items-center justify-between gap-6">
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Content plan for
          </div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            <span className="text-primary">&ldquo;{promptText}&rdquo;</span>
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            We grouped every opening by the channel where the agent will publish.
            Each row expands to show the cited source, what we read in the scrape,
            and a short brief of the draft we&rsquo;re writing for it.
          </p>
        </div>
        <div className="flex shrink-0 items-center">
          <Button
            size="lg"
            className="h-14 px-8 text-base"
            onClick={() => navigate({ to: "/studio" })}
            disabled={!overview || overview.totalOpenings === 0}
          >
            Next <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <SummaryStrip overview={overview} loading={loading} totalReady={totalReady} />

      <div className="mt-8 space-y-3">
        {loading ? (
          <>
            <ChannelSkeleton />
            <ChannelSkeleton />
            <ChannelSkeleton />
          </>
        ) : overview && overview.groups.length > 0 ? (
          <Accordion
            type="multiple"
            defaultValue={overview.groups.slice(0, 2).map((g) => g.channel)}
            className="space-y-3"
          >
            {overview.groups.map((group) => (
              <ChannelGroupCard key={group.channel} group={group} />
            ))}
          </Accordion>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-sm text-muted-foreground">
              No openings generated yet for this prompt.
            </p>
          </Card>
        )}
      </div>

      <div className="mt-8">
        <Button variant="ghost" asChild>
          <Link to="/prompts">← Back to prompts</Link>
        </Button>
      </div>
    </div>
  );
}

function SummaryStrip({
  overview,
  loading,
  totalReady,
}: {
  overview: OpeningsOverview | null;
  loading: boolean;
  totalReady: number;
}) {
  const total = overview?.totalOpenings ?? 0;
  const channels = overview?.groups.length ?? 0;
  const drafting = overview
    ? overview.groups.reduce(
        (acc, g) =>
          acc +
          g.openings.filter(
            (o) =>
              o.draft.status === "drafting" || o.draft.status === "pending",
          ).length,
        0,
      )
    : 0;
  const readyPct = total > 0 ? Math.round((totalReady / total) * 100) : 0;

  return (
    <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
      <SummaryTile
        label="Total openings"
        value={loading ? "…" : String(total)}
      />
      <SummaryTile
        label="Channels in plan"
        value={loading ? "…" : String(channels)}
      />
      <SummaryTile
        label="Drafts ready"
        value={loading ? "…" : `${totalReady} / ${total}`}
        accent
      />
      <SummaryTile
        label={drafting > 0 ? "Agent drafting now" : "Plan complete"}
        value={
          loading
            ? "…"
            : drafting > 0
              ? `${drafting} writing`
              : `${readyPct}%`
        }
        spinning={drafting > 0}
      />
    </div>
  );
}

function SummaryTile({
  label,
  value,
  accent,
  spinning,
}: {
  label: string;
  value: string;
  accent?: boolean;
  spinning?: boolean;
}) {
  return (
    <Card
      className={cn(
        "border-border bg-card p-4",
        accent && "border-primary/30 bg-primary-soft",
      )}
    >
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {spinning && <Loader2 className="h-3 w-3 animate-spin" />}
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
    </Card>
  );
}

function ChannelSkeleton() {
  return (
    <Card className="border-border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-md" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-2.5 w-48" />
          </div>
        </div>
        <Skeleton className="h-6 w-12 rounded-full" />
      </div>
    </Card>
  );
}

function ChannelGroupCard({ group }: { group: OpeningChannelGroup }) {
  const meta = CHANNELS[group.channel];
  const ready = group.openings.filter((o) => o.draft.status === "ready").length;
  const drafting = group.openings.filter(
    (o) => o.draft.status === "drafting" || o.draft.status === "pending",
  ).length;

  return (
    <AccordionItem
      value={group.channel}
      className="overflow-hidden rounded-lg border border-border bg-card"
    >
      <AccordionTrigger className="px-4 py-3 hover:no-underline [&[data-state=open]]:border-b [&[data-state=open]]:border-border">
        <div className="flex flex-1 items-center justify-between gap-4 pr-2">
          <div className="flex items-center gap-3 text-left">
            <ChannelBadge channel={group.channel} />
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                {meta.label}
                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-normal text-muted-foreground">
                  {group.total} opening{group.total === 1 ? "" : "s"}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {meta.description}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {drafting > 0 && (
              <span className="inline-flex items-center gap-1 text-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                drafting {drafting}
              </span>
            )}
            <span className="tabular-nums">
              <span className="text-foreground">{ready}</span> / {group.total}{" "}
              ready
            </span>
            <span className="tabular-nums">
              top impact {group.topImpact}
            </span>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="bg-background/50 p-0">
        <div className="divide-y divide-border">
          {group.openings.map((opening) => (
            <OpeningRow key={opening.id} opening={opening} channel={group.channel} />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

function ChannelBadge({ channel }: { channel: Channel }) {
  const meta = CHANNELS[channel];
  return (
    <div
      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md text-[11px] font-semibold uppercase text-white"
      style={{ backgroundColor: meta.accent }}
    >
      {meta.label.slice(0, 2)}
    </div>
  );
}

function OpeningRow({
  opening,
  channel,
}: {
  opening: OpeningOverviewItem;
  channel: Channel;
}) {
  const [expanded, setExpanded] = useState(false);
  const status = opening.draft.status;
  const host = opening.source.domain ?? "";

  return (
    <div className="px-4 py-3">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-start justify-between gap-4 text-left transition-colors hover:opacity-80"
      >
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {host ? (
            <Favicon name={host} kind="brand" size={18} className="mt-0.5" />
          ) : (
            <div className="mt-0.5 h-[18px] w-[18px] rounded bg-muted" />
          )}
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-foreground">
              {opening.title}
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              {host && <span className="font-mono">{host}</span>}
              {opening.competitor && (
                <>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    vs
                    <Favicon
                      name={opening.competitor}
                      kind="brand"
                      size={12}
                      className="rounded-sm"
                    />
                    {opening.competitor}
                  </span>
                </>
              )}
              <span>·</span>
              <span className="capitalize">
                {opening.actionType.replace(/_/g, " ")}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2 text-xs">
          <DraftStatusPill status={status} />
          <Badge variant="outline" className="font-mono tabular-nums">
            {opening.impactScore}
          </Badge>
        </div>
      </button>

      {expanded && (
        <div className="animate-fade-in mt-3 grid grid-cols-1 gap-3 rounded-md border border-border bg-secondary/40 p-4 text-sm md:grid-cols-[1fr_1fr]">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Cited source
            </div>
            {opening.source.url ? (
              <a
                href={opening.source.url}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-start gap-1 text-sm font-medium text-foreground hover:text-primary"
              >
                {opening.source.title ?? opening.source.url}
                <ExternalLink className="mt-0.5 h-3 w-3 opacity-60" />
              </a>
            ) : (
              <div className="mt-1 text-sm text-muted-foreground">
                No source attached
              </div>
            )}
            {opening.source.excerpt && (
              <p className="mt-3 text-xs italic text-muted-foreground">
                &ldquo;{opening.source.excerpt}&rdquo;
              </p>
            )}
            {opening.rationale && (
              <>
                <div className="mt-4 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Why this is an opening
                </div>
                <p className="mt-1 text-sm text-foreground">
                  {opening.rationale}
                </p>
              </>
            )}
          </div>

          <div className="rounded-md border border-border bg-card p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <Sparkles className="h-3 w-3 text-primary" />
                Draft brief · {CHANNELS[channel].label}
              </div>
              <DraftStatusPill status={status} />
            </div>
            <div className="mt-2 min-h-[80px]">
              {status === "ready" && opening.draft.brief ? (
                <p className="text-sm text-foreground">{opening.draft.brief}</p>
              ) : status === "failed" ? (
                <p className="text-sm text-destructive">
                  Draft failed: {opening.draft.error ?? "unknown error"}.
                  We&rsquo;ll retry on the next cycle.
                </p>
              ) : (
                <BriefSkeleton />
              )}
            </div>
            {status === "ready" && (
              <div className="mt-3 flex items-center justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-xs"
                >
                  <Link to="/studio">
                    Open in studio <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DraftStatusPill({
  status,
}: {
  status: OpeningOverviewItem["draft"]["status"];
}) {
  const map: Record<
    OpeningOverviewItem["draft"]["status"],
    { label: string; className: string; spin?: boolean }
  > = {
    ready: {
      label: "Draft ready",
      className: "border-success/40 bg-success/10 text-success",
    },
    drafting: {
      label: "Drafting",
      className: "border-primary/40 bg-primary-soft text-primary",
      spin: true,
    },
    pending: {
      label: "Queued",
      className: "border-border bg-muted text-muted-foreground",
    },
    missing: {
      label: "Queued",
      className: "border-border bg-muted text-muted-foreground",
    },
    failed: {
      label: "Retrying",
      className: "border-destructive/40 bg-destructive/10 text-destructive",
    },
  };
  const m = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
        m.className,
      )}
    >
      {m.spin && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
      {m.label}
    </span>
  );
}

function BriefSkeleton() {
  return (
    <div className="space-y-1.5">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-11/12" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  );
}
