/**
 * Collapse duplicate `action_openings` rows that target the same page with the
 * same action but a different `competitor`. Multiple competitors can be
 * addressed in one post — they shouldn't surface as N separate cards.
 *
 * Group key: `(source_id ?? "no-source") :: action_type`.
 *
 * Why not group on title? Titles are LLM-generated and drift across competitor
 * copies (e.g. "Why HubSpot…" vs "Why Salesforce…") — `action_type + source`
 * is the structural unit ("one blog pitch on this page"). Title differences
 * are decoration; the action and the page are the real identity.
 *
 * Each merged item picks the highest-impact row as canonical, and concatenates
 * every distinct competitor (canonical first, then others by impact desc).
 */
export type DedupeOpeningInput = {
  id: string;
  source_id: string | null;
  action_type: string;
  competitor: string | null;
  impact_score: number | null;
  // Anything else the caller wants to keep is preserved on the canonical row.
};

export type DedupeOpeningOutput<T extends DedupeOpeningInput> = {
  canonical: T;
  competitors: string[];
  /** All row ids in this group (canonical first). Useful for joining drafts. */
  groupIds: string[];
};

export function dedupeOpenings<T extends DedupeOpeningInput>(
  rows: T[],
): DedupeOpeningOutput<T>[] {
  const groups = new Map<string, T[]>();
  for (const r of rows) {
    const key = `${r.source_id ?? "no-source"}::${r.action_type}`;
    const arr = groups.get(key) ?? [];
    arr.push(r);
    groups.set(key, arr);
  }

  const out: DedupeOpeningOutput<T>[] = [];
  for (const arr of groups.values()) {
    // Highest impact first (stable for ties).
    arr.sort((a, b) => (b.impact_score ?? 0) - (a.impact_score ?? 0));
    const canonical = arr[0];
    const competitors: string[] = [];
    const seen = new Set<string>();
    for (const r of arr) {
      const c = r.competitor?.trim();
      if (!c) continue;
      const key = c.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      competitors.push(c);
    }
    out.push({
      canonical,
      competitors,
      groupIds: arr.map((r) => r.id),
    });
  }

  // Preserve overall impact ordering of the canonical rows.
  out.sort(
    (a, b) =>
      (b.canonical.impact_score ?? 0) - (a.canonical.impact_score ?? 0),
  );
  return out;
}
