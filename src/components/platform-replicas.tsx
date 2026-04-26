import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createContext, useContext, useEffect } from "react";
import {
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  Share2,
  Bookmark,
  MoreHorizontal,
  ThumbsUp,
  Repeat2,
  Send,
  Globe,
  ExternalLink,
} from "lucide-react";
import { Favicon } from "@/components/favicon";
import { useTypewriter } from "@/hooks/use-typewriter";
import { cn } from "@/lib/utils";
import type { Channel } from "@/lib/channel";
import type { StudioDraft } from "@/lib/server/get-studio-drafts";

export type OwnBrandInfo = {
  name: string;
  domain?: string | null;
};

type Props = {
  draft: StudioDraft;
  cps?: number;
  onDone?: () => void;
  ownBrand: OwnBrandInfo;
  showCaret?: boolean;
};

export function PlatformReplica(props: Props) {
  switch (props.draft.channel) {
    case "reddit":
      return <RedditReplica {...props} />;
    case "linkedin":
      return <LinkedInReplica {...props} />;
    case "medium":
    case "editorial":
      return <EditorialReplica {...props} />;
    case "twitter":
      return <TwitterReplica {...props} />;
    case "youtube":
      return <YouTubeReplica {...props} />;
    case "listicle":
      return <ListicleReplica {...props} />;
    case "comparison":
      return <ComparisonReplica {...props} />;
    case "owned":
      return <OwnedReplica {...props} />;
    default:
      return <GenericReplica {...props} />;
  }
}

function useTyped(draft: StudioDraft, cps: number, onDone?: () => void) {
  const { text, done } = useTypewriter(draft.fullDraft, { cps });
  useEffect(() => {
    if (done && onDone) onDone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, draft.id]);
  return text;
}

const channelHints: Record<Channel, string> = {
  reddit: "Reddit comment",
  linkedin: "LinkedIn post",
  medium: "Medium article",
  editorial: "Editorial pitch",
  twitter: "X reply",
  youtube: "YouTube comment",
  listicle: "Listicle insertion",
  comparison: "Comparison row",
  owned: "Owned page draft",
  forum: "Forum reply",
  other: "Draft",
};

/* --------------------------- shared building blocks --------------------------- */

function brandHandle(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function BrandAvatar({
  brand,
  size = 40,
  rounded = "full",
  className,
}: {
  brand: OwnBrandInfo;
  size?: number;
  rounded?: "full" | "md";
  className?: string;
}) {
  // Use the brand domain when present so the favicon resolver hits the real host.
  const target = brand.domain || brand.name;
  return (
    <div
      className={cn(
        "flex flex-shrink-0 items-center justify-center overflow-hidden bg-white ring-1 ring-zinc-200",
        rounded === "full" ? "rounded-full" : "rounded-md",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Favicon
        name={target}
        kind="brand"
        size={Math.round(size * 0.7)}
        className="rounded-none"
      />
    </div>
  );
}

const Caret = () => (
  <span className="ml-0.5 inline-block h-[1em] w-[2px] -translate-y-[1px] animate-pulse bg-current align-middle" />
);

/**
 * Live-rendered Markdown stream. Re-parses on every keystroke so the user
 * sees headings, bold, links, lists materialise as the agent types. We append
 * an invisible character to keep partially-written links/headings rendering
 * usefully, and overlay a caret outside the markdown root.
 */
function TypedMarkdown({
  text,
  className,
  showCaret = true,
}: {
  text: string;
  className?: string;
  showCaret?: boolean;
}) {
  return (
    <div className={cn("prose prose-zinc max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Open links in new tab; render inline-style so they read naturally
          a: (props) => (
            <a {...props} target="_blank" rel="noreferrer" />
          ),
          // Tighten paragraph spacing inside chat-style replicas
          p: ({ children }) => <p className="my-2 first:mt-0 last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="my-2 list-disc pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="my-2 list-decimal pl-5">{children}</ol>,
          h1: ({ children }) => (
            <h1 className="mb-2 mt-4 text-[22px] font-bold leading-tight first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-2 mt-4 text-[18px] font-semibold leading-snug first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-1.5 mt-3 text-[15px] font-semibold first:mt-0">
              {children}
            </h3>
          ),
          code: ({ children }) => (
            <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[0.9em]">
              {children}
            </code>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-2 border-l-2 border-zinc-300 pl-3 italic text-zinc-700">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-md border border-zinc-200">
              <table className="w-full border-collapse text-[13px]">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-zinc-50 text-left">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-zinc-200">{children}</tbody>
          ),
          tr: ({ children }) => <tr className="align-top">{children}</tr>,
          th: ({ children }) => (
            <th className="border-b border-zinc-200 px-3 py-2 font-semibold text-zinc-900">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 text-zinc-700">{children}</td>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
      {showCaret && <Caret />}
    </div>
  );
}

function ReplicaShell({
  children,
  chromeColor,
  channel,
  domain,
}: {
  children: React.ReactNode;
  chromeColor: string;
  channel: Channel;
  domain: string | null;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white shadow-lg">
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 border-b border-zinc-200 bg-zinc-100 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <div className="ml-3 flex flex-1 items-center gap-2 rounded-md bg-white px-2 py-1 text-[11px] text-zinc-500">
          <Globe className="h-3 w-3" />
          <span className="truncate font-mono">{domain ?? "—"}</span>
        </div>
      </div>
      {children}
    </div>
  );
}

/* ------------------------------- REDDIT ------------------------------- */
function RedditReplica({ draft, cps, onDone, ownBrand }: Props) {
  const typed = useTyped(draft, cps ?? 240, onDone);
  const subreddit = guessSubreddit(draft);
  const handle = `u/${brandHandle(ownBrand.name)}`;
  return (
    <ReplicaShell chromeColor="#FF4500" channel="reddit" domain={draft.source.domain}>
      <div className="bg-[#DAE0E6] p-4 text-zinc-900">
        {/* Post card */}
        <div className="rounded-md border border-zinc-300 bg-white">
          <div className="flex">
            <div className="flex w-10 flex-col items-center bg-zinc-50 py-2 text-zinc-400">
              <ArrowBigUp className="h-5 w-5" />
              <span className="my-0.5 text-[11px] font-semibold text-zinc-700">2.4k</span>
              <ArrowBigDown className="h-5 w-5" />
            </div>
            <div className="flex-1 p-3">
              <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                <span className="font-semibold text-zinc-800">r/{subreddit}</span>
                <span>·</span>
                <span>Posted by u/sourceauthor 9mo ago</span>
              </div>
              <h2 className="mt-1 text-base font-medium leading-snug text-zinc-900">
                {draft.source.title ?? draft.title}
              </h2>
              {draft.source.excerpt && (
                <p className="mt-2 line-clamp-3 text-[13px] text-zinc-700">
                  {draft.source.excerpt}
                </p>
              )}
              <div className="mt-2 flex items-center gap-4 text-[11px] text-zinc-500">
                <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> 184 comments</span>
                <span className="flex items-center gap-1"><Share2 className="h-3 w-3" /> Share</span>
                <span className="flex items-center gap-1"><Bookmark className="h-3 w-3" /> Save</span>
              </div>
            </div>
          </div>
        </div>

        {/* Our comment */}
        <div className="mt-3 rounded-md border border-[#FF4500]/40 bg-white">
          <div className="flex">
            <div className="flex w-10 flex-col items-center py-2 text-zinc-400">
              <ArrowBigUp className="h-4 w-4" />
              <span className="my-0.5 text-[10px] font-semibold text-[#FF4500]">●</span>
              <ArrowBigDown className="h-4 w-4" />
            </div>
            <div className="flex-1 p-3">
              <div className="flex items-center gap-2 text-[11px]">
                <BrandAvatar brand={ownBrand} size={20} />
                <span className="font-semibold text-[#FF4500]">{handle}</span>
                <span className="text-zinc-500">· OP · just now</span>
                <span className="ml-1 rounded bg-[#FF4500]/10 px-1 py-px text-[9px] font-semibold uppercase text-[#FF4500]">
                  Drafting
                </span>
              </div>
              <TypedMarkdown
                text={typed}
                className="mt-2 text-[13.5px] leading-relaxed text-zinc-900"
              />
              <div className="mt-2 flex items-center gap-3 text-[11px] text-zinc-500">
                <span>Reply</span>
                <span>Share</span>
                <span>Report</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ReplicaShell>
  );
}

function guessSubreddit(d: StudioDraft) {
  const url = d.source.url ?? "";
  const m = url.match(/reddit\.com\/r\/([^/?#]+)/i);
  return m?.[1] ?? "sales";
}

/* ------------------------------ LINKEDIN ------------------------------ */
function LinkedInReplica({ draft, cps, onDone, ownBrand }: Props) {
  const typed = useTyped(draft, cps ?? 240, onDone);
  return (
    <ReplicaShell chromeColor="#0A66C2" channel="linkedin" domain={draft.source.domain ?? "linkedin.com"}>
      <div className="bg-[#F4F2EE] p-5 text-zinc-900">
        <div className="mx-auto max-w-[560px] rounded-lg border border-zinc-200 bg-white">
          <div className="flex items-start gap-3 p-4">
            <BrandAvatar brand={ownBrand} size={48} />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-zinc-900">
                {ownBrand.name} · Following
              </div>
              <div className="text-[11px] text-zinc-500">
                {ownBrand.domain ?? "Company page"} · Just now · 🌐
              </div>
            </div>
            <MoreHorizontal className="h-5 w-5 text-zinc-400" />
          </div>

          <div className="px-4 pb-3 text-[14px] leading-[1.55] text-zinc-900">
            <TypedMarkdown text={typed} />
          </div>

          {draft.source.url && (
            <div className="mx-4 mb-3 overflow-hidden rounded-md border border-zinc-200">
              <div className="bg-zinc-100 p-3">
                <div className="text-[11px] uppercase tracking-wider text-zinc-500">
                  {draft.source.domain}
                </div>
                <div className="mt-0.5 text-sm font-semibold text-zinc-900">
                  {draft.source.title ?? draft.title}
                </div>
                {draft.source.excerpt && (
                  <div className="mt-1 line-clamp-2 text-[12px] text-zinc-600">
                    {draft.source.excerpt}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="border-t border-zinc-200 px-2 py-1.5">
            <div className="grid grid-cols-4 text-[12px] font-medium text-zinc-600">
              <button className="flex items-center justify-center gap-1.5 rounded px-2 py-2 hover:bg-zinc-100">
                <ThumbsUp className="h-4 w-4" /> Like
              </button>
              <button className="flex items-center justify-center gap-1.5 rounded px-2 py-2 hover:bg-zinc-100">
                <MessageSquare className="h-4 w-4" /> Comment
              </button>
              <button className="flex items-center justify-center gap-1.5 rounded px-2 py-2 hover:bg-zinc-100">
                <Repeat2 className="h-4 w-4" /> Repost
              </button>
              <button className="flex items-center justify-center gap-1.5 rounded px-2 py-2 hover:bg-zinc-100">
                <Send className="h-4 w-4" /> Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </ReplicaShell>
  );
}

/* ----------------------------- EDITORIAL ----------------------------- */
const EDITORIAL_EYEBROW: Record<string, string> = {
  blog_pitch: "Pitched guest article",
  guest_post: "Guest article",
  owned_listicle: "Editorial feature",
  listicle_addition: "Inclusion in roundup",
  comparison_pitch: "Comparison feature",
  alternative_page: "Alternatives explainer",
  faq_schema: "FAQ explainer",
  outreach_email: "Sponsored explainer",
};
function editorialEyebrow(actionType: string) {
  return (
    EDITORIAL_EYEBROW[actionType] ??
    actionType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

function realisticHeadline(draft: StudioDraft) {
  // Prefer the actual cited source headline when available — that's the real
  // article the agent is being inserted into / pitched against.
  if (draft.source.title) return draft.source.title;
  // Strip wrapper phrases like "Get Attio added to '…'" or "Pitch Attio for '…'".
  const m = draft.title.match(/['"“”‘’](.+?)['"“”‘’]/);
  if (m && m[1]) return m[1];
  return draft.title
    .replace(/^Get\s+\w+\s+added\s+to\s+/i, "")
    .replace(/^Pitch\s+\w+\s+for\s+/i, "")
    .trim();
}

function EditorialReplica({ draft, cps, onDone, ownBrand }: Props) {
  const typed = useTyped(draft, cps ?? 260, onDone);
  const headline = realisticHeadline(draft);
  return (
    <ReplicaShell chromeColor="#7c3aed" channel={draft.channel} domain={draft.source.domain}>
      <div className="bg-white p-8 text-zinc-900">
        <div className="mx-auto max-w-[640px]">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
            {draft.source.domain && <Favicon name={draft.source.domain} kind="brand" size={14} />}
            <span>{draft.source.domain ?? "Editorial"}</span>
            <span>·</span>
            <span>{editorialEyebrow(draft.actionType)}</span>
          </div>
          <h1 className="mt-3 font-serif text-[34px] leading-[1.15] tracking-tight text-zinc-900">
            {headline}
          </h1>
          <div className="mt-3 flex items-center gap-2 text-[12px] text-zinc-500">
            <BrandAvatar brand={ownBrand} size={28} />
            <span>By {ownBrand.name} · 6 min read</span>
          </div>
          <TypedMarkdown
            text={typed}
            className="mt-6 font-serif text-[16.5px] leading-[1.7] text-zinc-800"
          />
        </div>
      </div>
    </ReplicaShell>
  );
}

/* ------------------------------- TWITTER ------------------------------- */
function TwitterReplica({ draft, cps, onDone, ownBrand }: Props) {
  const typed = useTyped(draft, cps ?? 220, onDone);
  const handle = `@${brandHandle(ownBrand.name)}`;
  return (
    <ReplicaShell chromeColor="#000000" channel="twitter" domain={draft.source.domain ?? "x.com"}>
      <div className="bg-white p-4 text-zinc-900">
        <div className="mx-auto max-w-[560px] divide-y divide-zinc-200 rounded-lg border border-zinc-200">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 flex-shrink-0 rounded-full bg-zinc-300" />
              <div className="min-w-0 flex-1">
                <div className="text-[14px]">
                  <span className="font-bold">Source author</span>{" "}
                  <span className="text-zinc-500">@author · 2d</span>
                </div>
                <p className="mt-1 text-[15px] leading-snug">
                  {draft.source.excerpt ?? draft.source.title ?? draft.title}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-zinc-50 p-4">
            <div className="flex items-start gap-3">
              <BrandAvatar brand={ownBrand} size={40} />
              <div className="min-w-0 flex-1">
                <div className="text-[14px]">
                  <span className="font-bold">{ownBrand.name}</span>{" "}
                  <span className="text-zinc-500">{handle} · drafting…</span>
                </div>
                <TypedMarkdown text={typed} className="mt-1 text-[15px] leading-snug" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ReplicaShell>
  );
}

/* ------------------------------- YOUTUBE ------------------------------- */
function YouTubeReplica({ draft, cps, onDone, ownBrand }: Props) {
  const typed = useTyped(draft, cps ?? 240, onDone);
  const handle = `@${brandHandle(ownBrand.name)}`;
  return (
    <ReplicaShell chromeColor="#FF0000" channel="youtube" domain={draft.source.domain ?? "youtube.com"}>
      <div className="bg-white p-4 text-zinc-900">
        <div className="mx-auto max-w-[720px]">
          <div className="aspect-video w-full rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-950" />
          <h2 className="mt-3 text-[18px] font-semibold leading-snug">
            {draft.source.title ?? draft.title}
          </h2>
          <div className="mt-1 text-[12px] text-zinc-500">
            128k views · 4 months ago
          </div>
          <div className="mt-4 border-t border-zinc-200 pt-4">
            <div className="text-sm font-semibold">847 Comments</div>
            <div className="mt-3 flex items-start gap-3">
              <BrandAvatar brand={ownBrand} size={36} />
              <div className="min-w-0 flex-1">
                <div className="text-[12px]">
                  <span className="font-semibold">{handle}</span>
                  <span className="ml-1 text-zinc-500">· now · drafting</span>
                </div>
                <TypedMarkdown text={typed} className="mt-1 text-[14px] leading-snug" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ReplicaShell>
  );
}

/* ------------------------------ LISTICLE ------------------------------ */
function ListicleReplica({ draft, cps, onDone, ownBrand }: Props) {
  const typed = useTyped(draft, cps ?? 260, onDone);
  return (
    <ReplicaShell chromeColor="#0891b2" channel="listicle" domain={draft.source.domain}>
      <div className="bg-white p-6 text-zinc-900">
        <div className="mx-auto max-w-[680px]">
          <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
            {draft.source.domain ?? "Listicle"}
          </div>
          <h1 className="mt-2 text-[28px] font-bold tracking-tight">
            {draft.source.title ?? draft.title}
          </h1>
          <ol className="mt-5 space-y-3 text-[14px]">
            <li className="rounded-md border border-zinc-200 p-3">
              <span className="font-bold">1. Competitor A</span>
              <p className="text-zinc-600">…existing entry…</p>
            </li>
            <li className="rounded-md border border-zinc-200 p-3 opacity-70">
              <span className="font-bold">2. Competitor B</span>
              <p className="text-zinc-600">…existing entry…</p>
            </li>
            <li className="rounded-md border-2 border-[#0891b2] bg-[#0891b2]/5 p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-bold">
                  <BrandAvatar brand={ownBrand} size={20} rounded="md" />
                  3. {ownBrand.name} ← proposed insertion
                </span>
                <span className="rounded bg-[#0891b2] px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">
                  drafting
                </span>
              </div>
              <TypedMarkdown
                text={typed}
                className="mt-1 text-[14px] leading-relaxed text-zinc-800"
              />
            </li>
          </ol>
        </div>
      </div>
    </ReplicaShell>
  );
}

/* ----------------------------- COMPARISON ----------------------------- */
function ComparisonReplica({ draft, cps, onDone, ownBrand }: Props) {
  const typed = useTyped(draft, cps ?? 240, onDone);
  return (
    <ReplicaShell chromeColor="#0d9488" channel="comparison" domain={draft.source.domain}>
      <div className="bg-white p-6 text-zinc-900">
        <div className="mx-auto max-w-[760px]">
          <h1 className="text-[26px] font-bold tracking-tight">
            {draft.source.title ?? draft.title}
          </h1>
          <p className="mt-1 text-[12px] text-zinc-500">
            {draft.source.domain} · alternatives table
          </p>
          <div className="mt-4 overflow-hidden rounded-md border border-zinc-200">
            <table className="w-full text-[13px]">
              <thead className="bg-zinc-50 text-left text-[11px] uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-3 py-2">Tool</th>
                  <th className="px-3 py-2">Best for</th>
                  <th className="px-3 py-2">Key differentiator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {draft.competitors.map((c) => (
                  <tr key={c} className="opacity-70">
                    <td className="px-3 py-2 font-semibold">{c}</td>
                    <td className="px-3 py-2">existing row</td>
                    <td className="px-3 py-2">…</td>
                  </tr>
                ))}
                <tr className="bg-[#0d9488]/5">
                  <td className="px-3 py-2 align-top font-semibold text-[#0d9488]">
                    <span className="inline-flex items-center gap-2">
                      <BrandAvatar brand={ownBrand} size={18} rounded="md" />
                      {ownBrand.name} ← new row
                    </span>
                  </td>
                  <td className="px-3 py-2 align-top" colSpan={2}>
                    <TypedMarkdown
                      text={typed}
                      className="text-[13.5px] text-zinc-800"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ReplicaShell>
  );
}

/* ------------------------------- OWNED -------------------------------- */
function OwnedReplica({ draft, cps, onDone, ownBrand }: Props) {
  const typed = useTyped(draft, cps ?? 260, onDone);
  return (
    <ReplicaShell
      chromeColor="#16a34a"
      channel="owned"
      domain={draft.source.domain ?? ownBrand.domain ?? "your-site.com"}
    >
      <div className="bg-white p-8 text-zinc-900">
        <div className="mx-auto max-w-[720px]">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[#16a34a]">
            <BrandAvatar brand={ownBrand} size={18} rounded="md" />
            <span>New page · {ownBrand.name} owned content</span>
          </div>
          <h1 className="mt-2 text-[32px] font-bold tracking-tight">{draft.title}</h1>
          <TypedMarkdown
            text={typed}
            className="mt-5 text-[15.5px] leading-[1.65]"
          />
        </div>
      </div>
    </ReplicaShell>
  );
}

/* ------------------------------- GENERIC ------------------------------- */
function GenericReplica({ draft, cps, onDone, ownBrand }: Props) {
  const typed = useTyped(draft, cps ?? 240, onDone);
  const headline = realisticHeadline(draft);
  return (
    <ReplicaShell chromeColor="#64748b" channel={draft.channel} domain={draft.source.domain}>
      <div className="bg-white p-6 text-zinc-900">
        <div className="mx-auto max-w-[680px]">
          {draft.source.url && (
            <a
              href={draft.source.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider text-zinc-500 hover:text-zinc-900"
            >
              {draft.source.domain} <ExternalLink className="h-3 w-3" />
            </a>
          )}
          <h1 className="mt-2 text-2xl font-bold">{headline}</h1>
          <div className="mt-3 flex items-center gap-2 text-[12px] text-zinc-500">
            <BrandAvatar brand={ownBrand} size={20} />
            <span>From {ownBrand.name}</span>
          </div>
          <TypedMarkdown text={typed} className="mt-4 text-[14.5px] leading-relaxed" />
        </div>
      </div>
    </ReplicaShell>
  );
}
