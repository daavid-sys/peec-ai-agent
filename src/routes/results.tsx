import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScoreBar } from "@/components/score-bar";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/results")({
  head: () => ({ meta: [{ title: "Results — Peec AI Openings" }] }),
  component: ResultsPage,
});

function ResultsPage() {
  const engagements = useAppStore((s) => s.engagements);
  const sent = engagements.filter((e) => e.status === "sent" || e.status === "approved").length;

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
