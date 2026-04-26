import { Favicon } from "@/components/favicon";
import { Skeleton } from "@/components/ui/skeleton";
import type { PromptTableRow } from "@/lib/server/get-prompt-table";

/**
 * Prompt headline card shown at the top of openings/results pages.
 * Displays the prompt text, own-brand visibility, and a brand-logo stack
 * of competitors mentioned for this prompt.
 */
export function PromptHeaderCard({
  text,
  row,
  loading,
}: {
  text: string | null | undefined;
  row: PromptTableRow | null;
  loading?: boolean;
}) {
  if (loading && !text) {
    return (
      <div className="rounded-lg border border-border bg-card px-7 py-6">
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="mt-4 h-4 w-1/2" />
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-border bg-card px-7 py-6">
      <h2 className="text-2xl font-semibold leading-snug tracking-tight text-foreground text-balance">
        &ldquo;{text ?? "Selected prompt"}&rdquo;
      </h2>
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span>Visibility</span>
          <span className="font-semibold text-foreground tabular-nums">
            {row?.visibility == null ? "—" : `${row.visibility}%`}
          </span>
        </span>
        {row && row.mentioned_competitors.length > 0 && (
          <>
            <span className="text-border">|</span>
            <span className="inline-flex items-center gap-2">
              <span>Mentions</span>
              <span className="flex items-center -space-x-1.5">
                {row.mentioned_competitors.slice(0, 6).map((c) => (
                  <span
                    key={c.name}
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-border bg-background ring-1 ring-background"
                    title={`${c.name} · ${c.mention_count} mention${c.mention_count === 1 ? "" : "s"}`}
                  >
                    <Favicon
                      name={c.name}
                      kind="brand"
                      size={14}
                      className="rounded-full"
                    />
                  </span>
                ))}
                {row.mentioned_competitors.length > 6 && (
                  <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full border border-border bg-background px-1 text-[10px] font-medium text-muted-foreground ring-1 ring-background">
                    +{row.mentioned_competitors.length - 6}
                  </span>
                )}
              </span>
            </span>
          </>
        )}
      </div>
    </div>
  );
}
