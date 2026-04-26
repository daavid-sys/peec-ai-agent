# Peec AI Openings

**Win in AI Search. Reclaim the visibility your brand is losing.**

AI engines like ChatGPT, Perplexity, Gemini, and Claude are reshaping how buyers discover products. They don't return ten blue links — they synthesize answers from a handful of sources. If your brand isn't in those sources, you don't exist.

**Peec AI Openings** is an autonomous agent that finds where your brand is missing from AI-indexed content — and generates source-specific actions to close the gap.

Built on the [Peec AI MCP](https://peec.ai) platform. Developed at the **Big Berlin Hackathon — April 2026** by team **KitKat Bulls**.

---

## The Problem

Traditional SEO doesn't work for AI search. AI engines read a curated set of sources — Reddit threads, comparison articles, listicles, editorial reviews — and synthesize them into a single answer. If your competitors are mentioned in those sources and you're not, you lose the deal before it starts.

Most teams don't know which sources AI engines cite, where their gaps are, or what content would fix them. Manual auditing is slow, and the landscape changes constantly.

## What Peec AI Openings Does

The agent runs a 4-step workflow — from discovery to measurable impact:

### Step 0 — Choose a Prompt

The landing screen surfaces your highest-opportunity prompts — the exact queries where AI engines are citing competitors but not you. Each prompt shows real-time metrics: your current visibility score, competitor visibility, the gap, and an opportunity score.

A history sidebar tracks prompts you've already worked, with inline progress (e.g., "5 / 12 drafts ready"), so you can pick up where you left off.

### Step 1 — Action Plan

The agent scans every source that AI engines cite for your prompt and identifies **openings** — specific, actionable gaps where your brand is missing. Each opening shows:

- The exact source URL and host domain
- The content channel (Reddit, LinkedIn, YouTube, Medium, editorial, listicle, comparison page, owned blog, forum)
- Which competitors are already mentioned
- A risk and impact score

Filter by platform or competitor. Watch in real time as the agent classifies and scores new openings.

### Step 2 — Agent Drafts Content

The agent generates platform-native drafts for every opening. Not generic text — each draft matches the format and tone of its target:

- A Reddit comment that fits naturally into an existing thread
- A LinkedIn post with the right structure and hooks
- A guest post pitch email with subject line and body
- A blog article ready for CMS publish

Swipe through drafts in a card-based UI with live platform previews. The agent works in the background — a progress bar shows what's ready, what's drafting, and what's next. Keyboard navigation and thumbnail rails let power users move fast.

### Step 3 — Review and Publish

Every draft becomes an actionable task, presented in a format specific to its type:

- **Email pitches** — full email preview with subject, body, and recipient
- **CMS publishes** — article preview with metadata, ready for one-click publish to Contentful
- **Platform posts** — native-format previews for Reddit, LinkedIn, Product Hunt, and more

Mark tasks complete as you go. The queue tracks your progress and transitions to results when you're done.

### Step 4 — Track Results

See the impact. The results screen shows:

- **Current visibility** — your brand's citation rate across all query fanouts
- **Projected visibility** — the expected lift based on completed actions
- **Expected lift** — concrete percentage-point gains, capped realistically by competitor ceilings

Drill into per-source progress bars to see which channels moved the needle most.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [TanStack Start](https://tanstack.com/start) + [React 19](https://react.dev) |
| Routing | [TanStack Router](https://tanstack.com/router) with type-safe routes |
| State | [TanStack Query](https://tanstack.com/query) + localStorage persistence |
| Database | [Supabase](https://supabase.com) (PostgreSQL) |
| UI | [Radix UI](https://www.radix-ui.com) + [Tailwind CSS v4](https://tailwindcss.com) + [Framer Motion](https://www.framer.com/motion/) |
| CMS | [Contentful](https://www.contentful.com) integration for publish actions |
| AI Platform | [Peec AI MCP](https://peec.ai) — Model Context Protocol |
| Deployment | [Cloudflare Workers](https://workers.cloudflare.com) via Vite |
| Language | TypeScript 5.8, end-to-end type safety |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Client (React 19)                 │
│  /prompts → /openings → /studio → /queue → /results │
│         TanStack Router · Framer Motion              │
├─────────────────────────────────────────────────────┤
│               Server Functions (TanStack Start)      │
│  getPromptRecommendation · getOpeningsOverview       │
│  getStudioDrafts · getActionPlan · enqueueOpenings   │
├─────────────────────────────────────────────────────┤
│     Peec AI MCP            │      Supabase           │
│  Source analysis           │  prompts                │
│  Gap detection             │  action_openings        │
│  Draft generation          │  sources                │
│  Impact scoring            │  action_drafts          │
├─────────────────────────────────────────────────────┤
│              Cloudflare Workers (Edge)               │
└─────────────────────────────────────────────────────┘
```

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (v1.1+)
- A Supabase project with the required schema
- Peec AI MCP API access

### Install and Run

```bash
# Clone the repository
git clone https://github.com/your-org/peec-ai-agent.git
cd peec-ai-agent

# Install dependencies
bun install

# Start the dev server
bun run dev
```

The app will be available at `http://localhost:5173`.

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## Project Structure

```
src/
├── routes/              # File-based routing (TanStack Router)
│   ├── prompts.tsx      # Prompt discovery & selection
│   ├── openings.tsx     # Content gap analysis
│   ├── studio.tsx       # AI draft generation & review
│   ├── queue.tsx        # Task execution & publishing
│   └── results.tsx      # Impact tracking & metrics
├── components/          # Reusable UI components
│   ├── ui/              # Radix-based primitives (Button, Card, Badge, etc.)
│   ├── prompts/         # Prompt table, recommendation hero, metrics
│   ├── openings/        # Gap cards, filter chips, status badges
│   ├── studio/          # Draft cards, platform previews, swipe UI
│   ├── queue/           # Task cards, email/CMS/platform previews
│   └── results/         # KPI cards, progress bars, task lineage
├── lib/                 # Server functions, Supabase client, utilities
├── store/               # App state management
└── assets/              # Logos and static assets
```

---

## Key Design Decisions

- **Platform-native previews** — Drafts render in the visual format of their target platform (Reddit thread, LinkedIn post, email template), not as generic markdown. This lets users evaluate content in context before publishing.

- **Keyboard-first navigation** — Arrow keys, swipe gestures, and thumbnail rails make it possible to review 24+ drafts without touching the mouse.

- **Real-time agent feedback** — Background polling with TanStack Query keeps every screen live. Users watch openings get classified, drafts get generated, and progress bars fill — no manual refresh needed.

- **Concrete ROI** — The results page doesn't show vanity metrics. It shows percentage-point visibility lift, capped by realistic competitor ceilings, broken down by source.

- **Channel taxonomy** — The system understands 11 distinct content channels (Reddit, LinkedIn, YouTube, Medium, editorial, listicle, comparison, owned blog, forums, Twitter/X, and more), each with tailored engagement templates.

---

## Team

**KitKat Bulls** — Big Berlin Hackathon, April 2026

---

## License

This project was built during a hackathon and is provided as-is for demonstration purposes.
