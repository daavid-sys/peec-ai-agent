import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ExternalLink,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Favicon } from "@/components/favicon";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { CHANNELS, type Channel } from "@/lib/channel";
import {
  getOpeningsOverview,
  type OpeningOverviewItem,
  type OpeningsOverview,
} from "@/lib/server/get-openings-overview";
import { enqueueOpeningDrafts } from "@/lib/server/enqueue-opening-drafts";
import {
  getPromptTable,
  type PromptTableRow,
} from "@/lib/server/get-prompt-table";

export const Route = createFileRoute("/openings")({
  head: () => ({ meta: [{ title: "Content Gaps — Peec AI Openings" }] }),
  component: OpeningsPage,
});

type ChannelFilter = Channel | "all";
type CompetitorFilter = string | "all";

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
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("all");
  const [competitorFilter, setCompetitorFilter] = useState<CompetitorFilter>("all");
  const [promptRow, setPromptRow] = useState<PromptTableRow | null>(null);

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
    setChannelFilter("all");
    setCompetitorFilter("all");
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promptId]);

  useEffect(() => {
    let cancelled = false;
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

  // Background drafting + polling
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

  const promptText = overview?.promptText ?? localPrompt?.text ?? "Selected prompt";

  // Flatten + derive filter facets
  const allOpenings = useMemo(
    () =>
      overview?.groups.flatMap((g) =>
        g.openings.map((o) => ({ ...o, _channel: g.channel as Channel })),
      ) ?? [],
    [overview],
  );

  const channelCounts = useMemo(() => {
    const map = new Map<Channel, number>();
    for (const o of allOpenings) map.set(o._channel, (map.get(o._channel) ?? 0) + 1);
    return map;
  }, [allOpenings]);

  const competitorCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of allOpenings) {
      for (const c of o.competitors) {
        map.set(c, (map.get(c) ?? 0) + 1);
      }
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [allOpenings]);

  const sourcesCount = useMemo(() => {
    const set = new Set<string>();
    for (const o of allOpenings) if (o.source.domain) set.add(o.source.domain);
    return set.size;
  }, [allOpenings]);

  const filtered = useMemo(
    () =>
      allOpenings.filter((o) => {
        if (channelFilter !== "all" && o._channel !== channelFilter) return false;
        if (
          competitorFilter !== "all" &&
          !o.competitors.includes(competitorFilter)
        )
          return false;
        return true;
      }),
    [allOpenings, channelFilter, competitorFilter],
  );

  const totalReady = allOpenings.filter((o) => o.draft.status === "ready").length;
  const drafting = allOpenings.filter(
    (o) => o.draft.status === "drafting" || o.draft.status === "pending",
  ).length;

  return (
    <div className="mx-auto w-full max-w-[1500px] px-6 py-10 2xl:px-10">
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/prompts"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to prompts
        </Link>
        <Button
          size="lg"
          onClick={() => navigate({ to: "/studio" })}
          disabled={!overview || overview.totalOpenings === 0}
        >
          Next <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <h1 className="mt-6 text-3xl font-semibold tracking-tight">
        Step 1: Action plan
      </h1>

      <div className="mt-6 rounded-lg border border-border bg-card px-6 py-5 text-center">
        <p className="text-lg font-semibold tracking-tight text-foreground">
          &ldquo;{promptText}&rdquo;
        </p>
      </div>

      {!loading && allOpenings.length > 0 && (
        <FilterChips
          channelFilter={channelFilter}
          competitorFilter={competitorFilter}
          onChannelChange={setChannelFilter}
          onCompetitorChange={setCompetitorFilter}
          channelCounts={channelCounts}
          competitorCounts={competitorCounts}
          total={allOpenings.length}
        />
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {loading ? (
          <>
            <GapCardSkeleton />
            <GapCardSkeleton />
            <GapCardSkeleton />
            <GapCardSkeleton />
            <GapCardSkeleton />
            <GapCardSkeleton />
          </>
        ) : filtered.length > 0 ? (
          filtered.map((o) => (
            <GapCard key={o.id} opening={o} channel={o._channel} />
          ))
        ) : allOpenings.length === 0 ? (
          <Card className="col-span-full p-12 text-center">
            <p className="text-sm text-muted-foreground">
              No openings generated yet for this prompt.
            </p>
          </Card>
        ) : (
          <Card className="col-span-full p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No gaps match the current filters.
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3"
              onClick={() => {
                setChannelFilter("all");
                setCompetitorFilter("all");
              }}
            >
              Clear filters
            </Button>
          </Card>
        )}
      </div>

    </div>
  );
}

function toTitleCase(input: string) {
  return input
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function ChannelTag({ accent, label }: { accent: string; label: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-foreground">
      <span
        aria-hidden
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: accent }}
      />
      {label}
    </span>
  );
}

function FilterChips({
  channelFilter,
  competitorFilter,
  onChannelChange,
  onCompetitorChange,
  channelCounts,
  competitorCounts,
  total,
}: {
  channelFilter: ChannelFilter;
  competitorFilter: CompetitorFilter;
  onChannelChange: (c: ChannelFilter) => void;
  onCompetitorChange: (c: CompetitorFilter) => void;
  channelCounts: Map<Channel, number>;
  competitorCounts: [string, number][];
  total: number;
}) {
  const channels = Array.from(channelCounts.entries()).sort((a, b) => b[1] - a[1]);

  return (
    <div className="mt-6 space-y-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Platform
        </span>
        <Chip
          active={channelFilter === "all"}
          onClick={() => onChannelChange("all")}
          label={`All (${total})`}
        />
        {channels.map(([c, n]) => (
          <Chip
            key={c}
            active={channelFilter === c}
            onClick={() => onChannelChange(c)}
            accent={CHANNELS[c].accent}
            label={`${CHANNELS[c].label} (${n})`}
          />
        ))}
      </div>
      {competitorCounts.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Competitor
          </span>
          <Chip
            active={competitorFilter === "all"}
            onClick={() => onCompetitorChange("all")}
            label="All"
          />
          {competitorCounts.map(([name, n]) => (
            <Chip
              key={name}
              active={competitorFilter === name}
              onClick={() => onCompetitorChange(name)}
              icon={<Favicon name={name} kind="brand" size={12} className="rounded-sm" />}
              label={`vs ${name} (${n})`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  label,
  accent,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  accent?: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground",
      )}
    >
      {accent && (
        <span
          aria-hidden
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: accent }}
        />
      )}
      {icon}
      {label}
    </button>
  );
}

function GapCard({
  opening,
  channel,
}: {
  opening: OpeningOverviewItem;
  channel: Channel;
}) {
  const meta = CHANNELS[channel];
  const host = opening.source.domain ?? "";
  const status = opening.draft.status;
  const classification =
    opening.source.classification ??
    opening.actionType.replace(/_/g, " ");
  const gapText = opening.rationale ?? opening.title;
  const draftReady = status === "ready";

  const Inner = (
    <Card className="group relative flex h-full flex-col gap-4 border-border bg-card p-5 transition-all hover:border-foreground/30 hover:shadow-md">
      {/* Platform header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {host ? <Favicon name={host} kind="brand" size={14} /> : null}
          <span className="truncate font-mono text-xs text-muted-foreground">
            {host || meta.label.toLowerCase()}
          </span>
        </div>
        <ChannelTag accent={meta.accent} label={toTitleCase(classification)} />
      </div>

      {/* Source title — bigger, more breathing room */}
      <div className="min-w-0 flex-1">
        {opening.source.url ? (
          <a
            href={opening.source.url}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-start gap-1.5 text-base font-semibold leading-snug text-foreground hover:text-primary"
          >
            <span className="line-clamp-3">
              {opening.source.title ?? opening.title}
            </span>
            <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0 opacity-50" />
          </a>
        ) : (
          <div className="line-clamp-3 text-base font-semibold leading-snug text-foreground">
            {opening.source.title ?? opening.title}
          </div>
        )}
      </div>

      {/* Vs competitors (one post can target many) */}
      {opening.competitors.length > 0 ? (
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs">
          <span className="text-muted-foreground">vs</span>
          {opening.competitors.slice(0, 3).map((c) => (
            <span key={c} className="inline-flex items-center gap-1">
              <Favicon name={c} kind="brand" size={14} className="rounded-sm" />
              <span className="font-medium text-foreground">{c}</span>
            </span>
          ))}
          {opening.competitors.length > 3 && (
            <span className="text-muted-foreground">
              +{opening.competitors.length - 3}
            </span>
          )}
        </div>
      ) : (
        <div className="text-xs text-muted-foreground">No competitor mentioned</div>
      )}

    </Card>
  );

  if (draftReady) {
    return (
      <Link
        to="/queue/draft/$id"
        params={{ id: opening.id }}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
      >
        {Inner}
      </Link>
    );
  }
  return <div className="block">{Inner}</div>;
}

function GapCardSkeleton() {
  return (
    <Card className="flex h-full flex-col gap-3 border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3.5 w-3.5 rounded-full" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-4 w-14 rounded-full" />
      </div>
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-4 w-3/5" />
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-11/12" />
      <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </Card>
  );
}

function DraftStatusPill({
  status,
}: {
  status: OpeningOverviewItem["draft"]["status"];
}) {
  const map: Record<
    OpeningOverviewItem["draft"]["status"],
    { label: string; cls: string; spin?: boolean; icon?: React.ReactNode }
  > = {
    ready: {
      label: "Draft ready",
      cls: "bg-primary-soft text-primary border-primary/20",
      icon: <Sparkles className="h-3 w-3" />,
    },
    drafting: {
      label: "Drafting",
      cls: "bg-muted text-foreground border-border",
      spin: true,
    },
    pending: {
      label: "Queued",
      cls: "bg-muted text-muted-foreground border-border",
    },
    missing: {
      label: "Queued",
      cls: "bg-muted text-muted-foreground border-border",
    },
    failed: {
      label: "Retry",
      cls: "bg-destructive/10 text-destructive border-destructive/20",
    },
  };
  const m = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
        m.cls,
      )}
    >
      {m.spin && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
      {m.icon}
      {m.label}
    </span>
  );
}

function BriefSkeleton() {
  return (
    <div className="space-y-1.5">
      <Skeleton className="h-2.5 w-full" />
      <Skeleton className="h-2.5 w-11/12" />
      <Skeleton className="h-2.5 w-4/5" />
    </div>
  );
}

// Keep export so accidental imports don't break — not used in new layout.
void BriefSkeleton;
