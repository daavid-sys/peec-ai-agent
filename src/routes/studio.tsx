import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Favicon } from "@/components/favicon";
import { useAppStore } from "@/lib/store";
import { CHANNELS } from "@/lib/channel";
import {
  getStudioDrafts,
  type StudioDraft,
  type StudioDraftsResponse,
} from "@/lib/server/get-studio-drafts";
import { enqueueOpeningDrafts } from "@/lib/server/enqueue-opening-drafts";
import { PlatformReplica } from "@/components/platform-replicas";

export const Route = createFileRoute("/studio")({
  head: () => ({ meta: [{ title: "Engagement Studio — Peec AI Openings" }] }),
  component: StudioPage,
});

const PREFETCH_AHEAD = 3;

function StudioPage() {
  const selectedPromptId = useAppStore((s) => s.selectedPromptId);
  const project = useAppStore((s) => s.project);
  const fallbackPromptId = "pr_05a66669-478c-4b25-94bc-9119409e5e2f";
  const promptId = selectedPromptId ?? fallbackPromptId;
  const navigate = useNavigate();

  const [response, setResponse] = useState<StudioDraftsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  // direction: 1 = forward (swipe left), -1 = backward
  const [direction, setDirection] = useState<1 | -1>(1);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const restoredRef = useRef(false);

  const enqueuingRef = useRef(false);

  const storageKey = `studio:progress:${promptId}`;

  async function load(opts: { silent?: boolean } = {}) {
    if (!opts.silent) setLoading(true);
    try {
      const res = await getStudioDrafts({
        data: { promptId, ownDomain: project?.ownBrand.domain ?? null },
      });
      setResponse(res);
    } finally {
      if (!opts.silent) setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    setResponse(null);
    setIndex(0);
    setCompleted(new Set());
    restoredRef.current = false;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promptId]);

  // Restore index + completed from localStorage once drafts are available.
  useEffect(() => {
    if (restoredRef.current) return;
    if (!response || response.drafts.length === 0) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw) as {
          currentDraftId?: string;
          completed?: string[];
        };
        if (saved.completed?.length) {
          setCompleted(new Set(saved.completed));
        }
        if (saved.currentDraftId) {
          const idx = response.drafts.findIndex(
            (d) => d.id === saved.currentDraftId,
          );
          if (idx >= 0) setIndex(idx);
        }
      }
    } catch {
      /* ignore */
    }
    restoredRef.current = true;
  }, [response, storageKey]);

  // Persist progress whenever index or completed changes.
  useEffect(() => {
    if (!restoredRef.current) return;
    const drafts = response?.drafts ?? [];
    const currentDraftId = drafts[index]?.id;
    if (!currentDraftId) return;
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          currentDraftId,
          completed: Array.from(completed),
        }),
      );
    } catch {
      /* ignore */
    }
  }, [index, completed, response, storageKey]);


  // Keep enqueuing pending drafts in the background while we're on the page,
  // so the next 3 tiles always have content waiting.
  useEffect(() => {
    if (!response || !project) return;
    if (response.pendingCount === 0) return;
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
      await load({ silent: true });
    };
    const handle = window.setTimeout(tick, 2200);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [response, project, promptId]);

  const drafts = response?.drafts ?? [];
  const total = drafts.length + (response?.pendingCount ?? 0);
  const current = drafts[index] ?? null;

  const prefetchPool = useMemo(
    () => drafts.slice(index + 1, index + 1 + PREFETCH_AHEAD),
    [drafts, index],
  );

  function next() {
    if (!drafts.length) return;
    setDirection(1);
    setIndex((i) => Math.min(i + 1, drafts.length - 1));
  }
  function prev() {
    if (!drafts.length) return;
    setDirection(-1);
    setIndex((i) => Math.max(i - 1, 0));
  }
  function markDone() {
    if (!current) return;
    const id = current.id;
    setCompleted((s) => {
      if (s.has(id)) return s;
      const n = new Set(s);
      n.add(id);
      return n;
    });
    // Auto-advance to next draft if available
    setIndex((i) => {
      if (drafts[i]?.id !== id) return i; // already moved on
      if (i >= drafts.length - 1) return i;
      setDirection(1);
      return i + 1;
    });
  }

  // Keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drafts.length]);

  function copy() {
    if (!current) return;
    navigator.clipboard.writeText(current.fullDraft);
    toast.success("Draft copied to clipboard");
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-[1500px] px-6 py-10">
        <Skeleton className="h-9 w-96" />
        <Skeleton className="mt-3 h-4 w-[640px]" />
        <Skeleton className="mt-8 h-[560px] w-full rounded-xl" />
      </div>
    );
  }

  if (!current) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <Sparkles className="mx-auto h-8 w-8 text-primary" />
        <h2 className="mt-3 text-xl font-semibold">No drafts ready yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {response?.pendingCount
            ? `Agent is still drafting ${response.pendingCount} opening${response.pendingCount === 1 ? "" : "s"}…`
            : "Pick a prompt and let the agent generate your content plan."}
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/openings">Back to action plan</Link>
          </Button>
          <Button onClick={() => void load()}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>
    );
  }

  

  return (
    <div className="mx-auto w-full max-w-[1500px] px-6 py-8 2xl:px-10">
      {/* Header */}
      <div className="flex items-center justify-between gap-6">
        <div className="min-w-0">
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Watch the agent write each draft on its real platform
          </h1>
        </div>
        <Button
          size="lg"
          className="h-14 shrink-0 px-8 text-base"
          onClick={() => navigate({ to: "/queue" })}
        >
          Next <ArrowRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Progress strip */}
      <div className="mt-6 flex items-center gap-4">
        <div className="text-xs font-medium tabular-nums text-muted-foreground">
          <span className="text-foreground">{Math.min(index + 1, drafts.length)}</span>
          <span className="text-border"> / </span>
          {total}
          <span className="ml-2 text-success">{completed.size} done</span>
          {total > drafts.length && (
            <span className="ml-1 text-muted-foreground/70">
              · {total - drafts.length} drafting
            </span>
          )}
        </div>
        <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="absolute inset-y-0 left-0 bg-primary transition-[width] duration-500"
            style={{ width: `${Math.round(((index + 1) / Math.max(total, 1)) * 100)}%` }}
          />
        </div>
        {response && response.pendingCount > 0 && (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            agent drafting {response.pendingCount}
          </span>
        )}
      </div>

      {/* Stage */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Replica stage with swipe animation */}
        <div className="relative">
          <div className="relative min-h-[600px] overflow-hidden rounded-xl border border-border bg-secondary/30 p-4">
            <AnimatePresence mode="wait" custom={direction} initial={false}>
              <motion.div
                key={current.id}
                custom={direction}
                initial={{ x: direction === 1 ? "60%" : "-60%", opacity: 0, scale: 0.97 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                exit={{ x: direction === 1 ? "-60%" : "60%", opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.32, ease: [0.32, 0.72, 0.24, 1] }}
                className="w-full"
              >
                <PlatformReplica
                  draft={current}
                  cps={260}
                  onDone={markDone}
                  ownBrand={{
                    name: project?.ownBrand.name ?? "Attio",
                    domain: project?.ownBrand.domain ?? "attio.com",
                  }}
                />
              </motion.div>
            </AnimatePresence>

            {/* Side nav buttons */}
            <button
              onClick={prev}
              disabled={index === 0}
              className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/90 text-foreground shadow-sm backdrop-blur transition disabled:opacity-30 hover:bg-background"
              aria-label="Previous draft"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              disabled={index >= drafts.length - 1}
              className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/90 text-foreground shadow-sm backdrop-blur transition disabled:opacity-30 hover:bg-background"
              aria-label="Next draft"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Thumbnail rail with prefetch indicator */}
          <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
            {drafts.map((d, i) => {
              const isCurrent = i === index;
              const isCompleted = completed.has(d.id);
              const isPrefetch = i > index && i <= index + PREFETCH_AHEAD;
              return (
                <button
                  key={d.id}
                  onClick={() => {
                    setDirection(i > index ? 1 : -1);
                    setIndex(i);
                  }}
                  className={`group flex flex-shrink-0 items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] transition ${
                    isCurrent
                      ? "border-primary bg-primary-soft text-foreground"
                      : isCompleted
                        ? "border-success/40 bg-success/5 text-foreground"
                        : isPrefetch
                          ? "border-primary/30 bg-card text-muted-foreground"
                          : "border-border bg-card text-muted-foreground"
                  }`}
                  title={d.title}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: d.channelAccent }}
                  />
                  <span className="max-w-[140px] truncate">
                    {d.channelLabel} · {d.source.domain ?? "draft"}
                  </span>
                  {isCompleted && <Check className="h-3 w-3 text-success" />}
                  {isPrefetch && !isCurrent && (
                    <span className="ml-0.5 rounded bg-primary/10 px-1 text-[9px] font-semibold uppercase text-primary">
                      ready
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Side panel */}
        <SideContext draft={current} prefetch={prefetchPool} onCopy={copy} />
      </div>
    </div>
  );
}

function SideContext({
  draft,
  prefetch,
  onCopy,
}: {
  draft: StudioDraft;
  prefetch: StudioDraft[];
  onCopy: () => void;
}) {
  const meta = CHANNELS[draft.channel];
  return (
    <div className="space-y-4">
      <Card className="border-border p-4">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: meta.accent }}
          />
          <div className="text-sm font-medium text-foreground">{meta.label}</div>
          <Badge variant="outline" className="ml-auto font-mono tabular-nums">
            impact {draft.impactScore}
          </Badge>
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          {meta.description}
        </div>
        <div className="mt-3 text-sm font-medium leading-snug">{draft.title}</div>
        {draft.competitors.length > 0 && (
          <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
            <span>
              Targeting competitor{draft.competitors.length === 1 ? "" : "s"}:
            </span>
            {draft.competitors.slice(0, 4).map((c) => (
              <span key={c} className="inline-flex items-center gap-1">
                <Favicon
                  name={c}
                  kind="brand"
                  size={12}
                  className="rounded-sm"
                />
                <span className="font-mono">{c}</span>
              </span>
            ))}
            {draft.competitors.length > 4 && (
              <span>+{draft.competitors.length - 4}</span>
            )}
          </div>
        )}
      </Card>

      <Card className="border-border p-4">
        <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary" /> Brief
        </div>
        <p className="mt-1.5 text-sm">{draft.brief}</p>
      </Card>

      {draft.source.url && (
        <Card className="border-border p-4">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Cited source
          </div>
          <a
            href={draft.source.url}
            target="_blank"
            rel="noreferrer"
            className="mt-1 block text-sm font-medium hover:text-primary"
          >
            {draft.source.title ?? draft.source.url}
          </a>
          {draft.source.excerpt && (
            <p className="mt-2 text-xs italic text-muted-foreground">
              &ldquo;{draft.source.excerpt}&rdquo;
            </p>
          )}
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={onCopy} className="flex-1">
          <Copy className="h-4 w-4" /> Copy draft
        </Button>
      </div>

      <div className="rounded-md border border-primary/30 bg-primary-soft/40 p-3">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">
          Up next
        </div>
        {prefetch.length === 0 ? (
          <div className="mt-2 text-xs text-muted-foreground">
            Last draft in the batch — agent is preparing more in the background.
          </div>
        ) : (
          <ol className="mt-2 space-y-2">
            {prefetch.slice(0, 3).map((d, i) => (
              <li key={d.id} className="flex items-center gap-2 text-[12px]">
                <span className="inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-card text-[9px] font-bold text-muted-foreground">
                  {i + 1}
                </span>
                <Favicon
                  name={d.source.domain ?? d.channelLabel}
                  kind="brand"
                  size={14}
                  className="flex-shrink-0 rounded-sm"
                />
                <span className="text-[11px] font-medium text-muted-foreground">
                  {d.channelLabel}
                </span>
                <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                  {d.title}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
