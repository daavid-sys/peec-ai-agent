import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { Download, FileText, FileSpreadsheet, Loader2, Paperclip, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Favicon } from "@/components/favicon";
import { GmailIcon } from "@/components/icons/gmail-icon";
import { sendGmail } from "@/lib/server/send-gmail.functions";
import type { StudioDraft } from "@/lib/server/get-studio-drafts";

type Attachment = {
  name: string;
  mime: string;
  icon: typeof FileText;
  build: () => string;
};

function downloadBlob(filename: string, mime: string, content: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function buildEmail(draft: StudioDraft, ownBrandName: string): {
  to: string;
  subject: string;
  body: string;
} {
  const host = draft.source.domain ?? "editor";
  const to = `editorial@${host}`;
  const subject = `Insertion request — ${draft.title}`;
  const body = [
    `Hi ${host} editorial team,`,
    "",
    `I'm reaching out from ${ownBrandName} regarding "${draft.source.title ?? draft.title}".`,
    "",
    draft.brief,
    "",
    "I've attached a short brief, the proposed insertion copy, and a CSV of supporting data points (sources, competitor mentions, impact). Happy to tailor any of it to your editorial guidelines.",
    "",
    `Best,\n${ownBrandName}`,
  ].join("\n");
  return { to, subject, body };
}

export function EmailPitchCard({
  draft,
  ownBrand,
  onDone,
  hideMarkButton = false,
}: {
  draft: StudioDraft;
  ownBrand: { name: string; domain: string };
  onDone: () => void;
  hideMarkButton?: boolean;
}) {
  const email = useMemo(() => buildEmail(draft, ownBrand.name), [draft, ownBrand.name]);
  const sendGmailFn = useServerFn(sendGmail);
  const [sending, setSending] = useState(false);

  const attachments: Attachment[] = useMemo(
    () => [
      {
        name: "pitch-brief.md",
        mime: "text/markdown",
        icon: FileText,
        build: () =>
          `# Pitch brief — ${draft.title}\n\n` +
          `**Target:** ${draft.source.title ?? draft.source.url ?? "—"}\n` +
          `**Domain:** ${draft.source.domain ?? "—"}\n` +
          `**Impact score:** ${draft.impactScore}\n\n` +
          `## Why this matters\n\n${draft.brief}\n\n` +
          (draft.rationale ? `## Rationale\n\n${draft.rationale}\n\n` : "") +
          (draft.competitors.length
            ? `## Competitors already mentioned\n\n${draft.competitors.map((c) => `- ${c}`).join("\n")}\n`
            : ""),
      },
      {
        name: "draft.md",
        mime: "text/markdown",
        icon: FileText,
        build: () => `# ${draft.title}\n\n${draft.fullDraft}\n`,
      },
      {
        name: "data-points.csv",
        mime: "text/csv",
        icon: FileSpreadsheet,
        build: () => {
          const rows: string[] = ["field,value"];
          rows.push(`brand,${JSON.stringify(ownBrand.name)}`);
          rows.push(`title,${JSON.stringify(draft.title)}`);
          rows.push(`source_url,${JSON.stringify(draft.source.url ?? "")}`);
          rows.push(`source_domain,${JSON.stringify(draft.source.domain ?? "")}`);
          rows.push(`impact_score,${draft.impactScore}`);
          for (const c of draft.competitors) {
            rows.push(`competitor,${JSON.stringify(c)}`);
          }
          return rows.join("\n") + "\n";
        },
      },
    ],
    [draft, ownBrand.name],
  );

  function exportAll() {
    for (const att of attachments) {
      downloadBlob(att.name, att.mime, att.build());
    }
    // Also export the email as .eml-friendly text
    const emlContent =
      `To: ${email.to}\nSubject: ${email.subject}\n\n${email.body}\n`;
    downloadBlob("pitch-email.txt", "text/plain", emlContent);
    toast.success(`Exported ${attachments.length + 1} files`);
  }

  function copyEmail() {
    const text = `To: ${email.to}\nSubject: ${email.subject}\n\n${email.body}`;
    navigator.clipboard.writeText(text);
    toast.success("Email copied");
  }

  return (
    <div className="space-y-3">
      {/* Email composer */}
      <Card className="overflow-hidden border-border bg-background p-0">
        <div className="border-b border-border bg-muted/30 px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          New message
        </div>
        <div className="space-y-2 px-4 py-3 text-sm">
          <div className="flex items-center gap-3 border-b border-border pb-2">
            <span className="w-16 shrink-0 text-xs font-medium text-muted-foreground">
              To
            </span>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-xs">
              <Favicon name={draft.source.domain ?? "mail"} kind="brand" size={12} />
              <span className="font-mono">{email.to}</span>
            </div>
          </div>
          <div className="flex items-start gap-3 border-b border-border pb-2">
            <span className="w-16 shrink-0 pt-0.5 text-xs font-medium text-muted-foreground">
              Subject
            </span>
            <span className="font-medium">{email.subject}</span>
          </div>
          <div className="whitespace-pre-wrap pt-2 text-sm leading-relaxed text-foreground">
            {email.body}
          </div>
        </div>
        {/* Attachments */}
        <div className="border-t border-border bg-muted/20 px-4 py-3">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <Paperclip className="h-3 w-3" /> {attachments.length} attachments
          </div>
          <div className="flex flex-wrap gap-2">
            {attachments.map((att) => {
              const Icon = att.icon;
              return (
                <button
                  key={att.name}
                  onClick={() => downloadBlob(att.name, att.mime, att.build())}
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary-soft/40"
                  title={`Download ${att.name}`}
                >
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  {att.name}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={async () => {
            setSending(true);
            try {
              await sendGmailFn({ data: { to: email.to, subject: email.subject, body: email.body } });
              toast.success(`Email sent to ${email.to}`);
              if (!hideMarkButton) onDone();
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Failed to send email");
            } finally {
              setSending(false);
            }
          }}
          disabled={sending}
          className="gap-2"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <GmailIcon className="h-4 w-4" />
          )}
          Send email
        </Button>
        <Button variant="secondary" onClick={exportAll} className="gap-1.5">
          <Download className="h-4 w-4" /> Export all
        </Button>
        <Button variant="ghost" onClick={copyEmail} className="gap-1.5">
          <Paperclip className="h-4 w-4" /> Copy email
        </Button>
        {!hideMarkButton && (
          <Button variant="outline" onClick={onDone} className="ml-auto gap-1.5">
            <Send className="h-4 w-4" /> Mark as sent
          </Button>
        )}
      </div>
    </div>
  );
}
