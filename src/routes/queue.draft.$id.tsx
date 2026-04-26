import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Copy, Download, FileText, Mail } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { store, useAppStore } from "@/lib/store";

export const Route = createFileRoute("/queue/draft/$id")({
  head: () => ({
    meta: [{ title: "Draft preview — Peec AI Openings" }],
  }),
  component: DraftPage,
});

function downloadFile(filename: string, contents: string, mime: string) {
  const blob = new Blob([contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function slugify(s: string) {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "draft"
  );
}

function DraftPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const engagement = useAppStore((s) => s.engagements.find((e) => e.id === id));
  const opening = useAppStore((s) =>
    engagement ? s.openings.find((o) => o.id === engagement.openingId) : null,
  );
  const project = useAppStore((s) => s.project);

  if (!engagement) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="text-sm text-muted-foreground">Draft not found.</p>
        <Button asChild className="mt-4">
          <Link to="/queue">Back to queue</Link>
        </Button>
      </div>
    );
  }

  const host = opening
    ? new URL(opening.sourceUrl).hostname.replace(/^www\./, "")
    : "the publication";
  const ourBrand = project?.ownBrand?.name ?? "our team";
  const slug = slugify(engagement.title);

  const reasons = [
    opening?.whyItMatters,
    engagement.missingProofAddressed
      ? `It directly addresses a gap your readers are asking about: ${engagement.missingProofAddressed}.`
      : null,
    engagement.targetQuestions.length
      ? `It maps to questions buyers are actively researching — ${engagement.targetQuestions
          .slice(0, 3)
          .join("; ")}.`
      : null,
  ].filter(Boolean) as string[];

  const emailSubject = `Contributed piece for ${host}: ${engagement.title}`;
  const emailBody = [
    `Hi ${host} editorial team,`,
    ``,
    `I'd love for you to consider including a piece we've drafted titled "${engagement.title}" on ${host}.`,
    ``,
    `Why it's a fit:`,
    ...reasons.map((r) => `- ${r}`),
    ``,
    `The full draft is attached as a Markdown file, ready for your review and any edits before publishing. Happy to revise to match your house style, tone, or length.`,
    ``,
    `Thanks for considering,`,
    `${ourBrand}`,
  ].join("\n");

  const mailto = `mailto:?subject=${encodeURIComponent(
    emailSubject,
  )}&body=${encodeURIComponent(emailBody)}`;

  const markdown = `# ${engagement.title}\n\n${engagement.draft}\n`;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/queue" })}>
          <ArrowLeft className="h-4 w-4" /> Back to queue
        </Button>
        {opening && (
          <Badge variant="outline" className="font-mono text-[11px]">
            {host}
          </Badge>
        )}
      </div>

      {/* Email pitch — top of page */}
      <Card className="mt-6 border-border bg-card p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Pitch email</h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Asks {host} to publish the piece — explains why it&rsquo;s a fit for
              their readers.
            </p>
          </div>
          <div className="flex gap-1.5">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                navigator.clipboard.writeText(`Subject: ${emailSubject}\n\n${emailBody}`);
                toast.success("Email copied");
              }}
            >
              <Copy className="h-3 w-3" /> Copy
            </Button>
            <Button size="sm" asChild>
              <a href={mailto}>
                <Mail className="h-3 w-3" /> Open in mail
              </a>
            </Button>
          </div>
        </div>
        <div className="mt-4 rounded-md border border-border bg-background p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Subject
          </div>
          <div className="mt-1 text-sm font-medium">{emailSubject}</div>
          <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {emailBody}
          </div>
        </div>
      </Card>

      {/* Export actions */}
      <Card className="mt-5 border-border bg-card p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Export draft</h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Attach one of these to the email so {host} can publish as-is.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                downloadFile(`${slug}.md`, markdown, "text/markdown");
                toast.success("Markdown exported");
              }}
            >
              <FileText className="h-3 w-3" /> Markdown
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                const html = `<!doctype html><meta charset="utf-8"><title>${engagement.title}</title><article><h1>${engagement.title}</h1>${engagement.draft
                  .split(/\n\n+/)
                  .map((p) => `<p>${p.replace(/</g, "&lt;")}</p>`)
                  .join("")}</article>`;
                downloadFile(`${slug}.html`, html, "text/html");
                toast.success("HTML exported");
              }}
            >
              <FileText className="h-3 w-3" /> HTML
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                downloadFile(`${slug}.txt`, `${engagement.title}\n\n${engagement.draft}\n`, "text/plain");
                toast.success("Text exported");
              }}
            >
              <FileText className="h-3 w-3" /> Plain text
            </Button>
          </div>
        </div>
      </Card>

      {/* Platform-native preview */}
      <Card className="mt-5 overflow-hidden border-border bg-card">
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-5 py-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Preview as it would appear on {host}
            </div>
            <h2 className="mt-0.5 text-sm font-semibold">{engagement.title}</h2>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              navigator.clipboard.writeText(engagement.draft);
              toast.success("Draft copied");
            }}
          >
            <Copy className="h-3 w-3" /> Copy draft
          </Button>
        </div>
        <article className="mx-auto max-w-prose px-8 py-10">
          <h1 className="font-serif text-3xl leading-tight text-foreground">
            {engagement.title}
          </h1>
          <div className="mt-2 text-xs text-muted-foreground">
            By {ourBrand} · For {host}
          </div>
          <div className="prose prose-sm mt-6 max-w-none text-foreground prose-headings:font-serif prose-headings:text-foreground prose-p:leading-relaxed prose-a:text-primary">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{engagement.draft}</ReactMarkdown>
          </div>
        </article>
      </Card>

      <div className="mt-6 flex justify-end gap-2">
        <Button
          variant="secondary"
          onClick={() => {
            navigator.clipboard.writeText(engagement.draft);
            toast.success("Copied");
          }}
        >
          <Copy className="h-4 w-4" /> Copy draft
        </Button>
        <Button
          onClick={() => {
            store.updateEngagementStatus(engagement.id, "sent");
            toast.success("Marked as submitted");
            navigate({ to: "/queue" });
          }}
        >
          Mark as submitted
        </Button>
      </div>
    </div>
  );
}
