import { Skeleton } from "@/components/ui/skeleton";
import { InfoPopover } from "@/components/info-popover";
import type { PromptQfo } from "@/lib/server/get-prompt-qfos";

export function ModelLogo({ modelId }: { modelId: string | null }) {
  const id = (modelId ?? "").toLowerCase();
  if (id.includes("gpt") || id.includes("chatgpt") || id.includes("openai")) {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-label="ChatGPT">
        <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365 2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
      </svg>
    );
  }
  if (id.includes("gemini") || id.includes("google")) {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-label="Gemini">
        <path d="M12 0c1.236 6.346 5.654 10.764 12 12-6.346 1.236-10.764 5.654-12 12-1.236-6.346-5.654-10.764-12-12C6.346 10.764 10.764 6.346 12 0z" />
      </svg>
    );
  }
  if (id.includes("claude") || id.includes("anthropic")) {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-label="Claude">
        <path d="M4.7 16.5 9 7.5h2.6l4.3 9h-2.4l-.9-2H8l-.9 2H4.7zm4-3.7h3.6L10.5 9zM17 16.5v-9h2.3v9H17z" />
      </svg>
    );
  }
  if (id.includes("perplex") || id.includes("sonar")) {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-label="Perplexity">
        <path d="M12 2 2 7v10l10 5 10-5V7L12 2zm0 2.2 7.5 3.7-7.5 3.8-7.5-3.8L12 4.2zM4 9.4l7 3.5v7.7l-7-3.5V9.4zm9 11.2v-7.7l7-3.5v7.7l-7 3.5z" />
      </svg>
    );
  }
  if (id.includes("grok") || id.includes("xai")) {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-label="Grok">
        <path d="M3 3h3.5l6.5 9-6.5 9H3l6.5-9L3 3zm10.5 0H17l-3.5 5-1.75-2.5L13.5 3zm0 18-1.75-2.5L13.5 16h3.5l-3.5 5z" />
      </svg>
    );
  }
  if (id.includes("copilot") || id.includes("microsoft")) {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-label="Copilot">
        <circle cx="12" cy="12" r="10" />
      </svg>
    );
  }
  if (id.includes("deepseek")) {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-label="DeepSeek">
        <path d="M12 2 2 12l10 10 10-10L12 2zm0 4 6 6-6 6-6-6 6-6z" />
      </svg>
    );
  }
  return <div className="h-2 w-2 rounded-full bg-muted-foreground/60" />;
}

function modelLabel(modelId: string | null): string {
  const id = (modelId ?? "").toLowerCase();
  if (id.includes("gpt") || id.includes("chatgpt") || id.includes("openai")) return "ChatGPT";
  if (id.includes("gemini")) return "Gemini";
  if (id.includes("google-ai-overview")) return "Google AIO";
  if (id.includes("google-ai-mode")) return "Google AI Mode";
  if (id.includes("google")) return "Google";
  if (id.includes("claude")) return "Claude";
  if (id.includes("perplex") || id.includes("sonar")) return "Perplexity";
  if (id.includes("grok")) return "Grok";
  if (id.includes("copilot") || id.includes("microsoft")) return "Copilot";
  if (id.includes("deepseek")) return "DeepSeek";
  return modelId ?? "AI";
}

export function QfosTable({
  qfos,
  loading,
  maxRows,
}: {
  qfos: PromptQfo[] | null;
  loading: boolean;
  /** Hard cap on how many rows to render. */
  maxRows?: number;
}) {
  const visibleQfos =
    qfos && typeof maxRows === "number" ? qfos.slice(0, maxRows) : qfos ?? [];
  const hiddenCount = qfos ? Math.max(0, qfos.length - visibleQfos.length) : 0;

  return (
    <div>
      <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
        Query fanouts
        <InfoPopover ariaLabel="What are query fanouts?">
          <p className="font-semibold text-foreground">Query fanouts (QFOs)</p>
          <p className="mt-1.5 text-muted-foreground">
            When you ask an AI engine a question, it doesn&rsquo;t just answer
            once — it silently rewrites your prompt into several related
            sub-queries, runs them in parallel, and blends the results. Each of
            those sub-queries is a <strong>query fanout</strong>.
          </p>
          <p className="mt-2 text-muted-foreground">
            They matter because your brand can only show up in the final answer
            if it ranks for the fanouts the engine actually runs. Tracking them
            tells you the real searches you need to win.
          </p>
          <p className="mt-2 text-muted-foreground">
            We show the top 6 fanouts captured for this prompt. The full set is
            available on the prompt detail page.
          </p>
        </InfoPopover>
      </div>

      <div className="mt-3 overflow-hidden rounded-lg border border-border bg-background">
        <div className="grid grid-cols-[110px_minmax(0,1fr)_48px] items-center gap-2 bg-secondary/40 px-4 py-2.5 text-[11px] font-medium text-muted-foreground">
          <div>Engine</div>
          <div>Query</div>
          <div className="text-right">Runs</div>
        </div>

        {loading ? (
          <ul className="divide-y divide-border">
            {Array.from({ length: 4 }).map((_, i) => (
              <li
                key={i}
                className="grid grid-cols-[110px_minmax(0,1fr)_48px] items-center gap-2 px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-3 w-14" />
                </div>
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="ml-auto h-3 w-6" />
              </li>
            ))}
          </ul>
        ) : !qfos || qfos.length === 0 ? (
          <div className="px-4 py-6 text-center text-xs text-muted-foreground">
            No query fanouts captured yet.
          </div>
        ) : (
          <>
            <ul className="divide-y divide-border">
              {visibleQfos.map((q) => (
                <li
                  key={q.id}
                  className="grid grid-cols-[110px_minmax(0,1fr)_48px] items-center gap-2 px-4 py-3 text-sm"
                >
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ModelLogo modelId={q.model_id} />
                    <span className="truncate text-xs">
                      {modelLabel(q.model_id)}
                    </span>
                  </div>
                  <div
                    className="truncate text-foreground"
                    title={q.query_text}
                  >
                    {q.query_text}
                  </div>
                  <div className="text-right text-xs tabular-nums text-muted-foreground">
                    {q.occurrence_count}
                  </div>
                </li>
              ))}
            </ul>
            {hiddenCount > 0 && (
              <div className="border-t border-border bg-secondary/20 px-4 py-2 text-[11px] text-muted-foreground">
                +{hiddenCount} more fanout{hiddenCount === 1 ? "" : "s"} on the
                prompt detail page
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
