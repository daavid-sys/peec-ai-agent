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
import { ScoreBar } from "@/components/score-bar";
import { Favicon } from "@/components/favicon";
import { useAppStore } from "@/lib/store";
import {
  getStudioDrafts,
  type StudioDraft,
  type StudioDraftsResponse,
} from "@/lib/server/get-studio-drafts";
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
  const prompts = useAppStore((s) => s.prompts);
  const promptId = selectedPromptId ?? "pr_05a66669-478c-4b25-94bc-9119409e5e2f";
  const selectedPrompt = prompts.find((p) => p.id === promptId);
  const ownBrand = useMemo(
    () => ({
      name: project?.ownBrand.name ?? "Attio",
      domain: project?.ownBrand.domain ?? "attio.com",
    }),
    [project],
  );

  const [response, setResponse] = useState<StudioDraftsResponse | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

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
  }, [promptId]);

  useEffect(() => {
    let cancelled = false;
    void getStudioDrafts({ data: { promptId, ownDomain: ownBrand.domain } }).then(
      (res) => {
        if (!cancelled) setResponse(res);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [promptId, ownBrand.domain]);

  const drafts = response?.drafts ?? [];
  const completedDrafts = drafts.filter((d) => completedIds.has(d.id));

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">
        Track visibility after execution
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Once actions are marked as published, we loop the new mention data back
        from Peec AI to measure lift across ChatGPT, Perplexity, Gemini, and
        Claude.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <BigStat label="Before visibility" value="8%" sub="for 'HubSpot alternatives for startups'" />
        <BigStat
          label="Projected after 14 days"
          value="22%"
          sub="based on opening impact scores"
          accent
        />
        <BigStat
          label="Visibility lift"
          value="+14pp"
          sub="across 6 query fanouts"
          tone="success"
          icon={ArrowUpRight}
        />
      </div>

      {/* Collapsible completed tasks */}
      <CollapsibleSection
        title="Completed tasks"
        count={completedDrafts.length}
        defaultOpen
      >
        {completedDrafts.length === 0 ? (
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
        {drafts.length === 0 ? (
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
          {[
            { name: "Reddit r/SaaS thread", current: 0, target: 60, action: "Helpful comment posted" },
            { name: "SaaSGenius listicle", current: 0, target: 80, action: "Editor pitch sent" },
            { name: "G2 CRM page", current: 8, target: 70, action: "Review campaign launching" },
            { name: "YouTube CRM review", current: 0, target: 50, action: "Creator pitch sent" },
            { name: "Wikipedia", current: 0, target: 0, action: "Blocked — needs Tier-1 press first" },
          ].map((s) => (
            <div key={s.name}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium">{s.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{s.action}</span>
                </div>
                <span className="font-mono text-xs text-muted-foreground">
                  {s.current}% → {s.target}%
                </span>
              </div>
              <ScoreBar value={s.target} tone={s.target === 0 ? "destructive" : "primary"} />
            </div>
          ))}
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
              Peec measures AI visibility. Openings helps you act on it. New
              mentions land in Peec, and the next-best opening surfaces
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
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
          style={{
            backgroundColor: `color-mix(in oklab, ${tone} 14%, transparent)`,
            color: tone,
          }}
        >
          <Icon className="h-3.5 w-3.5" />
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
