import { createFileRoute } from "@tanstack/react-router";
import { demoEngagements } from "@/lib/demo-data";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json",
};

/**
 * Agent: generate engagements.
 *
 * Production wiring: openings + brand voice -> Lovable AI Gateway
 * (google/gemini-2.5-flash) with structured output returning Engagement[]
 * including draft, quality checks, disclosures.
 * Demo returns the curated set.
 */
export const Route = createFileRoute("/api/agents/generate-engagements")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      POST: async () =>
        new Response(
          JSON.stringify({ data: demoEngagements, demoMode: true }),
          { headers: cors },
        ),
    },
  },
});
