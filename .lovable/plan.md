# Peec AI Openings — Hackathon MVP Plan

A premium B2B SaaS web app that turns Peec AI visibility data into concrete, source-specific actions. Pitch: **"Peec measures AI visibility. Openings helps you act on it."**

The judges should feel a clear narrative in 2 minutes: connect → recommend the prompt to fix → reveal the exact sources causing the loss → show openings → generate source-specific drafts → approve → close the loop.

## What we're building (user journey)

8 screens, laptop-first, light theme, shadcn/ui:

1. **Connect** — hero card, single CTA "Connect Peec AI". OAuth handshake (or Demo Mode toggle).
2. **Project** — project picker → summary (own brand, competitors, models, prompt count, last sync).
3. **Prompt Opportunities** — auto-ranked table + a hero "Best prompt to fix first" card with Opportunity Score breakdown and an explicit override option.
4. **Openings Map** — two-column layout: source opening cards (left) + selected opening detail (right). Summary strip at top.
5. **Source X-Ray** — the wow screen. Why AI trusts this source, brand mention counts, pain signals, missing proof, recommended engagement.
6. **Engagement Studio** — generated source-specific drafts (Reddit comment, editorial pitch, FAQ schema/JSON-LD, YouTube creator pitch, review campaign brief) with quality checks (disclosure, anti-slop score, self-promo risk).
7. **Approval Queue** — Kanban: Ready / Needs input / Blocked. Copy, mark sent, send to approval.
8. **Results** — before/after visibility cards that close the loop back to Peec.

The recommendation card uses founder language ("You're losing badly to HubSpot, but the sources are open enough to fix") and exposes the Opportunity Score formula in a tooltip.

## Demo data (always works on stage)

Hardcoded scenario: **Attio vs HubSpot & Salesforce**, recommended prompt *"HubSpot alternatives for startups"*, 5 fully-fleshed openings (Reddit r/SaaS, SaaS listicle, G2 page, YouTube review, Wikipedia=blocked) with realistic drafts. A visible **"Demo mode"** badge appears whenever live data isn't used.

## Live integration approach

The Peec MCP uses OAuth 2.0 + Streamable HTTP at `https://api.peec.ai/mcp` and is built for AI assistants (Claude, Cursor) — not direct browser calls. We'll wrap it with TanStack Start server routes that act as an MCP client:

- `/api/peec/*` server routes proxy MCP tool calls (`list_projects`, `list_prompts`, `get_brand_report`, `get_url_content`, `get_actions`, etc.). OAuth tokens stored server-side only.
- `/api/tavily/extract` — fallback source scraping when `get_url_content` is empty.
- `/api/agents/find-openings` and `/api/agents/generate-engagements` — Gemini-powered analysis: ingest scraped source markdown + brand list, output structured openings and drafts. Uses Lovable AI Gateway (`google/gemini-2.5-flash`).
- If MCP OAuth isn't completed, every endpoint transparently returns the demo dataset and the UI shows the Demo badge.

This satisfies the partner-tech requirement: **Peec AI MCP + Tavily + Lovable AI Gateway (Gemini)** = 3 partner technologies. Pioneer/Aikido can be added as side-challenge bonuses if time permits.

## Design system

- Light mode default. Background `oklch(0.99 0 0)`, cards pure white, borders soft gray, text near-black.
- Single subtle accent: a quiet violet (`oklch(0.55 0.18 285)`) used only for primary CTAs, score bars, and selected states.
- Generous whitespace, sharp 8px radii, no gradients, no neon. Inter for UI, JetBrains Mono for scores/URLs.
- Heavy shadcn use: Card, Button, Badge, Table, Tabs, Dialog, Sheet, Dropdown, Command, Tooltip, Progress, Separator, Accordion, Sonner toasts.
- Status badge palette: best_opportunity (violet), critical_gap (red), quick_win (emerald), high_impact (amber), already_strong (slate), low_priority (muted).

## Technical details

**Stack:** TanStack Start (existing), React 19, TypeScript, Tailwind v4, shadcn/ui, lucide-react, Sonner. Routes:

```text
src/routes/
  index.tsx              → Connect screen + marketing hero
  project.tsx            → Project picker + summary
  prompts.tsx            → Prompt Opportunities (best-prompt card + table)
  openings.tsx           → Openings Map (two-column with Sheet for X-Ray on mobile)
  studio.tsx             → Engagement Studio
  queue.tsx              → Approval Queue (kanban)
  results.tsx            → Results / loop back
  api/peec/*.ts          → MCP proxy server routes
  api/tavily/extract.ts  → Tavily fallback
  api/agents/*.ts        → Gemini-powered openings + draft generation
```

**State:** Lightweight Zustand store (`useAppStore`) holding selected project, selected prompt, openings list, drafts, queue. Demo mode flag derived from whether `/api/peec/projects` returned live data.

**TS interfaces** as specified in the brief: `Project`, `PromptOpportunity`, `Opening`, `Engagement`, `QualityCheck` — defined in `src/lib/types.ts` and shared between client and server routes.

**MCP client:** A tiny server-side helper in `src/server/peec.ts` that opens a Streamable HTTP MCP session, holds the OAuth token in a signed httpOnly cookie, and exposes typed wrappers for each tool. Every server route falls back to `src/lib/demo-data.ts` on any error.

**Secrets needed (will request after approval):**
- `LOVABLE_API_KEY` (auto for Gemini via AI Gateway)
- `TAVILY_API_KEY`
- Peec OAuth client credentials (or, for demo, a personal access token if Peec exposes one)

**Out of scope for MVP:** real publishing to Reddit/G2/YouTube (we surface "Copy" + "Mark sent"), persistent storage (in-memory + localStorage), multi-user accounts.

## Build order

1. Design tokens + shell (header with step indicator, footer, demo badge).
2. Types + demo data + Zustand store.
3. Screens 1–3 (Connect, Project, Prompt Opportunities) with full demo flow.
4. Screens 4–5 (Openings Map + Source X-Ray) — the wow moment.
5. Screen 6 (Engagement Studio) with generated drafts + quality checks.
6. Screens 7–8 (Approval Queue, Results).
7. Wire server routes: Gemini for opening detection + draft generation, Tavily extraction, Peec MCP proxy.
8. Polish: empty states, loading skeletons, toasts, keyboard shortcuts (Cmd-K command menu to jump screens).

Ship the demo-mode UI end-to-end first so we always have a working pitch, then layer live data.
