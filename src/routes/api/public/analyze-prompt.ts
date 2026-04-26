import { createFileRoute } from "@tanstack/react-router";
import { analyzePrompt } from "@/lib/server/analyze-prompt";

export const Route = createFileRoute("/api/analyze-prompt")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as {
          promptId?: string;
          maxSources?: number;
        };
        if (!body.promptId) {
          return new Response(JSON.stringify({ error: "promptId required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
        try {
          const result = await analyzePrompt({
            data: {
              promptId: body.promptId,
              maxSources: body.maxSources ?? 8,
            },
          });
          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (e) {
          return new Response(
            JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
