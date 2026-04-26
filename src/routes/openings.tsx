import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  ExternalLink,
  Lock,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScoreBar } from "@/components/score-bar";
import { store, useAppStore } from "@/lib/store";
import type { Opening } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/openings")({
  head: () => ({ meta: [{ title: "Openings Map — Peec AI Openings" }] }),
  component: OpeningsPage,
});

function OpeningsPage() {
  const openings = useAppStore((s) => s.openings);
  const selectedId = useAppStore((s) => s.selectedOpeningId);
  const prompts = useAppStore((s) => s.prompts);
  const selectedPromptId = useAppStore((s) => s.selectedPromptId);
  const navigate = useNavigate();
  const selected = openings.find((o) => o.id === selectedId) ?? openings[0];
  const prompt = prompts.find((p) => p.id === selectedPromptId);

  if (!openings.length) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="text-sm text-muted-foreground">No openings loaded yet.</p>
        <Button asChild className="mt-4">
          <Link to="/prompts">Pick a prompt</Link>
        </Button>
      </div>
    );
  }

  const summary = {
    sources: openings.length,
    hiddenQs: new Set(openings.flatMap((o) => o.influencedQuestions)).size,
    openings: openings.length,
    ready: openings.filter((o) => o.status === "ready").length,
    blocked: openings.filter((o) => o.status === "blocked").length,
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
        Step 4 · Openings Map
      </div>
      <h1 className="text-3xl font-semibold tracking-tight">
        Openings found for: <span className="text-primary">&ldquo;{prompt?.text}&rdquo;</span>
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We scraped each cited source via Peec MCP get_url_content (Tavily
        fallback) and asked Gemini to detect safe engagement openings.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        <SummaryCard label="Sources AI reads" value={summary.sources} />
        <SummaryCard label="Hidden questions" value={summary.hiddenQs} />
        <SummaryCard label="Openings found" value={summary.openings} accent />
        <SummaryCard label="Ready to approve" value={summary.ready} tone="success" />
        <SummaryCard label="Blocked for safety" value={summary.blocked} tone="destructive" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr]">
        {/* Left: opening cards */}
        <div className="space-y-3">
          {openings.map((o) => (
            <OpeningCard
              key={o.id}
              opening={o}
              selected={o.id === selected?.id}
              onClick={() => store.selectOpening(o.id)}
            />
          ))}
        </div>

        {/* Right: source x-ray */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          {selected && <SourceXRay opening={selected} />}
          {selected && (
            <div className="mt-4 flex justify-end">
              <Button
                size="lg"
                disabled={selected.status === "blocked"}
                onClick={() => navigate({ to: "/studio" })}
              >
                Generate engagement <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  accent,
  tone,
}: {
  label: string;
  value: number;
  accent?: boolean;
  tone?: "success" | "destructive";
}) {
  return (
    <Card
      className={cn(
        "border-border bg-card p-4",
        accent && "border-primary/30 bg-primary-soft",
      )}
    >
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className="mt-1 text-2xl font-semibold tabular-nums"
        style={
          tone === "success"
            ? { color: "var(--success)" }
            : tone === "destructive"
              ? { color: "var(--destructive)" }
              : undefined
        }
      >
        {value}
      </div>
    </Card>
  );
}

function OpeningCard({
  opening,
  selected,
  onClick,
}: {
  opening: Opening;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "block w-full rounded-lg border bg-card p-5 text-left transition-all hover:border-primary/40 hover:shadow-sm",
        selected ? "border-primary ring-2 ring-primary/20" : "border-border",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="font-normal">
              {opening.sourceType}
            </Badge>
            <span className="truncate font-mono">
              {new URL(opening.sourceUrl).hostname}
            </span>
          </div>
          <h3 className="mt-2 truncate text-sm font-semibold">{opening.sourceName}</h3>
        </div>
        <StatusPill status={opening.status} />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {opening.influencedQuestions.slice(0, 3).map((q) => (
          <span
            key={q}
            className="rounded-md bg-secondary px-1.5 py-0.5 text-[11px] text-muted-foreground"
          >
            {q}
          </span>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {Object.entries(opening.brandMentions).map(([brand, count]) => (
          <span key={brand} className="inline-flex items-center gap-1">
            <span className="font-medium text-foreground">{brand}</span>
            <span className="font-mono">{count}</span>
          </span>
        ))}
      </div>

      <Separator className="my-4" />

      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Opening
          </div>
          <div className="text-sm font-medium">{opening.openingType}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Risk
            </div>
            <div
              className="text-sm font-medium capitalize"
              style={{
                color:
                  opening.riskLevel === "high"
                    ? "var(--destructive)"
                    : opening.riskLevel === "medium"
                      ? "var(--warning)"
                      : "var(--success)",
              }}
            >
              {opening.riskLevel}
            </div>
          </div>
          <div className="w-20">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Impact
            </div>
            <div className="flex items-center gap-2">
              <ScoreBar value={opening.impactScore} className="w-12" />
              <span className="font-mono text-sm">{opening.impactScore}</span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

function StatusPill({ status }: { status: Opening["status"] }) {
  const map = {
    ready: { label: "Ready", color: "var(--success)" },
    needs_input: { label: "Needs input", color: "var(--warning)" },
    blocked: { label: "Blocked", color: "var(--destructive)" },
  } as const;
  const m = map[status];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium"
      style={{
        color: m.color,
        borderColor: `color-mix(in oklab, ${m.color} 30%, transparent)`,
        backgroundColor: `color-mix(in oklab, ${m.color} 8%, transparent)`,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: m.color }} />
      {m.label}
    </span>
  );
}

function SourceXRay({ opening }: { opening: Opening }) {
  return (
    <Card className="border-border bg-card p-6">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-primary">
        <Sparkles className="h-3.5 w-3.5" />
        Source X-Ray
      </div>
      <h2 className="mt-2 text-lg font-semibold leading-snug">
        {opening.sourceName}
      </h2>
      <a
        href={opening.sourceUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-1 inline-flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-primary"
      >
        {opening.sourceUrl} <ExternalLink className="h-3 w-3" />
      </a>

      <p className="mt-4 text-sm text-foreground">
        <span className="font-semibold">Why AI trusts it: </span>
        {opening.whyItMatters}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
        <Metric
          label="Citation count"
          value={opening.citationCount?.toString() ?? "—"}
        />
        <Metric
          label="Retrieval count"
          value={opening.retrievalCount?.toString() ?? "—"}
        />
        <Metric
          label="Citation rate"
          value={
            opening.citationRate ? `${Math.round(opening.citationRate * 100)}%` : "—"
          }
        />
        <Metric
          label="Domain influence"
          value={opening.domainInfluence?.toString() ?? "—"}
        />
      </div>

      <Separator className="my-5" />

      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Brands mentioned
      </div>
      <div className="mt-2 space-y-1.5">
        {Object.entries(opening.brandMentions).map(([brand, count]) => (
          <div key={brand} className="flex items-center gap-3">
            <div className="w-24 truncate text-sm">{brand}</div>
            <div className="flex-1">
              <ScoreBar
                value={Math.min(100, count * 5)}
                tone={count === 0 ? "destructive" : "primary"}
              />
            </div>
            <div className="w-8 text-right font-mono text-xs text-muted-foreground">
              {count}
            </div>
          </div>
        ))}
      </div>

      {opening.painSignals && opening.painSignals.length > 0 && (
        <>
          <Separator className="my-5" />
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Pain signals detected
          </div>
          <ul className="mt-2 space-y-1">
            {opening.painSignals.map((p) => (
              <li
                key={p}
                className="flex items-start gap-2 text-sm text-foreground"
              >
                <TrendingUp className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-warning" style={{ color: "var(--warning)" }} />
                {p}
              </li>
            ))}
          </ul>
        </>
      )}

      <Separator className="my-5" />
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Missing proof
      </div>
      <p className="mt-2 text-sm text-foreground">{opening.missingProof}</p>

      <div className="mt-5 rounded-md border border-primary/20 bg-primary-soft p-4">
        <div className="text-xs font-medium uppercase tracking-wider text-primary">
          Recommended engagement
        </div>
        <p className="mt-1.5 text-sm text-foreground">{opening.recommendedEngagement}</p>
      </div>

      {opening.status === "blocked" && opening.blockedReason && (
        <div className="mt-4 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-4">
          <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
          <div>
            <div className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-destructive">
              <Lock className="h-3 w-3" /> Blocked for safety
            </div>
            <p className="mt-1 text-sm text-foreground">{opening.blockedReason}</p>
          </div>
        </div>
      )}
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-secondary/40 px-3 py-2">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="font-mono text-sm font-medium">{value}</div>
    </div>
  );
}
