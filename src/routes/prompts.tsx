import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, Sparkles, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScoreBar } from "@/components/score-bar";
import { Favicon } from "@/components/favicon";
import { StatusBadge } from "@/components/status-badge";
import { store, useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/prompts")({
  head: () => ({ meta: [{ title: "Prompt Opportunities — Peec AI Openings" }] }),
  component: PromptsPage,
});

function PromptsPage() {
  const prompts = useAppStore((s) => s.prompts);
  const project = useAppStore((s) => s.project);
  const selected = useAppStore((s) => s.selectedPromptId);
  const navigate = useNavigate();

  if (!project || prompts.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="text-sm text-muted-foreground">No prompts loaded yet.</p>
        <Button asChild className="mt-4">
          <Link to="/">Connect Peec AI</Link>
        </Button>
      </div>
    );
  }

  const best = prompts.find((p) => p.status === "best_opportunity") ?? prompts[0];
  const selectedPrompt = prompts.find((p) => p.id === selected);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
        Step 3 · Prompt Opportunities
      </div>
      <h1 className="text-3xl font-semibold tracking-tight">
        Fix the prompt with the highest opportunity first
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        We analyzed all {prompts.length} prompts in your project across{" "}
        {project.models.length} AI models. Here&rsquo;s the one we&rsquo;d fix
        first — and why.
      </p>

      {/* Best Prompt to Fix card */}
      <Card className="mt-8 overflow-hidden border-border p-0">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr]">
          <div className="border-b border-border p-7 lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-2 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Best prompt to fix first
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">
              &ldquo;{best.text}&rdquo;
            </h2>

            <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
              <Stat label="Your visibility" value={`${best.ownVisibility}%`} tone="destructive" />
              <Stat
                label={`${best.topCompetitor} visibility`}
                value={`${best.topCompetitorVisibility}%`}
              />
              <Stat
                label="Visibility gap"
                value={`${best.visibilityGap}%`}
                tone="destructive"
                icon={TrendingDown}
              />
              <Stat
                label="Opportunity score"
                value={`${best.opportunityScore}/100`}
                tone="primary"
              />
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 text-xs">
              <Mini label="Sources found" value={best.sourcesFound} />
              <Mini label="Hidden questions" value={best.hiddenQuestionsFound} />
              <Mini label="Openings found" value={best.openingsFound} />
            </div>

            <div className="mt-6 space-y-2">
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Why this prompt
              </div>
              <ul className="space-y-1.5">
                {best.reasons?.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                onClick={() => {
                  store.selectPrompt(best.id);
                  navigate({ to: "/openings" });
                }}
              >
                Use recommended prompt <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => {
                  document.getElementById("prompt-table")?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
              >
                Choose another prompt
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="text-xs text-muted-foreground underline decoration-dotted underline-offset-2">
                    How is the score calculated?
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm text-xs">
                    Opportunity Score = visibility gap + competitor dominance +
                    source availability + QFO availability + own brand absence +
                    action feasibility + safety + speed to execute.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Right side: competitor breakdown + hidden questions */}
          <div className="bg-secondary/40 p-7">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Visibility breakdown
            </div>
            <div className="mt-4 space-y-3">
              {best.competitorBreakdown?.map((c) => (
                <div key={c.brand}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5",
                        c.brand === project.ownBrand.name
                          ? "font-semibold text-primary"
                          : "text-foreground",
                      )}
                    >
                      <Favicon name={c.brand} kind="brand" size={12} />
                      {c.brand}
                    </span>
                    <span className="font-mono text-muted-foreground">
                      {c.visibility}%
                    </span>
                  </div>
                  <ScoreBar
                    value={c.visibility}
                    tone={c.brand === project.ownBrand.name ? "primary" : "destructive"}
                  />
                </div>
              ))}
            </div>

            <div className="mt-7 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Hidden questions AI checks
            </div>
            <ul className="mt-3 space-y-1.5">
              {best.hiddenQuestions?.map((q) => (
                <li key={q} className="text-sm text-foreground">
                  · {q}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* Prompt table */}
      <div id="prompt-table" className="mt-12">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">All prompts</h2>
            <p className="text-xs text-muted-foreground">
              Click any row to override the recommendation.
            </p>
          </div>
          {selectedPrompt && (
            <div className="flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2 text-sm">
              <span className="text-muted-foreground">Selected:</span>
              <span className="font-medium">&ldquo;{selectedPrompt.text}&rdquo;</span>
              <Button size="sm" onClick={() => navigate({ to: "/openings" })}>
                Find openings <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>

        <Card className="overflow-hidden border-border p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Prompt</TableHead>
                <TableHead className="text-right">Your viz</TableHead>
                <TableHead>Top competitor</TableHead>
                <TableHead className="text-right">Gap</TableHead>
                <TableHead className="text-right">Sources</TableHead>
                <TableHead className="text-right">Hidden Qs</TableHead>
                <TableHead className="text-right">Openings</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prompts.map((p) => (
                <TableRow
                  key={p.id}
                  onClick={() => store.selectPrompt(p.id)}
                  data-state={selected === p.id ? "selected" : undefined}
                  className="cursor-pointer"
                >
                  <TableCell className="max-w-xs font-medium">{p.text}</TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {p.ownVisibility}%
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {p.topCompetitor}{" "}
                    <span className="font-mono">({p.topCompetitorVisibility}%)</span>
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-mono text-sm",
                      p.visibilityGap < 0 ? "text-destructive" : "text-success",
                    )}
                    style={p.visibilityGap >= 0 ? { color: "var(--success)" } : undefined}
                  >
                    {p.visibilityGap > 0 ? "+" : ""}
                    {p.visibilityGap}%
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {p.sourcesFound}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {p.hiddenQuestionsFound}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {p.openingsFound}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <ScoreBar value={p.opportunityScore} className="w-16" />
                      <span className="font-mono text-sm">{p.opportunityScore}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={p.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string;
  tone?: "destructive" | "primary";
  icon?: React.ComponentType<{ className?: string }>;
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
      <div className={cn("mt-1 flex items-center gap-1 text-2xl font-semibold tabular-nums", color)}>
        {Icon && <Icon className="h-4 w-4" />}
        {value}
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border bg-background px-3 py-2">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="font-mono text-base font-medium">{value}</div>
    </div>
  );
}
