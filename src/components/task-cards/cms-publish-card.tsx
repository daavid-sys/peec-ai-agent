import { toast } from "sonner";
import { Check, Copy, Globe, Plug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Favicon } from "@/components/favicon";
import type { StudioDraft } from "@/lib/server/get-studio-drafts";

function isContentfulConfigured(): boolean {
  // Non-secret connector fields are exposed under VITE_LOVABLE_CONNECTOR_*
  return Boolean(
    (import.meta.env as Record<string, string | undefined>)
      .VITE_LOVABLE_CONNECTOR_CONTENTFUL_SPACE_ID,
  );
}

export function CmsPublishCard({
  draft,
  ownBrand,
  onDone,
}: {
  draft: StudioDraft;
  ownBrand: { name: string; domain: string };
  onDone: () => void;
}) {
  const connected = isContentfulConfigured();
  const host = draft.source.domain ?? ownBrand.domain;

  // Split the draft into a lead paragraph + body.
  const paragraphs = draft.fullDraft.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const lead = paragraphs[0] ?? draft.brief;
  const body = paragraphs.slice(1);

  function copyMarkdown() {
    const md = `# ${draft.title}\n\n${draft.fullDraft}\n`;
    navigator.clipboard.writeText(md);
    toast.success("Markdown copied");
  }

  function publish() {
    if (!connected) {
      toast.message("Contentful not connected", {
        description:
          "Open Connectors → Contentful in Lovable to link your space, then come back.",
      });
      return;
    }
    toast.success("Queued for publish to Contentful", {
      description: `${draft.title} → ${ownBrand.domain}`,
    });
    onDone();
  }

  return (
    <div className="space-y-3">
      {/* Article preview — looks like a CMS preview */}
      <Card className="overflow-hidden border-border bg-background p-0">
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Globe className="h-3 w-3" />
            Article preview
          </div>
          <div className="inline-flex items-center gap-1.5">
            <Favicon name={host} kind="brand" size={12} />
            <span className="font-mono lowercase">{host}</span>
          </div>
        </div>
        <article className="prose-invert max-w-none px-6 py-6 sm:px-8 sm:py-8">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
            {ownBrand.name} blog
          </div>
          <h2 className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
            {draft.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            {lead}
          </p>
          {body.length > 0 && (
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-foreground/90">
              {body.slice(0, 4).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              {body.length > 4 && (
                <p className="text-xs italic text-muted-foreground">
                  + {body.length - 4} more paragraph
                  {body.length - 4 === 1 ? "" : "s"} in full draft
                </p>
              )}
            </div>
          )}
        </article>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={publish} className="gap-1.5">
          {connected ? (
            <>
              <Check className="h-4 w-4" /> Publish to Contentful
            </>
          ) : (
            <>
              <Plug className="h-4 w-4" /> Connect Contentful to publish
            </>
          )}
        </Button>
        <Button variant="secondary" onClick={copyMarkdown} className="gap-1.5">
          <Copy className="h-4 w-4" /> Copy markdown
        </Button>
        <Button variant="outline" onClick={onDone} className="ml-auto">
          Mark as published
        </Button>
      </div>
    </div>
  );
}
