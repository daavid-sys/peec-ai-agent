import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  Sparkles,
  TrendingDown,
  Search as SearchIcon,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScoreBar } from "@/components/score-bar";
import { Favicon } from "@/components/favicon";
import { store, useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { demoOpenings } from "@/lib/demo-data";
import type { Opening, PromptOpportunity } from "@/lib/types";

export const Route = createFileRoute("/prompts")({
  head: () => ({ meta: [{ title: "Recommended Prompt — Peec AI Openings" }] }),
  component: PromptsPage,
});

function PromptsPage() {
  const prompts = useAppStore((s) => s.prompts);
  const project = useAppStore((s) => s.project);
  const selectedId = useAppStore((s) => s.selectedPromptId);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

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

  // Openings preview for the currently selected prompt (with sensible fallback)
  const previewOpenings: Opening[] = useMemo(() => {
    const matched = demoOpenings.filter((o) => o.promptId === selected.id);
    return (matched.length ? matched : demoOpenings).slice(0, 3);
  }, [selected.id]);

  const filteredPrompts = useMemo(() => {
    if (!query) return prompts;
    return prompts.filter((p) =>
      p.text.toLowerCase().includes(query.toLowerCase()),
    );
  }, [prompts, query]);

  const startFlow = () => {
    store.selectPrompt(selected.id);
    navigate({ to: "/openings" });
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        Step 1 · Recommended Opening
        {selected.id !== recommended.id && (
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] normal-case tracking-normal text-muted-foreground">
            custom selection
          </span>
        )}
      </div>
      <h1 className="text-3xl font-semibold tracking-tight">
        Start with the prompt where you can win the most
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        We ranked all {prompts.length} prompts by Opportunity Score. Here&rsquo;s
        the one we&rsquo;d fix first — and a sneak peek of the openings ready
        for you.
      </p>

      {/* Hero recommended-prompt card */}
      <Card className="mt-8 overflow-hidden border-border p-0">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr]">
          <div className="border-b border-border p-7 lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-2 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Recommended prompt
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">
              &ldquo;{selected.text}&rdquo;
            </h2>

            <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
              <Stat
                label="Your visibility"
                value={`${selected.ownVisibility}%`}
                tone="destructive"
              />
              <Stat
                label={`${selected.topCompetitor} visibility`}
                value={`${selected.topCompetitorVisibility}%`}
              />
              <Stat
                label="Visibility gap"
                value={`${selected.visibilityGap}%`}
                tone="destructive"
                icon={TrendingDown}
              />
              <Stat
                label="Opportunity score"
                value={`${selected.opportunityScore}/100`}
                tone="primary"
              />
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 text-xs">
              <Mini label="Sources found" value={selected.sourcesFound} />
              <Mini label="Hidden questions" value={selected.hiddenQuestionsFound} />
              <Mini label="Openings found" value={selected.openingsFound} />
            </div>

            {selected.reasons && selected.reasons.length > 0 && (
              <div className="mt-6 space-y-2">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Why this prompt
                </div>
                <ul className="space-y-1.5">
                  {selected.reasons.map((r) => (
                    <li
                      key={r}
                      className="flex items-start gap-2 text-sm text-foreground"
                    >
                      <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-3">
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
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Visibility breakdown
            </div>
            <div className="mt-4 space-y-3">
              {selected.competitorBreakdown?.map((c) => (
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
                    tone={
                      c.brand === project.ownBrand.name ? "primary" : "destructive"
                    }
                  />
                </div>
              ))}
            </div>

            {selected.hiddenQuestions && selected.hiddenQuestions.length > 0 && (
              <>
                <div className="mt-7 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Hidden questions AI checks
                </div>
                <ul className="mt-3 space-y-1.5">
                  {selected.hiddenQuestions.map((q) => (
                    <li key={q} className="text-sm text-foreground">
                      · {q}
                    </li>
                  ))}
                </ul>
              </>
            )}
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
              The first {previewOpenings.length} of {selected.openingsFound}{" "}
              openings already drafted by the agent.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={startFlow}>
            See all openings <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {previewOpenings.map((o) => (
            <OpeningPreviewCard key={o.id} opening={o} onOpen={startFlow} />
          ))}
        </div>
      </div>

      {/* Prompt switcher */}
      <div id="prompt-switcher" className="mt-12">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Or pick a different prompt
            </h2>
            <p className="text-xs text-muted-foreground">
              Selecting a prompt instantly updates the recommendation and the
              openings preview above — no reload.
            </p>
          </div>
          <div className="relative w-72">
            <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search prompts"
              className="h-8 pl-8 text-[13px]"
            />
          </div>
        </div>

        <Card className="overflow-hidden border-border p-0">
          <ul className="divide-y divide-border">
            {filteredPrompts.map((p) => (
              <PromptRow
                key={p.id}
                prompt={p}
                active={p.id === selected.id}
                isOwn={(b) => b === project.ownBrand.name}
                onSelect={() => {
                  store.selectPrompt(p.id);
                  document
                    .getElementById("prompt-switcher")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              />
            ))}
            {filteredPrompts.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-muted-foreground">
                No prompts match &ldquo;{query}&rdquo;.
              </li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function PromptRow({
  prompt,
  active,
  isOwn,
  onSelect,
}: {
  prompt: PromptOpportunity;
  active: boolean;
  isOwn: (b: string) => boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        onClick={onSelect}
        className={cn(
          "flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-muted/40",
          active && "bg-muted/60",
        )}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {active && (
              <Badge className="h-5 gap-1 bg-foreground px-1.5 text-[10px] text-background">
                <Sparkles className="h-3 w-3" /> Selected
              </Badge>
            )}
            <span className="truncate text-sm font-medium text-foreground">
              {prompt.text}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Favicon name={prompt.topCompetitor} kind="brand" size={10} />
              top: {prompt.topCompetitor} {prompt.topCompetitorVisibility}%
            </span>
            <span>·</span>
            <span>{prompt.openingsFound} openings</span>
            <span>·</span>
            <span>{prompt.hiddenQuestionsFound} hidden Qs</span>
          </div>
        </div>

        <div className="hidden w-24 sm:block">
          <div className="mb-1 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
            <span>your viz</span>
            <span>{prompt.ownVisibility}%</span>
          </div>
          <ScoreBar
            value={prompt.ownVisibility}
            tone={isOwn(prompt.topCompetitor) ? "primary" : "destructive"}
          />
        </div>

        <div className="hidden w-32 text-right sm:block">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Opp. score
          </div>
          <div className="font-mono text-base font-semibold tabular-nums">
            {prompt.opportunityScore}
          </div>
        </div>

        <ChevronRight
          className={cn(
            "h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform",
            active && "translate-x-0.5 text-foreground",
          )}
        />
      </button>
    </li>
  );
}

function OpeningPreviewCard({
  opening,
  onOpen,
}: {
  opening: Opening;
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
      <div
        className={cn(
          "mt-1 flex items-center gap-1 text-2xl font-semibold tabular-nums",
          color,
        )}
      >
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
