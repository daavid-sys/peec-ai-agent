import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Sparkles,
  TrendingDown,
  Target,
  Users,
  FileSearch,
  Zap,
  Trophy,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScoreBar } from "@/components/score-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { Favicon } from "@/components/favicon";
import { InfoPopover } from "@/components/info-popover";
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
  type ReasonCardPayload,
} from "@/lib/server/get-prompt-recommendation";
import { enqueueOpeningDrafts } from "@/lib/server/enqueue-opening-drafts";

export const Route = createFileRoute("/prompts")({
  head: () => ({ meta: [{ title: "Recommended Prompt — Peec AI Openings" }] }),
  component: PromptsPage,
});

type ReasonTone = "primary" | "destructive" | "neutral" | "success";

const TONE_STYLES: Record<
  ReasonTone,
  { iconBg: string; iconColor: string; ring: string }
> = {
  primary: {
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    ring: "ring-primary/20",
  },
  destructive: {
    iconBg: "",
    iconColor: "",
    ring: "",
  },
  neutral: {
    iconBg: "bg-muted",
    iconColor: "text-muted-foreground",
    ring: "ring-border",
  },
  success: {
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    ring: "ring-emerald-500/20",
  },
};

function categoryToVisual(
  category: ReasonCardPayload["category"],
  index: number,
): { icon: LucideIcon; tone: ReasonTone } {
  switch (category) {
    case "platform":
      return { icon: Target, tone: "primary" };
    case "competitor":
      return { icon: TrendingDown, tone: "destructive" };
    case "content":
      return { icon: FileSearch, tone: "neutral" };
    case "speed":
      return { icon: Zap, tone: "success" };
    case "win":
      return { icon: Trophy, tone: "primary" };
    case "gap":
      return { icon: TrendingDown, tone: "destructive" };
    default: {
      const fallback: { icon: LucideIcon; tone: ReasonTone }[] = [
        { icon: Lightbulb, tone: "primary" },
        { icon: Users, tone: "neutral" },
        { icon: Zap, tone: "success" },
        { icon: Trophy, tone: "primary" },
      ];
      return fallback[index % fallback.length];
    }
  }
}

function ReasonCardItem({
  card,
  index,
}: {
  card: ReasonCardPayload;
  index: number;
}) {
  const { icon: Icon, tone } = categoryToVisual(card.category, index);
  const isDestructive = tone === "destructive";
  const toneStyle = TONE_STYLES[tone];

  // Dedupe domains
  const competitorDomains = Array.from(
    new Set((card.competitorDomains ?? []).filter(Boolean)),
  ).slice(0, 4);

  const cardInner = (
    <div className="group flex h-full flex-col items-stretch justify-center gap-2 rounded-lg border border-border bg-background p-3 transition-colors hover:border-foreground/20 hover:bg-card">
      <div className="flex items-center gap-2 text-left">
        <div
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md ring-1",
            !isDestructive && toneStyle.iconBg,
            !isDestructive && toneStyle.ring,
          )}
          style={
            isDestructive
              ? {
                  background:
                    "color-mix(in oklab, var(--destructive) 12%, transparent)",
                  boxShadow:
                    "inset 0 0 0 1px color-mix(in oklab, var(--destructive) 25%, transparent)",
                }
              : undefined
          }
        >
          {card.platformDomain ? (
            <Favicon name={card.platformDomain} size={16} />
          ) : (
            <Icon
              className={cn("h-3.5 w-3.5", !isDestructive && toneStyle.iconColor)}
              style={isDestructive ? { color: "var(--destructive)" } : undefined}
            />
          )}
        </div>
        <div className="min-w-0 text-[13px] font-semibold leading-snug text-foreground">
          {card.headline}
        </div>
      </div>

      {competitorDomains.length > 0 && (
        <div className="flex items-center justify-center gap-1">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
            vs
          </span>
          <div className="flex -space-x-1">
            {competitorDomains.map((d) => (
              <div
                key={d}
                className="flex h-4 w-4 items-center justify-center overflow-hidden rounded-sm bg-background ring-1 ring-border"
                title={d}
              >
                <Favicon name={d} size={12} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (!card.body) return cardInner;

  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="h-full">{cardInner}</div>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          align="start"
          className="max-w-xs text-[12px] leading-relaxed"
        >
          <div
            className={cn(
              "[&_p]:m-0 [&_p+p]:mt-1 [&_strong]:font-semibold",
              "[&_a]:underline [&_a]:underline-offset-2",
            )}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{card.body}</ReactMarkdown>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function PromptsPage() {
  const prompts = useAppStore((s) => s.prompts);
  const project = useAppStore((s) => s.project);
  const selectedId = useAppStore((s) => s.selectedPromptId);
  const navigate = useNavigate();
  const leftColumnRef = useRef<HTMLDivElement>(null);

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
    // Eagerly start drafting content for every opening on this prompt so by the
    // time the user clicks through to the studio, drafts are ready (or close to it).
    // Server fn drafts a batch per call; loop a few times in the background to
    // exhaust pending openings without blocking the UI.
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

  const selectedStats = recommendation?.prompt;
  const ownBrandMetric = brandMetrics?.find(
    (metric) => metric.is_own || metric.brand_name === project.ownBrand.name,
  );
  const topCompetitorMetric = brandMetrics
    ?.filter(
      (metric) => !metric.is_own && metric.brand_name !== project.ownBrand.name,
    )
    .slice()
    .sort((a, b) => b.visibility - a.visibility)[0];
  const cardMetrics = {
    ownVisibility:
      selectedStats?.ownVisibility ??
      (ownBrandMetric ? Math.round(ownBrandMetric.visibility * 100) : null),
    topCompetitor:
      selectedStats?.topCompetitor ?? topCompetitorMetric?.brand_name ?? null,
    topCompetitorVisibility:
      selectedStats?.topCompetitorVisibility ??
      (topCompetitorMetric
        ? Math.round(topCompetitorMetric.visibility * 100)
        : null),
    visibilityGap: selectedStats?.visibilityGap ?? null,
    opportunityScore: selectedStats?.opportunityScore ?? null,
  };
  const cardCounts = recommendation?.counts ?? null;
  const cardReasons = recommendation?.reasons ?? [];
  const previewOpenings = recommendation?.openingPreviews ?? [];
  const formatMetric = (value: number | null, suffix = "%") =>
    recommendationLoading ? "…" : value === null ? "—" : `${value}${suffix}`;


  const startFlow = () => {
    store.selectPrompt(selected.id);
    navigate({ to: "/openings" });
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] px-6 py-10 2xl:px-10">
      {selected.id !== recommended.id && (
        <div className="mb-2">
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            custom selection
          </span>
        </div>
      )}
      <h1 className="text-3xl font-semibold tracking-tight">
        Let's increase your visibility
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        We use all the sources and query fanout&rsquo;s on a per-prompt basis to
        identify and fill all the content gaps for your brand.
      </p>

      {/* Hero recommended-prompt card */}
      <Card className="mt-8 overflow-hidden border-border p-0">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div ref={leftColumnRef} className="flex flex-col border-b border-border p-7 lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-2 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Recommended prompt
            </div>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="group mt-3 -mx-2 flex items-center justify-between gap-3 rounded-md px-2 py-1 text-2xl font-semibold tracking-tight text-foreground transition-colors hover:bg-muted/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="min-w-0 underline-offset-4 group-hover:underline decoration-primary/40">
                &ldquo;{selected.text}&rdquo;
              </span>
              <ArrowUpRight className="h-5 w-5 shrink-0 self-center text-muted-foreground transition-all group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>

            <div className="mt-6 grid grid-cols-3 gap-3 text-xs">
              <Mini
                label="Sources found"
                value={cardCounts?.sources ?? "—"}
                loading={recommendationLoading}
                favicons={recommendation?.topSourceDomains}
              />
              <Mini label="Query fanouts" value={cardCounts?.qfos ?? "—"} loading={recommendationLoading} />
              <Mini label="Openings found" value={cardCounts?.openings ?? "—"} loading={recommendationLoading} />
            </div>

            <div className="flex flex-1 flex-col py-6">
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Why this prompt
              </div>
              {recommendationLoading ? (
                <div className="mt-3 grid flex-1 grid-cols-2 gap-2.5 auto-rows-fr">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex h-full flex-col rounded-lg border border-border bg-background p-3"
                    >
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-7 w-7 shrink-0 rounded-md" />
                        <Skeleton className="h-3.5 w-3/4" />
                      </div>
                      <Skeleton className="mt-2 h-2.5 w-full" />
                      <Skeleton className="mt-1.5 h-2.5 w-5/6" />
                    </div>
                  ))}
                </div>
              ) : cardReasons.length > 0 ? (
                <div
                  className={cn(
                    "mt-3 grid flex-1 gap-2.5 auto-rows-fr",
                    cardReasons.length <= 2 ? "grid-cols-2" : "grid-cols-2",
                  )}
                >
                  {cardReasons.map((r, i) => (
                    <ReasonCardItem
                      key={`${r.headline}-${i}`}
                      card={r}
                      index={i}
                    />
                  ))}
                </div>
              ) : null}
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
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
              <QfosTable qfos={qfos} loading={qfosLoading} maxRows={6} />
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
              {recommendationLoading
                ? "Loading openings…"
                : `The first ${previewOpenings.length} of ${cardCounts?.openings ?? "—"} openings already drafted by the agent.`}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={startFlow}>
            See all openings <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {recommendationLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <OpeningPreviewSkeleton key={i} />
              ))
            : previewOpenings.map((o) => (
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
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </div>
    </div>
  );
}

function OpeningPreviewSkeleton() {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-3 rounded" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="mt-2 h-4 w-4/5" />
      <Skeleton className="mt-1.5 h-4 w-3/5" />
      <Skeleton className="mt-3 h-2.5 w-14" />
      <Skeleton className="mt-2 h-4 w-2/3" />
      <div className="mt-3 flex items-center justify-between">
        <Skeleton className="h-3 w-10" />
        <Skeleton className="h-3 w-12" />
      </div>
      <Skeleton className="mt-1 h-1.5 w-full rounded-full" />
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
  loading,
}: {
  label: string;
  value: string;
  tone?: "destructive" | "primary";
  icon?: React.ComponentType<{ className?: string }>;
  loading?: boolean;
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
      {loading ? (
        <Skeleton className="mt-2 h-7 w-20" />
      ) : (
        <div
          className={cn(
            "mt-1 flex items-center gap-1 text-2xl font-semibold tabular-nums",
            color,
          )}
        >
          {Icon && <Icon className="h-4 w-4" />}
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
}: {
  label: string;
  value: number | string;
  loading?: boolean;
  favicons?: string[];
}) {
  return (
    <div className="rounded-md border border-border bg-background px-3 py-2">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      {loading ? (
        <Skeleton className="mt-1 h-5 w-10" />
      ) : (
        <div className="mt-1 flex items-center justify-between gap-2">
          <div className="font-mono text-base font-medium leading-none">{value}</div>
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
        </div>
      )}
    </div>
  );
}

function renderInlineMarkdown(text: string): React.ReactNode {
  // Tokenize **bold** and *italic* (and _italic_)
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|_([^_]+)_)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[2] !== undefined) {
      parts.push(<strong key={key++} className="font-semibold">{match[2]}</strong>);
    } else if (match[3] !== undefined) {
      parts.push(<em key={key++}>{match[3]}</em>);
    } else if (match[4] !== undefined) {
      parts.push(<em key={key++}>{match[4]}</em>);
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
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
        <InfoPopover ariaLabel="About the top brands table">
          <p className="font-semibold text-foreground">Top brands for this prompt</p>
          <p className="mt-1.5 text-muted-foreground">
            How brands stack up in real AI engine answers to this prompt,
            aggregated across the engines we monitor.
          </p>
          <ul className="mt-2 space-y-1.5 text-muted-foreground">
            <li>
              <strong className="text-foreground">Visibility</strong> — how
              often the brand appears in answers (higher = more mindshare with
              the AI).
            </li>
            <li>
              <strong className="text-foreground">SOV</strong> (Share of Voice)
              — of all brand mentions in answers, what percent belong to this
              brand.
            </li>
            <li>
              <strong className="text-foreground">Sentiment</strong> — average
              tone (0–100) of how the brand is described.
            </li>
            <li>
              <strong className="text-foreground">Position</strong> — average
              rank when the brand is mentioned (lower is better).
            </li>
          </ul>
          <p className="mt-2 text-muted-foreground">
            For full breakdowns by engine and over time, see your{" "}
            <strong className="text-foreground">Overview</strong> or{" "}
            <strong className="text-foreground">Prompts</strong> page.
          </p>
        </InfoPopover>
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
