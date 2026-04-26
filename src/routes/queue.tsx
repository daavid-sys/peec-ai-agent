import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, Copy, Download, ExternalLink, Mail, Send } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { store, useAppStore } from "@/lib/store";
import type { Engagement } from "@/lib/types";

export const Route = createFileRoute("/queue")({
  head: () => ({ meta: [{ title: "Approval Queue — Peec AI Openings" }] }),
  component: QueuePage,
});

const columns = [
  { key: "ready", title: "Ready to publish", desc: "Owned channels — approved & safe" },
  {
    key: "ready_to_submit",
    title: "Ready to submit",
    desc: "Third-party site — file exported & email drafted",
  },
  { key: "needs_input", title: "Needs input", desc: "Resolve before sending" },
  { key: "blocked", title: "Blocked", desc: "Safety guardrail triggered" },
] as const;

// Channels we own and can publish to directly. Anything else (guest posts on
// salesforce.com, third-party blogs, partner sites, etc.) needs to be packaged
// up and emailed to the site owner for review & publishing.
const OWNED_DOMAINS = ["attio.com"];
const OWNED_OPENING_TYPES: ReadonlyArray<string> = [
  "Reddit comment opportunity",
  "LinkedIn founder comment",
  "FAQ/schema update",
  "Community/forum reply",
  "Owned comparison page",
];

function isThirdPartySubmission(e: Engagement, sourceUrl?: string, openingType?: string) {
  if (e.format === "pitch_email" || e.format === "creator_pitch") return true;
  if (openingType && !OWNED_OPENING_TYPES.includes(openingType)) {
    if (
      openingType === "Blog/editorial update pitch" ||
      openingType === "YouTube creator pitch" ||
      openingType === "Review request campaign"
    ) {
      return true;
    }
  }
  if (sourceUrl) {
    try {
      const host = new URL(sourceUrl).hostname.replace(/^www\./, "");
      if (!OWNED_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`))) {
        // External host + a pitch-style opening means we need to submit, not publish
        if (
          openingType === "Blog/editorial update pitch" ||
          openingType === "YouTube creator pitch" ||
          openingType === "Review request campaign"
        ) {
          return true;
        }
      }
    } catch {
      /* ignore */
    }
  }
  return false;
}

function bucket(
  e: Engagement,
  sourceUrl?: string,
  openingType?: string,
): (typeof columns)[number]["key"] {
  if (e.status === "blocked") return "blocked";
  const hasFail = e.qualityChecks.some((c) => c.status === "fail");
  if (hasFail) return "needs_input";
  if (isThirdPartySubmission(e, sourceUrl, openingType)) return "ready_to_submit";
  return "ready";
}

function QueuePage() {
  const engagements = useAppStore((s) => s.engagements);
  const openings = useAppStore((s) => s.openings);
  const navigate = useNavigate();

  if (!engagements.length) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="text-sm text-muted-foreground">Queue is empty.</p>
        <Button asChild className="mt-4">
          <Link to="/studio">Generate drafts</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Operate, don&rsquo;t just report
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Approve before publishing. No content spam — only source-specific
            actions.
          </p>
        </div>
        <Button size="lg" onClick={() => navigate({ to: "/results" })}>
          See results <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-4">
        {columns.map((col) => {
          const items = engagements.filter((e) => {
            const op = openings.find((o) => o.id === e.openingId);
            return bucket(e, op?.sourceUrl, op?.openingType) === col.key;
          });
          return (
            <div key={col.key}>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold">{col.title}</h2>
                  <p className="text-xs text-muted-foreground">{col.desc}</p>
                </div>
                <Badge variant="outline" className="font-mono">
                  {items.length}
                </Badge>
              </div>
              <div className="space-y-3">
                {items.length === 0 && (
                  <Card className="border-dashed border-border bg-transparent p-5 text-center text-xs text-muted-foreground">
                    Nothing here.
                  </Card>
                )}
                {items.map((e) => {
                  const opening = openings.find((o) => o.id === e.openingId);
                  return (
                    <Card key={e.id} className="border-border bg-card p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                            {opening?.openingType}
                          </div>
                          <h3 className="mt-1 truncate text-sm font-semibold">
                            {e.title}
                          </h3>
                        </div>
                      </div>

                      {opening && (
                        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                          <a
                            href={opening.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 truncate font-mono hover:text-primary"
                          >
                            {new URL(opening.sourceUrl).hostname}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                          <span className="font-mono">
                            Impact {opening.impactScore}
                          </span>
                        </div>
                      )}

                      <div className="mt-3 flex flex-wrap gap-1">
                        {e.targetQuestions.slice(0, 2).map((q) => (
                          <span
                            key={q}
                            className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground"
                          >
                            {q}
                          </span>
                        ))}
                      </div>

                      {col.key === "ready_to_submit" && opening && (
                        <div className="mt-3 rounded-md border border-dashed border-border bg-muted/30 p-2 text-[11px] text-muted-foreground">
                          Submit to{" "}
                          <span className="font-mono text-foreground">
                            {new URL(opening.sourceUrl).hostname.replace(/^www\./, "")}
                          </span>{" "}
                          editorial team — we don&rsquo;t own this domain.
                        </div>
                      )}

                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {col.key === "ready" && (
                          <>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                navigator.clipboard.writeText(e.draft);
                                toast.success("Copied");
                              }}
                            >
                              <Copy className="h-3 w-3" /> Copy
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                store.updateEngagementStatus(e.id, "sent");
                                toast.success("Marked as sent");
                              }}
                            >
                              <Send className="h-3 w-3" /> Mark sent
                            </Button>
                          </>
                        )}
                        {col.key === "ready_to_submit" && (
                          <>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                const slug = e.title
                                  .toLowerCase()
                                  .replace(/[^a-z0-9]+/g, "-")
                                  .replace(/^-|-$/g, "")
                                  .slice(0, 60) || "draft";
                                const blob = new Blob([`# ${e.title}\n\n${e.draft}\n`], {
                                  type: "text/markdown",
                                });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = `${slug}.md`;
                                a.click();
                                URL.revokeObjectURL(url);
                                toast.success("File exported");
                              }}
                            >
                              <Download className="h-3 w-3" /> Export file
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                const host = opening
                                  ? new URL(opening.sourceUrl).hostname.replace(/^www\./, "")
                                  : "your site";
                                const subject = `Contributed piece for ${host}: ${e.title}`;
                                const body = [
                                  `Hi ${host} editorial team,`,
                                  ``,
                                  `I've put together a piece I think would be a strong fit for your readers: "${e.title}".`,
                                  ``,
                                  `It addresses: ${e.targetQuestions.slice(0, 3).join("; ")}.`,
                                  ``,
                                  `The full draft is attached as a Markdown file, ready for your review and any edits before publishing.`,
                                  ``,
                                  `Happy to revise based on your house style.`,
                                  ``,
                                  `Thanks,`,
                                  `The Attio team`,
                                ].join("\n");
                                window.location.href = `mailto:?subject=${encodeURIComponent(
                                  subject,
                                )}&body=${encodeURIComponent(body)}`;
                              }}
                            >
                              <Mail className="h-3 w-3" /> Draft email
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                store.updateEngagementStatus(e.id, "sent");
                                toast.success("Marked as submitted");
                              }}
                            >
                              <Send className="h-3 w-3" /> Mark submitted
                            </Button>
                          </>
                        )}
                        {col.key === "needs_input" && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              navigator.clipboard.writeText(e.draft);
                              toast.success("Copied");
                            }}
                          >
                            <Copy className="h-3 w-3" /> Copy
                          </Button>
                        )}
                        {col.key === "blocked" && (
                          <Badge
                            variant="outline"
                            style={{
                              color: "var(--destructive)",
                              borderColor:
                                "color-mix(in oklab, var(--destructive) 30%, transparent)",
                            }}
                          >
                            Action required offline
                          </Badge>
                        )}
                        {e.status === "sent" && (
                          <Badge variant="outline" className="gap-1">
                            <Check className="h-3 w-3" />{" "}
                            {col.key === "ready_to_submit" ? "Submitted" : "Sent"}
                          </Badge>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
