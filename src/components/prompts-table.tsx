import { Search as SearchIcon, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Favicon } from "@/components/favicon";
import { cn } from "@/lib/utils";
import type { PromptTableRow } from "@/lib/server/get-prompt-table";
import { useMemo, useState } from "react";

function VolumeBars({ volume }: { volume: string | null }) {
  const map: Record<string, number> = {
    "very low": 1,
    low: 2,
    medium: 3,
    high: 4,
    "very high": 5,
  };
  const level = map[(volume ?? "").toLowerCase()] ?? 0;
  return (
    <div className="flex h-4 items-end gap-[2px]" title={volume ?? "unknown volume"}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={cn(
            "w-[3px] rounded-[1px]",
            n <= level ? "bg-foreground" : "bg-muted",
          )}
          style={{ height: `${4 + n * 2}px` }}
        />
      ))}
    </div>
  );
}

function classifyTags(text: string): string[] {
  const t = text.toLowerCase();
  const tags: string[] = [];
  // branded vs non-branded (Attio-aware)
  tags.push(/\battio\b/.test(t) ? "branded" : "non-branded");
  // intent
  if (/\bvs\b|compare|alternative|best |top |which/.test(t)) tags.push("transactional");
  else if (/how|what|why|features|guide/.test(t)) tags.push("informational");
  else tags.push("informational");
  return tags;
}

const TAG_STYLES: Record<string, string> = {
  branded:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900",
  "non-branded":
    "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-900",
  transactional:
    "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-900",
  informational:
    "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-900",
};

function SentimentDot({ value }: { value: number | null }) {
  if (value === null) return <span className="text-muted-foreground">—</span>;
  let color = "bg-success";
  if (value < 50) color = "bg-destructive";
  else if (value < 70) color = "bg-warning";
  return (
    <span className="inline-flex items-center gap-1.5 tabular-nums">
      <span className={cn("h-1.5 w-1.5 rounded-full", color)} />
      {value}
    </span>
  );
}

export function PromptsTable({
  rows,
  loading,
  selectedId,
  onSelect,
}: {
  rows: PromptTableRow[] | null;
  loading: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    if (!rows) return [];
    if (!query) return rows;
    return rows.filter((r) =>
      r.text.toLowerCase().includes(query.toLowerCase()),
    );
  }, [rows, query]);

  // Aggregates
  const agg = useMemo(() => {
    if (!rows || rows.length === 0)
      return { visibility: 0, sentiment: 0, position: 0 };
    const vis =
      rows.reduce((s, r) => s + (r.visibility ?? 0), 0) / rows.length;
    const sentRows = rows.filter((r) => r.sentiment !== null);
    const sent =
      sentRows.length === 0
        ? 0
        : sentRows.reduce((s, r) => s + (r.sentiment ?? 0), 0) /
          sentRows.length;
    const posRows = rows.filter((r) => r.position !== null);
    const pos =
      posRows.length === 0
        ? 0
        : posRows.reduce((s, r) => s + (r.position ?? 0), 0) / posRows.length;
    return {
      visibility: Math.round(vis),
      sentiment: Math.round(sent),
      position: Math.round(pos * 10) / 10,
    };
  }, [rows]);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background">
      {/* Header strip with search + aggregates */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-secondary/30 px-3 py-2.5">
        <div className="relative w-72">
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="h-8 pl-8 text-[13px]"
          />
        </div>
        <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
          <span>
            Visibility{" "}
            <span className="font-semibold text-foreground tabular-nums">
              {agg.visibility}%
            </span>
          </span>
          <span className="text-border">|</span>
          <span className="inline-flex items-center gap-1.5">
            Sentiment{" "}
            <span className="inline-flex items-center gap-1 font-semibold text-foreground tabular-nums">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              {agg.sentiment}
            </span>
          </span>
          <span className="text-border">|</span>
          <span>
            Position{" "}
            <span className="font-semibold text-foreground tabular-nums">
              # {agg.position.toFixed(1)}
            </span>
          </span>
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[24px_minmax(0,1fr)_70px_70px_70px_120px_70px_140px_70px_60px] items-center gap-3 border-b border-border bg-background px-3 py-2 text-[11px] font-medium text-muted-foreground">
        <div />
        <div>Prompt</div>
        <div>Visibility</div>
        <div>Sentiment</div>
        <div>Position</div>
        <div>Mentions</div>
        <div>Volume</div>
        <div>Tags</div>
        <div>Location</div>
        <div className="text-right">SOV</div>
      </div>

      {loading ? (
        <ul>
          {Array.from({ length: 8 }).map((_, i) => (
            <li
              key={i}
              className="grid grid-cols-[24px_minmax(0,1fr)_70px_70px_70px_120px_70px_140px_70px_60px] items-center gap-3 border-b border-border px-3 py-3"
            >
              <Skeleton className="h-3.5 w-3.5 rounded" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-10" />
              <Skeleton className="ml-auto h-3 w-8" />
            </li>
          ))}
        </ul>
      ) : filtered.length === 0 ? (
        <div className="px-4 py-10 text-center text-sm text-muted-foreground">
          No prompts match &ldquo;{query}&rdquo;.
        </div>
      ) : (
        <ul>
          {filtered.map((p) => {
            const tags = classifyTags(p.text);
            const isActive = p.id === selectedId;
            return (
              <li
                key={p.id}
                className={cn(
                  "group grid cursor-pointer grid-cols-[24px_minmax(0,1fr)_70px_70px_70px_120px_70px_140px_70px_60px] items-center gap-3 border-b border-border px-3 py-3 text-[13px] transition-colors hover:bg-muted/40",
                  isActive && "bg-primary-soft/40",
                )}
                onClick={() => onSelect(p.id)}
              >
                <div
                  className={cn(
                    "flex h-3.5 w-3.5 items-center justify-center rounded border",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/40",
                  )}
                  aria-hidden
                >
                  {isActive && <Check className="h-2.5 w-2.5" />}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-foreground" title={p.text}>
                    {p.text}
                  </div>
                </div>
                <div className="tabular-nums text-foreground">
                  {p.visibility}%
                </div>
                <div className="text-foreground">
                  <SentimentDot value={p.sentiment} />
                </div>
                <div className="tabular-nums text-foreground">
                  {p.position === null ? (
                    <span className="text-muted-foreground">—</span>
                  ) : (
                    <>#&nbsp;{p.position.toFixed(1)}</>
                  )}
                </div>
                <div className="flex items-center -space-x-1.5 text-muted-foreground">
                  {p.mentioned_competitors.length === 0 ? (
                    <span className="text-[11px] text-muted-foreground/70">
                      —
                    </span>
                  ) : (
                    <>
                      {p.mentioned_competitors.slice(0, 4).map((c) => (
                        <span
                          key={c.name}
                          className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-border bg-background ring-1 ring-background"
                          title={`${c.name} · ${c.mention_count} mention${c.mention_count === 1 ? "" : "s"}`}
                        >
                          <Favicon name={c.name} kind="brand" size={14} className="rounded-full" />
                        </span>
                      ))}
                      {p.mentioned_competitors.length > 4 && (
                        <span
                          className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full border border-border bg-background px-1 text-[10px] font-medium text-muted-foreground ring-1 ring-background"
                          title={p.mentioned_competitors
                            .slice(4)
                            .map((c) => c.name)
                            .join(", ")}
                        >
                          +{p.mentioned_competitors.length - 4}
                        </span>
                      )}
                    </>
                  )}
                </div>
                <div>
                  <VolumeBars volume={p.volume} />
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  {tags.map((t) => (
                    <Badge
                      key={t}
                      variant="outline"
                      className={cn(
                        "h-5 rounded-md px-1.5 text-[10px] font-normal",
                        TAG_STYLES[t],
                      )}
                    >
                      {t}
                    </Badge>
                  ))}
                </div>
                <div className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <span aria-hidden>🇺🇸</span>
                  <span>US</span>
                </div>
                <div className="text-right tabular-nums text-foreground">
                  {p.share_of_voice}%
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex items-center justify-between px-3 py-2 text-[12px] text-muted-foreground">
        <span>{filtered.length} Prompts</span>
      </div>
    </div>
  );
}
