## Simplify /openings around the 4 things that matter

The page should answer at a glance:
1. **What gap** — what's missing
2. **From what source** — the cited URL/page
3. **Vs who** — which competitor is winning there
4. **What platform** — domain + channel (G2, Reddit, YouTube, blog, …)

Right now the page stacks: 4 summary tiles, then a channel accordion, then per-row expansions to reveal source/competitor/brief. The hierarchy hides exactly the four things that matter — the user has to expand twice to see a competitor or source.

### New layout — one flat, visual gap board

```text
┌────────────────────────────────────────────────────────────────┐
│  Content gaps for "best CRM for small teams"                   │
│  12 gaps · 8 sources · 5 competitors                  [Next →] │
└────────────────────────────────────────────────────────────────┘

┌─ Filter chips ─────────────────────────────────────────────────┐
│  All (12)  G2 (4)  Reddit (3)  YouTube (3)  Blogs (2)          │
│  vs HubSpot (5) · Salesforce (4) · Pipedrive (3)               │
└────────────────────────────────────────────────────────────────┘

┌──────────────────────┬──────────────────────┬─────────────────┐
│ 🟦 g2.com · Listicle │ 🟧 reddit · Discus.. │ 🟥 youtube · Rv │
│ "Top 10 CRMs 2024"   │ "What CRM do you..." │ "HubSpot review"│
│                      │                      │                 │
│ vs 🅷 HubSpot        │ vs 🅿 Pipedrive      │ vs 🆂 Salesforce│
│                      │                      │                 │
│ Gap: you're absent;  │ Gap: 14 mentions of  │ Gap: 1 video w/ │
│ HubSpot mentioned 3× │ Pipedrive, 0 of you  │ 240k views, no  │
│                      │                      │ mention of you  │
│                      │                      │                 │
│ Impact 87 · Draft ✓  │ Impact 74 · Drafting │ Impact 69 · ✓   │
│                                                                │
│ [Open draft →]       │ [Open draft →]       │ [Open draft →]  │
└──────────────────────┴──────────────────────┴─────────────────┘
   …more cards in a 3-col grid…
```

### Card anatomy — every gap, same shape

One card per opening (no double-nesting, no accordion-inside-accordion):

- **Header line:** platform favicon + bare domain + classification chip (`Listicle`, `Discussion`, `Review`, `How-to`, …). This is the "what platform" answer.
- **Source title** — the actual page title, links out to the URL on hover/click of an external-link icon. This is the "from what source" answer.
- **vs row** — competitor favicon + name (the row already has `opening.competitor`). This is the "vs who" answer.
- **Gap line** — one short sentence describing the gap (reuse `opening.rationale`, trimmed to ~140 chars). This is the "what gap" answer.
- **Footer:** impact score + draft-status pill + a single primary action: `Open draft →` (or `Drafting…` when not ready). No source excerpt, no separate brief panel, no "Why this is an opening" header.

All visual weight goes to the 4 answers. Everything else (excerpt, full brief, scrape) moves to the studio/draft page where it already lives.

### Filtering — one row of chips replaces the accordion

Above the grid, a single chip row:
- **By platform/channel:** `All · G2 · Reddit · YouTube · Blogs · …` — counts in parens, derived from `overview.groups`.
- **By competitor:** `vs HubSpot · vs Salesforce · vs Pipedrive` — derived from `opening.competitor` across all openings.

Selecting chips filters the grid client-side. No accordion state, no expand/collapse, no nested grouping. The grouping is now a filter, not a layout.

### Header strip — collapse the 4 tiles into one line

Replace the 4 SummaryTile cards with a single subtitle line under the heading:
> `12 gaps · 8 sources · 5 competitors · {readyCount}/{total} drafts ready`

If the agent is still drafting, append a small `Loader2` + `n drafting`. Same data, 90% less screen.

The big `Next →` button stays top-right, unchanged.

### What gets removed

- `SummaryStrip` + 4 `SummaryTile` cards → replaced by the one-line subtitle.
- `Accordion` / `AccordionItem` / `ChannelGroupCard` / `ChannelBadge` → replaced by chip filters + flat grid.
- `OpeningRow` expand-on-click panel → no expansion; the card already shows the 4 answers.
- "Cited source" / "Why this is an opening" / "Draft brief" sub-panels → moved entirely to the draft page (already exists at `/queue/draft/$id` and `/studio`).
- `BriefSkeleton` only-on-expand state → cards just show a draft-status pill.

### What stays

- Background drafting + polling loop (`enqueueOpeningDrafts` + `load()` on a timeout). Untouched.
- `getOpeningsOverview` server function and its return shape. Untouched — we just render it differently.
- `Favicon`, `Card`, `Badge`, `Button`, channel colors from `CHANNELS`. Reused.
- The "Back to prompts" link at the bottom.

### Files to edit

- `src/routes/openings.tsx` — rewrite the body of `OpeningsPage` (lines 125–187) and delete `SummaryStrip`, `SummaryTile`, `ChannelSkeleton`, `ChannelGroupCard`, `ChannelBadge`, `OpeningRow`. Add:
  - `GapCard` — the new flat card described above.
  - `GapCardSkeleton` — single-card skeleton (replace `ChannelSkeleton`).
  - `FilterChips` — derives platform + competitor chips from the overview, manages a single `{ channel: Channel | "all", competitor: string | "all" }` filter state.
- `src/lib/channel.ts` — no change; we keep `CHANNELS[channel].accent` for the platform chip color.
- No DB / server-function / dependency changes.

### Out of scope

- Studio + draft pages stay as they are (full brief lives there).
- We're not changing how openings are generated or scored.

### Open question

Grid density: **3 columns on desktop** (richer cards, ~9 visible above fold) or **4 columns** (tighter, more scannable, less per-card text)? Recommendation: 3 columns — keeps the gap sentence readable, which is the headline of each card.