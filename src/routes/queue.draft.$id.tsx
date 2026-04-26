import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ChevronDown, Copy, Download, FileText, Mail } from "lucide-react";
import { jsPDF } from "jspdf";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { store, useAppStore } from "@/lib/store";

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
