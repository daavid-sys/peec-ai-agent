## Goal

Replace the 4-column Kanban on `/queue` with a single linear **task queue** that mirrors the studio's preview UX. Each task has a dynamic title and an action card matched to the kind of work needed.

## Three task types (auto-classified per draft)

We classify each draft using `channel`, `source.domain`, and the project's own domain:

1. **Pitch via email** — for sources we don't control (competitor blogs, third-party editorial, listicles, comparison sites, YouTube creators).
   - Title pattern: `Email <domain> editor to pitch insertion`
   - Action card: rendered email draft (To / Subject / Body) with **attachments chips** (auto-generated: `pitch-brief.md`, `draft.md`, `data-points.csv`)
   - Buttons: **Export all (.zip)**, **Copy email**, **Mark as sent**

2. **Publish to owned blog (Contentful)** — for sources on the project's own domain that are blog/editorial content.
   - Title pattern: `Publish "<title>" to <ownDomain>`
   - Action card: full article preview (title, intro, body) styled like a CMS preview
   - Buttons: **Connect to Contentful to publish** (primary, calls `standard_connectors--connect` flow on click; once linked, swaps to **Publish to Contentful**), **Copy markdown**, **Mark as published**

3. **Post on platform** — for Reddit, LinkedIn, X, YouTube, Medium, forums, owned listicle/comparison pages we run, etc.
   - Title pattern dynamic per channel: `Post Reddit reply on r/<sub>`, `Publish LinkedIn post`, `Reply on <host>`, etc.
   - Action card: existing `PlatformReplica` (Reddit/LinkedIn/Editorial/Listicle/Comparison) — already platform-native
   - Buttons: **Copy draft**, **Open <platform>**, **Mark as posted**

## Layout (mirrors studio)

```text
┌─────────────────────────────────────────────────────────┬─────────────┐
│  H1: Review & publish                  [See results →]  │             │
├─────────────────────────────────────────────────────────┤             │
│  Progress: 3 / 26 · 5 done  ━━━━━━━━━━━━━━━            │             │
├─────────────────────────────────────────────────────────┤   Side      │
│  [<]  TASK CARD                                   [>]   │   panel     │
│       ─────────                                          │  (brief,    │
│       <dynamic title>                                    │   source,   │
│       <action card: email | cms preview | replica>      │   up next)  │
│       <action buttons>                                   │             │
│  Thumbnail rail (task-type icons)                       │             │
└─────────────────────────────────────────────────────────┴─────────────┘
```

Same swipe animation, keyboard nav, completed tracking, and `localStorage` persistence as `/studio`.

## Implementation

**New files**
- `src/lib/task-type.ts` — `classifyTask(draft, ownDomain) -> 'email_pitch' | 'cms_publish' | 'platform_post'` plus `getTaskTitle(draft, type)` for dynamic titles per channel/host.
- `src/components/task-cards/email-pitch-card.tsx` — email composer view (To/Subject/Body), attachment chips with file icons, Export-all (.zip) button using `JSZip` (already light) or a simple multi-download fallback; auto-generates the 3 attachment blobs from `draft.fullDraft`, `draft.brief`, and a CSV of competitor mentions.
- `src/components/task-cards/cms-publish-card.tsx` — article preview (cover header bar, H1, lead paragraph, body markdown rendered) with Contentful connect/publish button. On click invokes a stub `connectContentful()` that the host UI hooks into the existing connector flow.
- `src/components/task-cards/platform-post-card.tsx` — thin wrapper around existing `PlatformReplica` with the platform-specific CTA row.
- `src/components/task-cards/task-shell.tsx` — shared chrome (title row, swipe container) so all three feel uniform.

**Edited files**
- `src/routes/queue.tsx` — full rewrite: drop the 4-column Kanban; reuse studio's drafts source (`getStudioDrafts`) so the queue == the same backlog post-approval; render the task shell + classified card; wire side panel similar to studio.
- `src/components/platform-replicas.tsx` — no logic changes; we'll just continue to render existing platform replicas inside `platform-post-card`.

**Dependencies**
- Add `jszip` for the email "Export all" zip bundle (small, edge-safe, used client-side only).

## Notes on Contentful "connect"

Per platform conventions we don't pop the connector dialog from arbitrary buttons — we trigger via a presentation action. The CMS card's primary button will:
- If `import.meta.env.VITE_LOVABLE_CONNECTOR_CONTENTFUL_SPACE_ID` is set → label becomes **Publish to Contentful** and calls a server function stub (`publishToContentful`) that posts the draft as a new entry to the Contentful Delivery API gateway.
- Otherwise → label is **Connect Contentful to publish** and shows a toast instructing the user to open Connectors → Contentful (no auto-popup from a button click).

After approval I'll wire the actual connect flow via `standard_connectors--connect` when the user first clicks it.

## Out of scope (this pass)

- Real email sending (requires email infra setup) — we generate the .eml/.zip bundle for the user to forward.
- Real Contentful publishing handler — scaffolded as a stub; once the user clicks "Connect" we'll add the connector + server function.