# Restructure the Openings flow UX

Goal: make the 5-step flow match the uploaded screenshots — calmer, more minimal, with a clear sequential header on every step and predictable Back/Next navigation.

## New flow at a glance

```text
/prompts          → "Your openings"          (landing — pick a prompt)
/openings         → "Step 1: Action plan"
/studio           → "Step 2: Agent is working"
/queue            → "Step 3: Review and publish"
/results          → "Step 4: Track Results"
```

The existing routes stay; only their headers, navigation, and (for `/prompts`) layout change.

---

## Screen 1 — `/prompts` "Your openings" (full redesign)

Replace the current dense layout (Brands table, QFOs table, "Why this prompt" reason cards) with the minimal mockup layout.

**Top of page**

- H1: "Your openings"
- Subtitle: "Turn signals into actions. Select a prompt you want to work on"

**Two-column hero (left ≈ 2fr, right ≈ 1fr)**

Left card — Recommended prompt:

- Small "Recommended prompt" eyebrow with sparkle icon
- The prompt text in large quotes with an external-arrow affordance
- 4-stat row: `Your visibility` · `{TopCompetitor} visibility` · `Visibility gap` · `Opportunity score`
- 3 mini cards: `Sources found` (with stacked source favicons) · `Query fanouts` · `Openings found`
- Big black CTA: **"Work on this prompt →"** — calls `store.selectPrompt(...)` then `navigate({ to: "/openings" })`

Right card — "Results of prompts you have worked on":

- Header text only (no subtitle)
- List of compact rows, each = a previously visited prompt (truncated quote + open-arrow)
- Clicking a row re-selects that prompt and routes to `/openings` so the user can step through the whole flow again
- Empty state: muted "Prompts you work on will appear here."

**Below the hero**

- Tabs: `Select a prompt` | `Search a prompt` (the existing `PromptsTable` rendered under the first tab; the second tab adds a simple text filter over the same rows)
- Selecting a row updates the hero in place (current behavior)

**Removed from this page**

- The big `BrandsTable` block
- The `QfosTable` block
- The "Why this prompt" reason cards grid
- `OpeningPreviewCard` / `OpeningPreviewSkeleton` (already unused after the previous edit)

These pieces stay in the codebase (other pages may reuse `BrandsTable`/`QfosTable` later) but are no longer rendered on `/prompts`.

## Screen 2 — `/openings` "Step 1: Action plan"

Mostly already there; tighten the chrome:

- Replace the current H1 ("Here are the openings we'll fix for you") with **"Step 1: Action plan"**
- Below the title, render the selected prompt text in a centered bordered pill (matches mockup)
- Top-right: keep the **Next →** button (routes to `/studio`)
- Top-left: **← Back to prompts** as a quiet text link
- Keep the Platform + Competitor chip rows and the gap-card grid as-is

## Screen 3 — `/studio` "Step 2: Agent is working"

- Add page header **"Step 2: Agent is working"**
- Top-left: **← Back to Action Plan** (`/openings`)
- Top-right: **Next →** (routes to `/queue`)
- Keep the existing swipeable platform-replica card and right-side brief panel

## Screen 4 — `/queue` "Step 3: Review and publish"

- Add page header **"Step 3: Review and publish"**
- Top-left: **← Back to Agent Working** (`/studio`)
- Top-right: **Next task →** (advances to next undone task; on last, routes to `/results`)
- Keep the existing email-pitch / CMS / platform task cards and right rail (Why this task / Targeting / Cited source)

## Screen 5 — `/results` "Step 4: Track Results"

- Replace current header with **"Step 4: Track Results"**
- Top-right: quiet text link **"Go back to Openings ↗"** → `/prompts`
- Selected prompt rendered in a bordered pill below the title
- Three KPI cards in a row: `Before visibility` · `Projected after 14 days` · `Visibility lift`
- Collapsible "Completed tasks" section (reuses the data we already pull from the studio drafts response + completed IDs from localStorage)
- Collapsible "All content drafted" section
- "Per-source progress" list with `0% → N%` thin progress bars per source

## Cross-cutting changes

**StepDots component** (`src/components/step-dots.tsx`)

- Update the `STEPS` array labels to: `Choose a prompt`, `Step 1 · Action plan`, `Step 2 · Agent working`, `Step 3 · Review & publish`, `Step 4 · Track Results`
- Numbering inside the component updates automatically

**Visited-prompts tracking** (new in `src/lib/store.ts`)

- Add `visitedPromptIds: string[]` to the store and a `markPromptVisited(id)` action
- Persist to `localStorage` under `peec:visited-prompts`
- Call `markPromptVisited(selected.id)` from the "Work on this prompt" CTA on `/prompts` and from the matching CTA on the recent-prompts list
- The right-hand "Results of prompts you have worked on" panel reads from this list, hydrating each id against `prompts` from the store for the displayed quote text

**No data/schema changes.** Everything reuses existing server functions (`getPromptRecommendation`, `getPromptTable`, `getOpeningsOverview`, `getStudioDrafts`).

---

## Technical notes

Files touched:

- `src/routes/prompts.tsx` — major rewrite of `PromptsPage` JSX; remove unused imports (`BrandsTable`, `QfosTable`, reason-card helpers, `OpeningPreviewCard`)
- `src/routes/openings.tsx` — header + back link copy
- `src/routes/studio.tsx` — add header + back/next bar
- `src/routes/queue.tsx` — add header + back/next bar (reuse existing next-task logic)
- `src/routes/results.tsx` — header copy, top-right back link, prompt pill
- `src/components/step-dots.tsx` — relabel steps
- `src/lib/store.ts` — add `visitedPromptIds` slice + persistence

No new dependencies, no migrations, no edge function changes.  
  
  
also at top right remove the steps navigation with circles and the chip saying "connected via MCP"