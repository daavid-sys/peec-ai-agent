import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Settings2,
  Upload,
  ChevronsUpDown,
  Tag as TagIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Favicon } from "@/components/favicon";
import { store, useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { PromptOpportunity } from "@/lib/types";

export const Route = createFileRoute("/prompts")({
  head: () => ({ meta: [{ title: "Prompts — Peec AI" }] }),
  component: PromptsPage,
});

const TABS = ["Active", "Suggested", "Archived"] as const;
type Tab = (typeof TABS)[number];

// Models per row — stable pseudo-random selection from a pool
const MODEL_POOL = [
  "HubSpot", // brand-style mention chips (orange)
  "Salesforce",
  "Attio",
  "Pipedrive",
  "Zoho",
];
const ENGINE_POOL = ["ChatGPT", "Gemini", "Perplexity", "Claude", "Grok"];

function pickMentions(seed: string): string[] {
  // Deterministic pick of 2-3 brand chips per prompt
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const n = 2 + (h % 2);
  const start = h % MODEL_POOL.length;
  return Array.from({ length: n }, (_, i) => MODEL_POOL[(start + i) % MODEL_POOL.length]);
}

function tagsFor(p: PromptOpportunity): { label: string; tone: "neutral" | "red" | "blue" }[] {
  const branded = /attio/i.test(p.text);
  const transactional = /best|top|easiest|alternative|vs\b|provides|cheapest/i.test(p.text);
  return [
    { label: branded ? "branded" : "non-branded", tone: "neutral" },
    {
      label: transactional ? "transactional" : "informational",
      tone: "red",
    },
    { label: "co", tone: "blue" },
  ];
}

function volumeBars(volume?: string): number {
  switch ((volume || "").toLowerCase()) {
    case "very high":
      return 4;
    case "high":
      return 3;
    case "medium":
      return 2;
    case "low":
      return 1;
    case "very low":
      return 1;
    default:
      return 3;
  }
}

function PromptsPage() {
  const prompts = useAppStore((s) => s.prompts);
  const project = useAppStore((s) => s.project);
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("Active");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query) return prompts;
    return prompts.filter((p) => p.text.toLowerCase().includes(query.toLowerCase()));
  }, [prompts, query]);

  if (!project || prompts.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="text-sm text-muted-foreground">Loading prompts…</p>
      </div>
    );
  }

  const avgViz = Math.round(
    prompts.reduce((s, p) => s + p.ownVisibility, 0) / prompts.length,
  );
  const avgSentiment = 63;
  const avgPosition = 2.6;

  const handleRowClick = (id: string) => {
    store.selectPrompt(id);
    navigate({ to: "/openings" });
  };

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col bg-background">
      {/* Tabs row + Add Prompt */}
      <div className="flex items-center justify-between border-b border-border px-6 pt-3">
        <div className="flex items-center gap-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "relative px-3 pb-3 pt-2 text-[13px] font-medium transition-colors",
                tab === t
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t}
              {tab === t && (
                <span className="absolute inset-x-3 -bottom-px h-px bg-foreground" />
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 pb-2">
          <div className="flex items-center gap-1 text-[13px] text-muted-foreground">
            <span className="inline-block h-3 w-3 rounded-full border border-border" />
            <span className="font-mono">
              <span className="font-medium text-foreground">{prompts.length}</span> / 200
            </span>
          </div>
          <button className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-[13px] font-medium text-background hover:bg-foreground/90">
            <Plus className="h-3.5 w-3.5" /> Add Prompt
          </button>
        </div>
      </div>

      {/* Search + summary stats */}
      <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-2.5">
        <div className="relative w-80">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="h-8 pl-8 text-[13px]"
          />
        </div>
        <div className="flex items-center gap-5 text-[13px]">
          <span className="text-muted-foreground">
            Visibility <span className="font-semibold text-foreground">{avgViz}%</span>
          </span>
          <span className="text-border">|</span>
          <span className="text-muted-foreground">
            Sentiment{" "}
            <span className="ml-1 inline-block h-1.5 w-1.5 -translate-y-px rounded-full bg-[oklch(0.7_0.17_145)]" />{" "}
            <span className="font-semibold text-foreground">{avgSentiment}</span>
          </span>
          <span className="text-border">|</span>
          <span className="text-muted-foreground">
            Position #{" "}
            <span className="font-semibold text-foreground">{avgPosition}</span>
          </span>
          <span className="text-border">|</span>
          <button className="rounded-md border border-border p-1.5 text-muted-foreground hover:text-foreground">
            <Settings2 className="h-3.5 w-3.5" />
          </button>
          <button className="rounded-md border border-border p-1.5 text-muted-foreground hover:text-foreground">
            <Upload className="h-3.5 w-3.5" />
          </button>
          <button className="rounded-md border border-border p-1.5 text-muted-foreground hover:text-foreground">
            <Settings2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-separate border-spacing-0 text-[13px]">
          <thead className="sticky top-0 z-10 bg-background">
            <tr className="text-muted-foreground">
              <Th className="w-8">
                <input type="checkbox" className="h-3.5 w-3.5 accent-foreground" />
              </Th>
              <Th>
                Prompt <Sortable />
              </Th>
              <Th className="text-right">
                Visibility <Sortable />
              </Th>
              <Th className="text-right">
                Sentiment <Sortable />
              </Th>
              <Th className="text-right">
                Position <Sortable />
              </Th>
              <Th>Mentions</Th>
              <Th>
                <span className="inline-flex items-center gap-1.5">
                  Volume{" "}
                  <span className="rounded-md bg-[oklch(0.93_0.04_240)] px-1.5 py-0.5 text-[10px] font-medium text-[oklch(0.45_0.18_255)]">
                    Beta
                  </span>
                  <Sortable />
                </span>
              </Th>
              <Th>Tags</Th>
              <Th>Location</Th>
              <Th className="text-right">
                SOV <Sortable />
              </Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const mentions = pickMentions(p.id);
              const extra = Math.max(0, (p.sourcesFound % 3));
              const tags = tagsFor(p);
              const v = p.ownVisibility;
              const s = p.topCompetitorVisibility ? 60 + (p.id.length % 25) : null;
              const pos = v > 0 ? ((p.id.length % 12) + 1).toFixed(1) : null;
              const sov = Math.max(0, Math.min(99, Math.round(v * 0.95)));
              const bars = volumeBars(p.volume);
              return (
                <tr
                  key={p.id}
                  onClick={() => handleRowClick(p.id)}
                  className="group cursor-pointer border-b border-border transition-colors hover:bg-muted/40"
                >
                  <Td>
                    <input
                      type="checkbox"
                      onClick={(e) => e.stopPropagation()}
                      className="h-3.5 w-3.5 accent-foreground"
                    />
                  </Td>
                  <Td className="max-w-[420px]">
                    <div className="line-clamp-2 pr-3 font-medium text-foreground">
                      {p.text}
                    </div>
                  </Td>
                  <Td className="text-right tabular-nums">
                    {v > 0 ? (
                      <span>
                        {v}% <span className="text-muted-foreground">−</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">0% −</span>
                    )}
                  </Td>
                  <Td className="text-right tabular-nums">
                    {s ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[oklch(0.7_0.17_145)]" />
                        {s} <span className="text-muted-foreground">−</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">−</span>
                    )}
                  </Td>
                  <Td className="text-right tabular-nums">
                    {pos ? (
                      <span>
                        # {pos} <span className="text-muted-foreground">−</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">−</span>
                    )}
                  </Td>
                  <Td>
                    <div className="flex items-center -space-x-1.5">
                      {mentions.map((m) => (
                        <span
                          key={m}
                          className="inline-flex h-5 w-5 items-center justify-center overflow-hidden rounded-full border border-background bg-background ring-1 ring-border"
                          title={m}
                        >
                          <Favicon name={m} kind="brand" size={14} />
                        </span>
                      ))}
                      {extra > 0 && (
                        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-background bg-muted px-1 text-[10px] font-medium text-muted-foreground ring-1 ring-border">
                          +{extra}
                        </span>
                      )}
                    </div>
                  </Td>
                  <Td>
                    <VolumeMeter level={bars} />
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      {tags.map((t) => (
                        <Pill key={t.label} tone={t.tone}>
                          {t.label}
                        </Pill>
                      ))}
                    </div>
                  </Td>
                  <Td>
                    <div className="inline-flex items-center gap-1.5 text-[13px]">
                      <span className="text-base leading-none">🇺🇸</span>
                      <span className="text-foreground">US</span>
                    </div>
                  </Td>
                  <Td className="pr-6 text-right tabular-nums">
                    {sov > 0 ? (
                      <span>
                        {sov}% <span className="text-muted-foreground">−</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">0% −</span>
                    )}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border bg-background px-6 py-2.5 text-[13px]">
        <span className="text-muted-foreground">{filtered.length} Prompts</span>
        <div className="flex items-center gap-2">
          <FooterBtn icon={TagIcon}>Assign tags</FooterBtn>
          <FooterBtn icon={Settings2}>Assign topic</FooterBtn>
          <FooterBtn icon={Upload}>Archive all</FooterBtn>
        </div>
      </div>
    </div>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        "border-b border-border px-3 py-2.5 text-left text-[12px] font-medium",
        className,
      )}
    >
      {children}
    </th>
  );
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("px-3 py-3 align-middle", className)}>{children}</td>;
}

function Sortable() {
  return <ChevronsUpDown className="ml-0.5 inline h-3 w-3 text-muted-foreground/60" />;
}

function VolumeMeter({ level }: { level: number }) {
  const heights = [4, 7, 10, 13];
  return (
    <div className="flex items-end gap-0.5">
      {heights.map((h, i) => (
        <span
          key={i}
          style={{ height: h }}
          className={cn(
            "w-1 rounded-sm",
            i < level ? "bg-[oklch(0.7_0.17_145)]" : "bg-muted",
          )}
        />
      ))}
    </div>
  );
}

function Pill({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "neutral" | "red" | "blue";
}) {
  const styles =
    tone === "red"
      ? "bg-[oklch(0.96_0.04_25)] text-[oklch(0.5_0.18_25)]"
      : tone === "blue"
        ? "bg-[oklch(0.95_0.04_240)] text-[oklch(0.45_0.18_255)]"
        : "bg-muted text-foreground/80";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium",
        styles,
      )}
    >
      {children}
    </span>
  );
}

function FooterBtn({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-[12px] font-medium text-foreground hover:bg-muted/40">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      {children}
    </button>
  );
}
