import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, Copy, Send, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { store, useAppStore } from "@/lib/store";
import type { Engagement, QualityCheck } from "@/lib/types";

export const Route = createFileRoute("/studio")({
  head: () => ({ meta: [{ title: "Engagement Studio — Peec AI Openings" }] }),
  component: StudioPage,
});

function StudioPage() {
  const engagements = useAppStore((s) => s.engagements);
  const openings = useAppStore((s) => s.openings);
  const navigate = useNavigate();

  if (!engagements.length) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="text-sm text-muted-foreground">No drafts yet.</p>
        <Button asChild className="mt-4">
          <Link to="/openings">Find openings</Link>
        </Button>
      </div>
    );
  }

  const first = engagements[0].id;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
        Step 3 · Engagement Studio
      </div>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Source-specific drafts, generated with Gemini
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Each draft targets the exact source, hidden questions, and missing
            proof. Quality checks block spam before it reaches your queue.
          </p>
        </div>
        <Button size="lg" onClick={() => navigate({ to: "/queue" })}>
          Open approval queue <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue={first} className="mt-8">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0">
          {engagements.map((e) => {
            const opening = openings.find((o) => o.id === e.openingId);
            return (
              <TabsTrigger
                key={e.id}
                value={e.id}
                className="data-[state=active]:bg-primary-soft data-[state=active]:text-accent-foreground rounded-md border border-border bg-card px-3 py-2 text-xs font-medium data-[state=active]:border-primary/40"
              >
                <span className="mr-2 truncate max-w-[200px]">
                  {opening?.openingType ?? "Draft"}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {engagements.map((e) => (
          <TabsContent key={e.id} value={e.id} className="mt-5">
            <DraftCard engagement={e} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function DraftCard({ engagement }: { engagement: Engagement }) {
  const opening = useAppStore((s) =>
    s.openings.find((o) => o.id === engagement.openingId),
  );

  function copy() {
    navigator.clipboard.writeText(engagement.draft);
    toast.success("Draft copied to clipboard");
  }
  function approve() {
    store.updateEngagementStatus(engagement.id, "approved");
    toast.success("Approved · sent to queue");
  }
  function send() {
    store.updateEngagementStatus(engagement.id, "sent");
    toast.success("Marked as sent");
  }

  return (
    <Card className="border-border p-0">
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr]">
        <div className="border-b border-border p-6 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="font-normal capitalize">
              {engagement.format?.replace("_", " ") ?? "draft"}
            </Badge>
            <Badge
              variant="outline"
              style={{
                color:
                  engagement.status === "blocked"
                    ? "var(--destructive)"
                    : engagement.status === "approved" || engagement.status === "sent"
                      ? "var(--success)"
                      : "var(--muted-foreground)",
              }}
            >
              {engagement.status}
            </Badge>
          </div>
          <h2 className="mt-3 text-lg font-semibold">{engagement.title}</h2>
          {opening && (
            <p className="mt-1 text-xs text-muted-foreground">
              Targets <span className="font-mono">{engagement.targetSource}</span>
            </p>
          )}

          <Textarea
            value={engagement.draft}
            readOnly
            className="mt-4 min-h-[260px] resize-y bg-secondary/30 font-mono text-sm leading-relaxed"
          />

          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={approve} disabled={engagement.status === "blocked"}>
              <Check className="h-4 w-4" /> Approve
            </Button>
            <Button variant="secondary" onClick={copy}>
              <Copy className="h-4 w-4" /> Copy
            </Button>
            <Button variant="ghost" onClick={send} disabled={engagement.status === "blocked"}>
              <Send className="h-4 w-4" /> Mark as sent
            </Button>
          </div>
        </div>

        <div className="bg-secondary/30 p-6">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Why it works
          </div>
          <p className="mt-2 text-sm text-foreground">
            {engagement.missingProofAddressed}
          </p>

          <Separator className="my-5" />

          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Target hidden questions
          </div>
          <ul className="mt-2 space-y-1">
            {engagement.targetQuestions.map((q) => (
              <li key={q} className="text-sm">
                · {q}
              </li>
            ))}
          </ul>

          {engagement.disclosure && (
            <>
              <Separator className="my-5" />
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Required disclosure
              </div>
              <p className="mt-2 rounded-md border border-warning/30 bg-warning/5 px-3 py-2 text-sm">
                &ldquo;{engagement.disclosure}&rdquo;
              </p>
            </>
          )}

          <Separator className="my-5" />

          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Quality checks
          </div>
          <ul className="mt-2 space-y-2">
            {engagement.qualityChecks.map((c) => (
              <QualityRow key={c.label} check={c} />
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}

function QualityRow({ check }: { check: QualityCheck }) {
  const Icon = check.status === "fail" ? X : check.status === "warning" ? null : Check;
  const color =
    check.status === "fail"
      ? "var(--destructive)"
      : check.status === "warning"
        ? "var(--warning)"
        : "var(--success)";
  return (
    <li className="flex items-start gap-2 text-sm">
      <span
        className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full"
        style={{
          backgroundColor: `color-mix(in oklab, ${color} 15%, transparent)`,
          color,
        }}
      >
        {Icon ? <Icon className="h-2.5 w-2.5" strokeWidth={3} /> : <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-medium">{check.label}</div>
        <div className="text-xs text-muted-foreground">{check.note}</div>
      </div>
    </li>
  );
}
