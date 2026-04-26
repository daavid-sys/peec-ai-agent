import { createFileRoute } from "@tanstack/react-router";
import { demoEngagements, demoOpenings } from "@/lib/demo-data";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json",
};

/**
 * Agent: find openings.
 *
 * Production wiring: scraped source markdown + brand list -> Lovable AI Gateway
 * (google/gemini-2.5-flash) with a structured output schema returning Opening[].
 * For the hackathon demo, returns the curated demo set.
 */
export const Route = createFileRoute("/api/agents/find-openings")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      POST: async () =>
        new Response(
          JSON.stringify({ data: demoOpenings, demoMode: true }),
          { headers: cors },
        ),
    },
  },
});

export const generateRoute = null; // sibling file below
