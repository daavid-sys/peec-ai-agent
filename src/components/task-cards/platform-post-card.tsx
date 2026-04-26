import { toast } from "sonner";
import { Check, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlatformReplica } from "@/components/platform-replicas";
import type { StudioDraft } from "@/lib/server/get-studio-drafts";

export function PlatformPostCard({
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
  function copyDraft() {
    navigator.clipboard.writeText(draft.fullDraft);
    toast.success("Draft copied");
  }

  return (
    <div className="space-y-3">
      <PlatformReplica draft={draft} cps={9999} onDone={() => {}} ownBrand={ownBrand} showCaret={false} />
      <div className="flex flex-wrap gap-2">
        {draft.source.url && (
          <Button asChild variant="secondary" className="gap-1.5">
            <a href={draft.source.url} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" /> Open {draft.channelLabel}
            </a>
          </Button>
        )}
        <Button variant="secondary" onClick={copyDraft} className="gap-1.5">
          <Copy className="h-4 w-4" /> Copy draft
        </Button>
        {!hideMarkButton && (
          <Button onClick={onDone} className="ml-auto gap-1.5">
            <Check className="h-4 w-4" /> Mark as posted
          </Button>
        )}
      </div>
    </div>
  );
}
