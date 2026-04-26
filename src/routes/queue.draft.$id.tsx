import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ChevronDown, Copy, Download, FileText, Loader2, Mail } from "lucide-react";
import { jsPDF } from "jspdf";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { store, useAppStore } from "@/lib/store";
import { postToContentful } from "@/lib/server/post-to-contentful";
import contentfulLogo from "@/assets/contentful-logo.png";

export const Route = createFileRoute("/queue/draft/$id")({
  head: () => ({
    meta: [{ title: "Draft preview — Peec AI Openings" }],
  }),
  component: DraftPage,
});

function triggerDownload(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Revoke after a tick so the browser has time to start the download
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadText(filename: string, contents: string, mime: string) {
  triggerDownload(filename, new Blob([contents], { type: `${mime};charset=utf-8` }));
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function draftToHtmlBody(title: string, draft: string) {
  // Convert markdown-ish paragraphs / headings / lists to simple HTML so Word
  // and PDF exports preserve structure.
  const blocks = draft.split(/\n{2,}/);
  const html = blocks
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (/^#{1,6}\s/.test(trimmed)) {
        const level = trimmed.match(/^#+/)![0].length;
        const text = escapeHtml(trimmed.replace(/^#+\s*/, ""));
        return `<h${level}>${text}</h${level}>`;
      }
      if (/^([-*]|\d+\.)\s/m.test(trimmed)) {
        const ordered = /^\d+\.\s/.test(trimmed);
        const items = trimmed
          .split(/\n/)
          .map((l) => l.replace(/^([-*]|\d+\.)\s+/, "").trim())
          .filter(Boolean)
          .map((l) => `<li>${escapeHtml(l)}</li>`)
          .join("");
        return ordered ? `<ol>${items}</ol>` : `<ul>${items}</ul>`;
      }
      return `<p>${escapeHtml(trimmed).replace(/\n/g, "<br/>")}</p>`;
    })
    .join("\n");
  return `<h1>${escapeHtml(title)}</h1>\n${html}`;
}

function downloadDoc(filename: string, title: string, draft: string) {
  // Word opens .doc files containing HTML wrapped in the MS Office namespace.
  const body = draftToHtmlBody(title, draft);
  const doc = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #111; }
    h1 { font-size: 22pt; margin: 0 0 12pt; }
    h2 { font-size: 16pt; margin: 18pt 0 8pt; }
    h3 { font-size: 13pt; margin: 14pt 0 6pt; }
    p, li { margin: 0 0 8pt; }
    ul, ol { margin: 0 0 8pt 24pt; }
  </style>
</head>
<body>${body}</body>
</html>`;
  triggerDownload(
    filename,
    new Blob(["\ufeff", doc], { type: "application/msword" }),
  );
}

function downloadPdf(filename: string, title: string, draft: string) {
  const pdf = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 56; // ~0.78"
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - margin) {
      pdf.addPage();
      y = margin;
    }
  };

  // Title
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  const titleLines = pdf.splitTextToSize(title, contentWidth);
  ensureSpace(titleLines.length * 24);
  pdf.text(titleLines, margin, y);
  y += titleLines.length * 24 + 8;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);

  const blocks = draft.split(/\n{2,}/);
  for (const raw of blocks) {
    const block = raw.trim();
    if (!block) continue;
    let text = block;
    let fontSize = 11;
    let bold = false;
    let bullet = "";
    let leftPad = 0;

    const headingMatch = block.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      text = headingMatch[2];
      fontSize = level === 1 ? 16 : level === 2 ? 14 : 12;
      bold = true;
    } else if (/^[-*]\s/.test(block)) {
      // Render as bullet list — split lines
      const items = block.split(/\n/).map((l) => l.replace(/^[-*]\s+/, ""));
      for (const item of items) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);
        const lines = pdf.splitTextToSize(item, contentWidth - 14);
        ensureSpace(lines.length * 14 + 2);
        pdf.text("•", margin, y);
        pdf.text(lines, margin + 14, y);
        y += lines.length * 14 + 2;
      }
      y += 4;
      continue;
    } else if (/^\d+\.\s/.test(block)) {
      const items = block.split(/\n/);
      for (const item of items) {
        const m = item.match(/^(\d+)\.\s+(.*)$/);
        if (!m) continue;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);
        const lines = pdf.splitTextToSize(m[2], contentWidth - 20);
        ensureSpace(lines.length * 14 + 2);
        pdf.text(`${m[1]}.`, margin, y);
        pdf.text(lines, margin + 20, y);
        y += lines.length * 14 + 2;
      }
      y += 4;
      continue;
    }

    pdf.setFont("helvetica", bold ? "bold" : "normal");
    pdf.setFontSize(fontSize);
    const lineHeight = fontSize * 1.3;
    const lines = pdf.splitTextToSize(text, contentWidth - leftPad);
    ensureSpace(lines.length * lineHeight + 6);
    if (bullet) pdf.text(bullet, margin, y);
    pdf.text(lines, margin + leftPad, y);
    y += lines.length * lineHeight + 8;
  }

  pdf.save(filename);
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

  const postFn = useServerFn(postToContentful);
  const [contentfulOpen, setContentfulOpen] = useState(false);
  const [posting, setPosting] = useState(false);
  const [cfSpaceId, setCfSpaceId] = useState("");
  const [cfEnv, setCfEnv] = useState("master");
  const [cfContentType, setCfContentType] = useState("blogPost");
  const [cfTitleField, setCfTitleField] = useState("title");
  const [cfBodyField, setCfBodyField] = useState("body");
  const [cfLocale, setCfLocale] = useState("en-US");

  async function handlePostToContentful() {
    if (!cfSpaceId.trim() || !cfContentType.trim()) {
      toast.error("Space ID and content type are required");
      return;
    }
    setPosting(true);
    try {
      const res = await postFn({
        data: {
          spaceId: cfSpaceId.trim(),
          environmentId: cfEnv.trim() || "master",
          contentTypeId: cfContentType.trim(),
          titleField: cfTitleField.trim() || "title",
          bodyField: cfBodyField.trim() || "body",
          locale: cfLocale.trim() || "en-US",
          title: engagement!.title,
          body: engagement!.draft,
          publish: true,
        },
      });
      if (!res.ok) {
        toast.error(res.error ?? "Failed to post to Contentful");
      } else if (res.published) {
        toast.success("Published to Contentful");
        setContentfulOpen(false);
      } else {
        toast.success(`Draft created in Contentful${res.error ? " (not published)" : ""}`);
        if (res.error) toast.message(res.error);
        setContentfulOpen(false);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to post");
    } finally {
      setPosting(false);
    }
  }

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
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold leading-none">Pitch email</h2>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
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
          <div className="prose prose-sm mt-4 max-w-none text-sm leading-relaxed text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-strong:font-semibold prose-a:text-primary prose-p:my-2 prose-ul:my-2 prose-li:my-0.5">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{emailBody}</ReactMarkdown>
          </div>
        </div>
      </Card>

      {/* Platform-native preview */}
      <Card className="mt-5 overflow-hidden border-border bg-card">
        <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/30 px-5 py-3">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              navigator.clipboard.writeText(engagement.draft);
              toast.success("Draft copied");
            }}
          >
            <Copy className="h-3 w-3" /> Copy
          </Button>

          <div className="hidden flex-1 text-center sm:block">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Preview as it would appear on {host}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setContentfulOpen(true)}
              className="gap-1.5"
            >
              <img
                src={contentfulLogo}
                alt="Contentful"
                width={16}
                height={16}
                loading="lazy"
                className="h-4 w-4 rounded-sm object-contain"
              />
              Post
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm">
                  <Download className="h-3 w-3" /> Export
                  <ChevronDown className="h-3 w-3 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                  onClick={() => {
                    downloadText(`${slug}.md`, markdown, "text/markdown");
                    toast.success("Exported as Markdown");
                  }}
                >
                  <FileText className="h-3.5 w-3.5" />
                  Markdown (.md)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    downloadText(
                      `${slug}.txt`,
                      `${engagement.title}\n\n${engagement.draft}\n`,
                      "text/plain",
                    );
                    toast.success("Exported as Text");
                  }}
                >
                  <FileText className="h-3.5 w-3.5" />
                  Plain text (.txt)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    downloadDoc(`${slug}.doc`, engagement.title, engagement.draft);
                    toast.success("Exported as Word");
                  }}
                >
                  <FileText className="h-3.5 w-3.5" />
                  Word (.doc)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    try {
                      downloadPdf(`${slug}.pdf`, engagement.title, engagement.draft);
                      toast.success("Exported as PDF");
                    } catch (err) {
                      console.error(err);
                      toast.error("PDF export failed");
                    }
                  }}
                >
                  <FileText className="h-3.5 w-3.5" />
                  PDF (.pdf)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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

      <Dialog open={contentfulOpen} onOpenChange={setContentfulOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <img
                src={contentfulLogo}
                alt=""
                width={20}
                height={20}
                className="h-5 w-5 rounded-sm object-contain"
              />
              Post to Contentful
            </DialogTitle>
            <DialogDescription>
              Publishes this draft as a new entry in your Contentful space using your
              connected Contentful account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="cf-space">Space ID</Label>
              <Input
                id="cf-space"
                value={cfSpaceId}
                onChange={(e) => setCfSpaceId(e.target.value)}
                placeholder="abc123xyz"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="cf-env">Environment</Label>
                <Input
                  id="cf-env"
                  value={cfEnv}
                  onChange={(e) => setCfEnv(e.target.value)}
                  placeholder="master"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="cf-locale">Locale</Label>
                <Input
                  id="cf-locale"
                  value={cfLocale}
                  onChange={(e) => setCfLocale(e.target.value)}
                  placeholder="en-US"
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="cf-ct">Content type ID</Label>
              <Input
                id="cf-ct"
                value={cfContentType}
                onChange={(e) => setCfContentType(e.target.value)}
                placeholder="blogPost"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="cf-title-field">Title field</Label>
                <Input
                  id="cf-title-field"
                  value={cfTitleField}
                  onChange={(e) => setCfTitleField(e.target.value)}
                  placeholder="title"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="cf-body-field">Body field</Label>
                <Input
                  id="cf-body-field"
                  value={cfBodyField}
                  onChange={(e) => setCfBodyField(e.target.value)}
                  placeholder="body"
                />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Requires the Contentful connector to be linked in Lovable. Connect via
              OAuth in your workspace connectors before posting.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setContentfulOpen(false)}
              disabled={posting}
            >
              Cancel
            </Button>
            <Button onClick={handlePostToContentful} disabled={posting}>
              {posting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Posting…
                </>
              ) : (
                <>
                  <img
                    src={contentfulLogo}
                    alt=""
                    width={16}
                    height={16}
                    className="h-4 w-4 rounded-sm object-contain"
                  />
                  Publish to Contentful
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
