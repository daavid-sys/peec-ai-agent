// Classifies each studio draft into the kind of task the operator must do.
// - email_pitch: source we don't control (competitor blog, third-party
//   editorial, listicle/comparison site, YouTube creator). We package up
//   the pitch as an email + attachments and the operator forwards it.
// - cms_publish: page on the user's OWN domain (e.g. attio.com/blog/...).
//   We render the article preview + a Contentful publish button.
// - platform_post: native platform we (or our team) operate manually:
//   Reddit reply, LinkedIn post, X reply, Medium article, forum reply.
//   We render the existing platform replica.

import type { Channel } from "@/lib/channel";
import type { StudioDraft } from "@/lib/server/get-studio-drafts";

export type TaskType = "email_pitch" | "cms_publish" | "platform_post";

const NATIVE_PLATFORM_CHANNELS: ReadonlySet<Channel> = new Set<Channel>([
  "reddit",
  "linkedin",
  "twitter",
  "youtube",
  "medium",
  "forum",
]);

const PITCH_CHANNELS: ReadonlySet<Channel> = new Set<Channel>([
  "editorial",
  "listicle",
  "comparison",
]);

function hostMatchesOwnDomain(host: string | null, ownDomain: string | null) {
  if (!host || !ownDomain) return false;
  const h = host.toLowerCase().replace(/^www\./, "");
  const d = ownDomain.toLowerCase().replace(/^www\./, "");
  return h === d || h.endsWith(`.${d}`);
}

export function classifyTask(
  draft: Pick<StudioDraft, "channel" | "source">,
  ownDomain: string | null,
): TaskType {
  const host = draft.source.domain;
  const isOwn = hostMatchesOwnDomain(host, ownDomain);

  // Anything on our own domain → CMS publish (we control it).
  if (isOwn || draft.channel === "owned") return "cms_publish";

  // Native social/community platforms we post to ourselves.
  if (NATIVE_PLATFORM_CHANNELS.has(draft.channel)) return "platform_post";

  // Editorial/listicle/comparison on someone else's domain → email pitch.
  if (PITCH_CHANNELS.has(draft.channel)) return "email_pitch";

  // Default: if we have a source but no channel match, treat as email pitch.
  return draft.source.url ? "email_pitch" : "platform_post";
}

function bareHost(host: string | null): string {
  if (!host) return "the editor";
  return host.toLowerCase().replace(/^www\./, "");
}

function redditSubreddit(url: string | null): string | null {
  if (!url) return null;
  const m = url.match(/reddit\.com\/r\/([^/?#]+)/i);
  return m ? `r/${m[1]}` : null;
}

export function getTaskTitle(
  draft: Pick<StudioDraft, "channel" | "source" | "title">,
  type: TaskType,
  ownDomain: string | null,
): string {
  if (type === "email_pitch") {
    return `Email ${bareHost(draft.source.domain)} editor to pitch insertion`;
  }

  if (type === "cms_publish") {
    const host = draft.source.domain
      ? bareHost(draft.source.domain)
      : ownDomain
        ? bareHost(ownDomain)
        : "your blog";
    return `Publish to ${host}`;
  }

  // platform_post — channel-specific
  switch (draft.channel) {
    case "reddit": {
      const sub = redditSubreddit(draft.source.url);
      return sub ? `Post Reddit reply on ${sub}` : "Post Reddit reply";
    }
    case "linkedin":
      return "Publish LinkedIn post";
    case "twitter":
      return "Post X / Twitter reply";
    case "youtube":
      return `Pin YouTube comment on ${bareHost(draft.source.domain)}`;
    case "medium":
      return "Publish Medium article";
    case "forum":
      return `Reply on ${bareHost(draft.source.domain)}`;
    default:
      return `Publish to ${bareHost(draft.source.domain)}`;
  }
}

export function getTaskCta(type: TaskType): string {
  switch (type) {
    case "email_pitch":
      return "Mark as sent";
    case "cms_publish":
      return "Mark as published";
    case "platform_post":
      return "Mark as posted";
  }
}
