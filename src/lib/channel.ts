// Shared channel taxonomy used by /openings overview and /studio replicas.

export type Channel =
  | "reddit"
  | "linkedin"
  | "youtube"
  | "twitter"
  | "medium"
  | "editorial"
  | "listicle"
  | "comparison"
  | "owned"
  | "forum"
  | "other";

export type ChannelMeta = {
  id: Channel;
  label: string;
  description: string;
  /** oklch color tokens are not available here; use semantic CSS vars. */
  accent: string;
};

export const CHANNELS: Record<Channel, ChannelMeta> = {
  reddit: {
    id: "reddit",
    label: "Reddit",
    description:
      "Comment & post drafts that sit inside live Reddit threads AI engines already cite.",
    accent: "#FF4500",
  },
  linkedin: {
    id: "linkedin",
    label: "LinkedIn",
    description: "Long-form posts and comment angles for LinkedIn editorial.",
    accent: "#0A66C2",
  },
  youtube: {
    id: "youtube",
    label: "YouTube",
    description: "Pinned comments and outreach for cited YouTube videos.",
    accent: "#FF0000",
  },
  twitter: {
    id: "twitter",
    label: "X / Twitter",
    description: "Reply drafts on cited tweets and threads.",
    accent: "#000000",
  },
  medium: {
    id: "medium",
    label: "Medium",
    description: "Editorial articles tuned for Medium's distribution.",
    accent: "#000000",
  },
  editorial: {
    id: "editorial",
    label: "Editorial / Blog",
    description: "Guest pitches and bylined articles for cited blogs and pubs.",
    accent: "#7c3aed",
  },
  listicle: {
    id: "listicle",
    label: "Listicles",
    description:
      "Insertions into 'best of' lists that AI engines retrieve to compare brands.",
    accent: "#0891b2",
  },
  comparison: {
    id: "comparison",
    label: "Comparison pages",
    description:
      "Alternative / vs pages where competitors already appear without you.",
    accent: "#0d9488",
  },
  owned: {
    id: "owned",
    label: "Owned content",
    description: "New pages on your own domain to capture branded fan-outs.",
    accent: "#16a34a",
  },
  forum: {
    id: "forum",
    label: "Forums & UGC",
    description: "Discussion-board threads, niche communities and Q&A sites.",
    accent: "#ea580c",
  },
  other: {
    id: "other",
    label: "Other",
    description: "Openings that don't fit a single channel template.",
    accent: "#64748b",
  },
};

const HOST_OVERRIDES: Array<{ test: RegExp; channel: Channel }> = [
  { test: /(^|\.)reddit\.com$/i, channel: "reddit" },
  { test: /(^|\.)linkedin\.com$/i, channel: "linkedin" },
  { test: /(^|\.)youtube\.com$/i, channel: "youtube" },
  { test: /(^|\.)youtu\.be$/i, channel: "youtube" },
  { test: /(^|\.)twitter\.com$/i, channel: "twitter" },
  { test: /(^|\.)x\.com$/i, channel: "twitter" },
  { test: /(^|\.)medium\.com$/i, channel: "medium" },
  { test: /(^|\.)substack\.com$/i, channel: "medium" },
  { test: /(^|\.)quora\.com$/i, channel: "forum" },
  { test: /(^|\.)stackoverflow\.com$/i, channel: "forum" },
  { test: /(^|\.)hackernews\.ycombinator\.com$/i, channel: "forum" },
];

export function classifyChannel(input: {
  actionType: string | null | undefined;
  classification?: string | null;
  domain?: string | null;
  ownDomain?: string | null;
}): Channel {
  const domain = (input.domain ?? "").toLowerCase();
  const action = (input.actionType ?? "").toLowerCase();
  const cls = (input.classification ?? "").toLowerCase();

  if (input.ownDomain && domain && domain.endsWith(input.ownDomain.toLowerCase())) {
    return "owned";
  }

  for (const o of HOST_OVERRIDES) if (o.test.test(domain)) return o.channel;

  if (action.includes("reddit")) return "reddit";
  if (action.includes("linkedin")) return "linkedin";
  if (action.includes("youtube")) return "youtube";
  if (action.includes("tweet") || action.includes("twitter")) return "twitter";
  if (action === "owned_listicle") return "listicle";
  if (action === "alternative_page") return "comparison";
  if (action === "blog_pitch" || action === "guest_post") return "editorial";

  if (cls === "listicle") return "listicle";
  if (cls === "comparison" || cls === "alternative") return "comparison";
  if (cls === "discussion") return "forum";
  if (cls === "article" || cls === "how_to_guide") return "editorial";

  return "other";
}
