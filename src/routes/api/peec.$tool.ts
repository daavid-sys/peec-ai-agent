import { createFileRoute } from "@tanstack/react-router";
import {
  demoEngagements,
  demoOpenings,
  demoProject,
  demoPrompts,
} from "@/lib/demo-data";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: cors });
}

/**
 * Single backend entrypoint that proxies Peec MCP tool calls.
 * In demo mode (default for the hackathon), it returns realistic Attio data.
 *
 * To go live, set PEEC_MCP_TOKEN and implement an MCP Streamable HTTP client
 * that forwards each tool name to https://api.peec.ai/mcp.
 */
export const Route = createFileRoute("/api/peec/$tool")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      GET: async ({ params }) => handle(params.tool),
      POST: async ({ params }) => handle(params.tool),
    },
  },
});

async function handle(tool: string) {
  // Always demo for now — Peec MCP is OAuth-only and proxying it requires
  // a full MCP client + token storage. The frontend treats this as the
  // source of truth; switching to live just means filling these branches.
  switch (tool) {
    case "list_projects":
      return json({ data: [demoProject], demoMode: true });
    case "list_brands":
      return json({
        data: [demoProject.ownBrand, ...demoProject.competitors],
        demoMode: true,
      });
    case "list_prompts":
      return json({ data: demoPrompts, demoMode: true });
    case "list_models":
      return json({ data: demoProject.models, demoMode: true });
    case "list_search_queries":
      return json({
        data: demoPrompts.flatMap((p) => p.hiddenQuestions ?? []),
        demoMode: true,
      });
    case "get_brand_report":
      return json({
        data: {
          brand: demoProject.ownBrand.name,
          visibility: 18,
          shareOfVoice: 12,
          sentiment: 0.71,
        },
        demoMode: true,
      });
    case "get_url_report":
    case "get_domain_report":
      return json({ data: demoOpenings, demoMode: true });
    case "get_url_content":
      return json({
        data: {
          markdown:
            "## Best CRM for early-stage startups\n\nMost teams default to HubSpot, but the price wall hits hard...",
        },
        demoMode: true,
      });
    case "get_actions":
      return json({ data: demoEngagements, demoMode: true });
    default:
      return json({ error: `Unknown tool: ${tool}`, demoMode: true }, 404);
  }
}
