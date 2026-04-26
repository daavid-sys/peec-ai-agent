import { createFileRoute } from "@tanstack/react-router";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json",
};

/**
 * Tavily extract fallback — used when Peec's get_url_content returns nothing.
 * Reads TAVILY_API_KEY from env. Returns demo markdown when unset.
 */
export const Route = createFileRoute("/api/tavily/extract")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      POST: async ({ request }) => {
        const { url } = (await request.json().catch(() => ({}))) as {
          url?: string;
        };
        if (!url) {
          return new Response(JSON.stringify({ error: "url is required" }), {
            status: 400,
            headers: cors,
          });
        }

        const key = process.env.TAVILY_API_KEY;
        if (!key) {
          return new Response(
            JSON.stringify({
              demoMode: true,
              url,
              markdown: `# Demo extract for ${url}\n\nFounders complain HubSpot becomes expensive past 10 seats. Multiple commenters mention they need flexible relationship models, not pipeline templates.`,
            }),
            { headers: cors },
          );
        }

        try {
          const r = await fetch("https://api.tavily.com/extract", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ api_key: key, urls: [url] }),
          });
          const data = await r.json();
          return new Response(JSON.stringify({ demoMode: false, ...data }), {
            headers: cors,
          });
        } catch (e) {
          return new Response(
            JSON.stringify({ demoMode: true, error: String(e) }),
            { status: 500, headers: cors },
          );
        }
      },
    },
  },
});
