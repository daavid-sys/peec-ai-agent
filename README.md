# Peec AI Agent

**Live demo:** [peec-ai-agent.lovable.app](https://peec-ai-agent.lovable.app/)

**The agentic layer on top of Peec AI — turning visibility intelligence into action.**

[Peec AI](https://peec.ai) already tells you where your brand stands in AI search. It shows which sources AI engines cite, how often you're mentioned, and where the gaps are. That intelligence is powerful — but knowing isn't doing.

**Peec AI Agent** closes the loop. It takes the visibility gaps Peec surfaces and turns them into a full execution pipeline: prioritized openings, platform-native drafts, one-click publishing, and measurable impact — all driven by an autonomous agent that does the work for you.

Built for underdog brands that are outspent but not outsmarted. Built at the **Big Berlin Hackathon — April 2026** by team **KitKat Bulls**.

---

## Why This Matters

AI engines are replacing search. ChatGPT, Perplexity, Gemini, and Claude don't return ten blue links — they synthesize answers from a handful of trusted sources. If your brand isn't in those sources, you're invisible.

This is an existential problem for challenger brands. When someone asks an AI "What's the best CRM for startups?", the answer gets pulled from Reddit threads, comparison articles, listicles, and editorial reviews. The incumbents — HubSpot, Salesforce, Zoho, Pipedrive — dominate those sources through sheer content volume and brand inertia. A better product like [Attio](https://attio.com) can have a superior offering and still get zero mentions.

Traditional SEO won't fix this. You can't rank your way into an AI-synthesized answer. You need to be present in the specific sources that AI engines actually read — and you need to be there with the right content, in the right format, on the right platform.

That's what Peec AI Agent does. It's the GTM weapon that levels the playing field.

---

## From Intelligence to Action

Peec AI gives you the map. Peec AI Agent gives you the army.

The platform already provides deep visibility analytics — source-level citation tracking, competitor benchmarking, query fanout analysis. What was missing was the **execution layer**: an agent that takes those insights and acts on them autonomously.

Peec AI Agent extends the platform with:

- **Automated gap-to-action conversion** — every visibility gap becomes a specific, prioritized task
- **Platform-native content generation** — drafts that match the tone and format of each target channel
- **End-to-end workflow orchestration** — from discovery through review to publication and tracking
- **Measurable ROI** — concrete visibility lift tied to every action taken

This isn't a dashboard you stare at. It's an agent that works.

---

## How It Works

### Pick Your Battle

The agent surfaces the prompts where your brand has the most to gain — queries where AI engines heavily cite competitors but barely mention you. For Attio, that might be "best CRM for startups" or "HubSpot alternatives for small teams."

Each prompt shows real-time metrics: your current visibility, competitor visibility, the gap, and an opportunity score. A history sidebar tracks prompts you've already worked, with inline progress, so you can pick up where you left off or start a new campaign.

### Step 1 — Action Plan

The agent scans every source that AI engines cite for your chosen prompt and maps out the **openings** — specific, actionable places where your brand should be but isn't.

For Attio competing against HubSpot, this might surface:

- A Reddit thread comparing CRMs where HubSpot and Salesforce are mentioned but Attio isn't
- A "Top 10 CRM tools" listicle that includes every competitor except you
- A YouTube review where your category is discussed but your product is absent
- A comparison blog post that pits HubSpot vs. Salesforce but never considers Attio

Each opening shows the exact source URL, which competitors are present, the content channel type, and an impact score. Filter by platform or competitor. Watch in real time as the agent classifies and scores new gaps.

### Step 2 — Agent Drafts Content

The agent generates platform-native drafts for every opening. Not generic marketing copy — each draft is tailored to its target:

- A **Reddit comment** that naturally introduces Attio into a live CRM comparison thread, matching the community's tone
- A **LinkedIn post** positioning Attio's founder perspective against incumbent narratives
- A **guest post pitch email** to the editor of a SaaS review site, with subject line, body, and angle
- A **blog article** ready for CMS publish, structured as a comparison piece or feature deep-dive

Swipe through drafts in a card-based UI with live platform previews — see exactly how your Reddit comment will look in a thread, how your LinkedIn post will render in the feed. The agent works in the background, and a progress bar shows what's ready, what's drafting, and what's next.

### Step 3 — Review and Publish

Every draft becomes an actionable task, presented in the format of its destination:

- **Email pitches** — full email preview with subject, body, and recipient, ready to send
- **CMS publishes** — article preview with metadata, one-click publish to Contentful
- **Platform posts** — native-format previews for Reddit, LinkedIn, Product Hunt, and more

Mark tasks complete as you execute them. The queue tracks progress and transitions to results when you're done.

### Step 4 — Track Results

See the impact of every action. The results screen shows:

- **Current visibility** — your brand's citation rate across all AI query fanouts
- **Projected visibility** — expected lift based on completed actions
- **Expected lift** — concrete percentage-point gains, capped realistically by competitive ceilings

For Attio, this might mean going from 12% visibility to 24% on "best CRM for startups" — closing half the gap to HubSpot by being present in 8 sources that previously didn't mention them.

Drill into per-source progress to see which channels moved the needle most.

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
├──────────────────────┬──────────────────────────────┤
│    Peec AI MCP       │         Supabase              │
│  Source analysis     │  prompts · sources            │
│  Gap detection       │  action_openings              │
│  Draft generation    │  action_drafts                │
│  Impact scoring      │                               │
├──────────────────────┴──────────────────────────────┤
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
git clone https://github.com/your-org/peec-ai-agent.git
cd peec-ai-agent

bun install
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
│   ├── openings.tsx     # Content gap analysis & action plan
│   ├── studio.tsx       # Autonomous draft generation & review
│   ├── queue.tsx        # Task execution & publishing
│   └── results.tsx      # Impact tracking & visibility metrics
├── components/          # UI components
│   ├── ui/              # Radix-based primitives
│   ├── prompts/         # Recommendation hero, metrics, prompt table
│   ├── openings/        # Gap cards, filters, status badges
│   ├── studio/          # Draft cards, platform previews, swipe UI
│   ├── queue/           # Task cards, email/CMS/platform templates
│   └── results/         # KPI cards, progress bars, task lineage
├── lib/                 # Server functions, Supabase client, utilities
├── store/               # App state management
└── assets/              # Logos and static assets
```

---

## What Makes This Different

**Peec AI already wins at intelligence.** It maps the AI search landscape better than anything else. Peec AI Agent is the natural next step — it takes that intelligence and makes it executable.

Most visibility tools stop at the dashboard. They show you charts and leave you to figure out what to do. Peec AI Agent doesn't. It identifies the exact opening, generates the exact content, previews it in the exact format of the target platform, and tracks the exact lift when you publish it.

For a brand like Attio — a better product fighting against entrenched incumbents with 100x the content budget — this is the difference between knowing you have a visibility problem and actually solving it. One prompt at a time, one source at a time, until the AI engines can't ignore you.

---

## Team

**KitKat Bulls** — Big Berlin Hackathon, April 2026

---

## License

This project was built during a hackathon and is provided as-is for demonstration purposes.
