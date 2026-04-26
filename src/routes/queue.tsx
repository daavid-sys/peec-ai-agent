import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Globe,
  Loader2,
  Mail,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Favicon } from "@/components/favicon";
import { useAppStore } from "@/lib/store";
import {
  getStudioDrafts,
  type StudioDraft,
  type StudioDraftsResponse,
} from "@/lib/server/get-studio-drafts";
import { classifyTask, getTaskTitle, type TaskType } from "@/lib/task-type";
import { EmailPitchCard } from "@/components/task-cards/email-pitch-card";
import { CmsPublishCard } from "@/components/task-cards/cms-publish-card";
import { PlatformPostCard } from "@/components/task-cards/platform-post-card";

export const Route = createFileRoute("/queue")({
  head: () => ({ meta: [{ title: "Review & publish — Peec AI Openings" }] }),
  component: QueuePage,
});

const TASK_META: Record<
  TaskType,
  { label: string; icon: typeof Mail; tone: string }
> = {
  email_pitch: { label: "Email pitch", icon: Mail, tone: "var(--warning, #d97706)" },
  cms_publish: { label: "Owned blog", icon: Globe, tone: "var(--primary)" },
  platform_post: { label: "Platform post", icon: Sparkles, tone: "var(--success)" },
};

function QueuePage() {
  const selectedPromptId = useAppStore((s) => s.selectedPromptId);
  const project = useAppStore((s) => s.project);
  const fallbackPromptId = "pr_05a66669-478c-4b25-94bc-9119409e5e2f";
  const promptId = selectedPromptId ?? fallbackPromptId;
  const navigate = useNavigate();

  const ownBrand = useMemo(
    () => ({
      name: project?.ownBrand.name ?? "Attio",
      domain: project?.ownBrand.domain ?? "attio.com",
    }),
    [project],
  );

  const [response, setResponse] = useState<StudioDraftsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const restoredRef = useRef(false);

  const storageKey = `queue:progress:${promptId}`;

  async function load() {
    setLoading(true);
    try {
      const res = await getStudioDrafts({
        data: { promptId, ownDomain: ownBrand.domain },
      });
      setResponse(res);
    } finally {
      setLoading(false);
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

  // Restore progress from localStorage
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
        if (saved.completed?.length) setCompleted(new Set(saved.completed));
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

  // Persist
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

  const drafts = response?.drafts ?? [];
  const total = drafts.length;
  const current = drafts[index] ?? null;

  // Pre-classify everything once
  const classified = useMemo(
    () =>
      drafts.map((d) => ({
        draft: d,
        type: classifyTask(d, ownBrand.domain),
      })),
    [drafts, ownBrand.domain],
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
    setIndex((i) => {
      if (drafts[i]?.id !== id) return i;
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

  if (loading) {
    return (
      <div className="mx-auto max-w-[1500px] px-6 py-10">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="mt-8 h-[560px] w-full rounded-xl" />
      </div>
    );
  }

  if (!current) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <Sparkles className="mx-auto h-8 w-8 text-primary" />
        <h2 className="mt-3 text-xl font-semibold">Nothing to review yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {response?.pendingCount
            ? `Agent is still drafting ${response.pendingCount} opening${response.pendingCount === 1 ? "" : "s"}…`
            : "Generate drafts in the studio to populate your task queue."}
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/studio">Back to studio</Link>
          </Button>
          <Button onClick={() => void load()}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>
    );
  }

  const currentEntry = classified[index];
  const currentType = currentEntry.type;
  const dynamicTitle = getTaskTitle(current, currentType, ownBrand.domain);
  const TypeIcon = TASK_META[currentType].icon;

  const isLast = index >= drafts.length - 1;
  const allDone = total > 0 && completed.size >= total;
  const showResults = allDone || (isLast && completed.has(current.id));
  const primaryLabel = showResults ? "See results" : "Next task";

  function handlePrimary() {
    if (showResults) {
      navigate({ to: "/results" });
      return;
    }
    // Mark current as done (if not already), then advance.
    if (!completed.has(current!.id)) {
      setCompleted((s) => {
        const n = new Set(s);
        n.add(current!.id);
        return n;
      });
    }
    if (!isLast) {
      setDirection(1);
      setIndex((i) => Math.min(i + 1, drafts.length - 1));
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] px-6 py-8 2xl:px-10">
      {/* Top nav */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/studio"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to Agent Working
        </Link>
        <Button size="lg" onClick={handlePrimary}>
          {primaryLabel} <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Header */}
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">
        Step 3: Review and publish
      </h1>

      {/* Progress strip */}
      <div className="mt-6 flex items-center gap-4">
        <div className="text-xs font-medium tabular-nums text-muted-foreground">
          <span className="text-foreground">{Math.min(index + 1, total)}</span>
          <span className="text-border"> / </span>
          {total}
          
          {response && response.pendingCount > 0 && (
            <span className="ml-2 inline-flex items-center gap-1 text-muted-foreground/70">
              <Loader2 className="h-3 w-3 animate-spin" />
              {response.pendingCount} drafting
            </span>
          )}
        </div>
        <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="absolute inset-y-0 left-0 bg-primary transition-[width] duration-500"
            style={{ width: `${Math.round(((index + 1) / Math.max(total, 1)) * 100)}%` }}
          />
        </div>
      </div>

      {/* Task rail — quick navigation to any task */}
      <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-2">
        {classified.map(({ draft: d, type }, i) => {
          const isCurrent = i === index;
          const isCompleted = completed.has(d.id);
          const Icon = TASK_META[type].icon;
          const tone = TASK_META[type].tone;
          const showFavicon = type === "platform_post" && d.source.domain;
          return (
            <button
              key={d.id}
              onClick={() => {
                setDirection(i > index ? 1 : -1);
                setIndex(i);
              }}
              className={`group relative flex flex-shrink-0 items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition ${
                isCurrent
                  ? "border-primary bg-primary-soft text-foreground shadow-sm ring-1 ring-primary/20"
                  : isCompleted
                    ? "border-success/40 bg-success/5 text-foreground hover:border-success/60 hover:bg-success/10"
                    : "border-border bg-card text-foreground hover:border-foreground/30 hover:bg-muted/40"
              }`}
              title={getTaskTitle(d, type, ownBrand.domain)}
            >
              <span
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full"
                style={{
                  backgroundColor: `color-mix(in oklab, ${tone} 15%, transparent)`,
                  color: tone,
                }}
              >
                {showFavicon ? (
                  <Favicon name={d.source.domain!} kind="brand" size={16} className="rounded-sm" />
                ) : (
                  <Icon className="h-3.5 w-3.5" />
                )}
              </span>
              <div className="flex min-w-0 flex-col items-start leading-tight">
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {TASK_META[type].label}
                </span>
                <span className="max-w-[160px] truncate text-[12px] font-medium">
                  {d.source.domain ?? d.channelLabel}
                </span>
              </div>
              {isCompleted && (
                <Check className="h-4 w-4 shrink-0 text-success" />
              )}
            </button>
          );
        })}
      </div>

      {/* Stage */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Task card */}
        <div className="relative">
          <div className="relative min-h-[600px] overflow-hidden rounded-xl border border-border bg-secondary/30 p-4 sm:p-6">
            <AnimatePresence mode="wait" custom={direction} initial={false}>
              <motion.div
                key={current.id}
                custom={direction}
                initial={{ x: direction === 1 ? "60%" : "-60%", opacity: 0, scale: 0.97 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                exit={{ x: direction === 1 ? "-60%" : "60%", opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.32, ease: [0.32, 0.72, 0.24, 1] }}
                className="w-full space-y-4"
              >
                {/* Dynamic task title */}
                <div className="flex items-center gap-3">
                  <span
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full"
                    style={{
                      backgroundColor: `color-mix(in oklab, ${TASK_META[currentType].tone} 15%, transparent)`,
                      color: TASK_META[currentType].tone,
                    }}
                  >
                    {currentType === "platform_post" && current.source.domain ? (
                      <Favicon name={current.source.domain} kind="brand" size={18} className="rounded-sm" />
                    ) : (
                      <TypeIcon className="h-4 w-4" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-semibold leading-tight tracking-tight text-foreground sm:text-xl">
                      {dynamicTitle}
                    </h2>
                  </div>
                </div>

                {/* Action card */}
                {currentType === "email_pitch" && (
                  <EmailPitchCard draft={current} ownBrand={ownBrand} onDone={markDone} />
                )}
                {currentType === "cms_publish" && (
                  <CmsPublishCard draft={current} ownBrand={ownBrand} onDone={markDone} />
                )}
                {currentType === "platform_post" && (
                  <PlatformPostCard
                    draft={current}
                    ownBrand={ownBrand}
                    onDone={markDone}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Side nav */}
            <button
              onClick={prev}
              disabled={index === 0}
              className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/90 text-foreground shadow-sm backdrop-blur transition disabled:opacity-30 hover:bg-background"
              aria-label="Previous task"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              disabled={index >= drafts.length - 1}
              className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/90 text-foreground shadow-sm backdrop-blur transition disabled:opacity-30 hover:bg-background"
              aria-label="Next task"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Side panel */}
        <SidePanel draft={current} type={currentType} ownDomain={ownBrand.domain} />
      </div>
    </div>
  );
}

function SidePanel({
  draft,
  type,
  ownDomain,
}: {
  draft: StudioDraft;
  type: TaskType;
  ownDomain: string;
}) {
  return (
    <div className="space-y-3">
      <Card className="border-border p-4">
        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Why this task
        </div>
        <p className="mt-1.5 text-sm">{draft.brief}</p>
      </Card>

      {draft.competitors.length > 0 && (
        <Card className="border-border p-4">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Targeting
          </div>
          <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1.5 text-xs">
            {draft.competitors.slice(0, 6).map((c) => (
              <span key={c} className="inline-flex items-center gap-1">
                <Favicon name={c} kind="brand" size={12} className="rounded-sm" />
                <span className="font-mono text-foreground">{c}</span>
              </span>
            ))}
          </div>
        </Card>
      )}

      {draft.source.url && (
        <Card className="border-border p-4">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {type === "cms_publish" ? "Target page" : "Cited source"}
          </div>
          <a
            href={draft.source.url}
            target="_blank"
            rel="noreferrer"
            className="mt-1 flex items-start gap-1 text-sm font-medium hover:text-primary"
          >
            <span className="line-clamp-2">
              {draft.source.title ?? draft.source.url}
            </span>
            <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 opacity-60" />
          </a>
          {draft.source.excerpt && (
            <p className="mt-2 text-xs italic text-muted-foreground line-clamp-3">
              &ldquo;{draft.source.excerpt}&rdquo;
            </p>
          )}
        </Card>
      )}

      <Card className="border-border p-4 text-[11px] text-muted-foreground">
        <span className="font-medium text-foreground">Tip:</span> use{" "}
        <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">
          ←
        </kbd>{" "}
        <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">
          →
        </kbd>{" "}
        to swipe through tasks. Your own domain for this run is{" "}
        <span className="font-mono text-foreground">{ownDomain}</span>.
      </Card>
    </div>
  );
}
