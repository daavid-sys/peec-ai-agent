import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Mail, Globe, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Favicon } from "@/components/favicon";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/lib/store";
import {
  getStudioDrafts,
  type StudioDraftsResponse,
} from "@/lib/server/get-studio-drafts";
import { classifyTask, getTaskTitle, type TaskType } from "@/lib/task-type";
import { EmailPitchCard } from "@/components/task-cards/email-pitch-card";
import { CmsPublishCard } from "@/components/task-cards/cms-publish-card";
import { PlatformPostCard } from "@/components/task-cards/platform-post-card";

type Search = { promptId?: string };

export const Route = createFileRoute("/task/$id")({
  head: () => ({ meta: [{ title: "Task preview — Peec AI Openings" }] }),
  validateSearch: (search: Record<string, unknown>): Search => ({
    promptId: typeof search.promptId === "string" ? search.promptId : undefined,
  }),
  component: TaskPreviewPage,
});

const TASK_META: Record<
  TaskType,
  { label: string; icon: typeof Mail; tone: string }
> = {
  email_pitch: { label: "Email pitch", icon: Mail, tone: "var(--warning, #d97706)" },
  cms_publish: { label: "Owned blog", icon: Globe, tone: "var(--primary)" },
  platform_post: { label: "Platform post", icon: Sparkles, tone: "var(--success)" },
};

function TaskPreviewPage() {
  const { id } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const selectedPromptId = useAppStore((s) => s.selectedPromptId);
  const project = useAppStore((s) => s.project);

  const promptId =
    search.promptId ??
    selectedPromptId ??
    "pr_05a66669-478c-4b25-94bc-9119409e5e2f";

  const ownBrand = useMemo(
    () => ({
      name: project?.ownBrand.name ?? "Attio",
      domain: project?.ownBrand.domain ?? "attio.com",
    }),
    [project],
  );

  const [response, setResponse] = useState<StudioDraftsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void getStudioDrafts({
      data: { promptId, ownDomain: ownBrand.domain },
    })
      .then((res) => {
        if (!cancelled) setResponse(res);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [promptId, ownBrand.domain]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-6 h-[500px] w-full rounded-xl" />
      </div>
    );
  }

  const draft = response?.drafts.find((d) => d.id === id) ?? null;

  if (!draft) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="text-sm text-muted-foreground">Task not found.</p>
        <Button asChild className="mt-4">
          <Link to="/results">Back to results</Link>
        </Button>
      </div>
    );
  }

  const type = classifyTask(draft, ownBrand.domain);
  const title = getTaskTitle(draft, type, ownBrand.domain);
  const TypeIcon = TASK_META[type].icon;
  const noop = () => {};

  return (
    <div className="mx-auto w-full max-w-[1100px] px-6 py-8">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/results" })}
        >
          <ArrowLeft className="h-4 w-4" /> Back to results
        </Button>
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
          Task preview · read-only
        </span>
      </div>

      <div className="mt-5 flex items-start gap-3">
        <span
          className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full"
          style={{
            backgroundColor: `color-mix(in oklab, ${TASK_META[type].tone} 15%, transparent)`,
            color: TASK_META[type].tone,
          }}
        >
          {type === "platform_post" && draft.source.domain ? (
            <Favicon name={draft.source.domain} kind="brand" size={18} className="rounded-sm" />
          ) : (
            <TypeIcon className="h-4 w-4" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Task · {TASK_META[type].label}
          </div>
          <h1 className="mt-0.5 text-xl font-semibold leading-tight tracking-tight">
            {title}
          </h1>
        </div>
      </div>

      <div className="mt-6">
        {type === "email_pitch" && (
          <EmailPitchCard
            draft={draft}
            ownBrand={ownBrand}
            onDone={noop}
            hideMarkButton
          />
        )}
        {type === "cms_publish" && (
          <CmsPublishCard
            draft={draft}
            ownBrand={ownBrand}
            onDone={noop}
            hideMarkButton
          />
        )}
        {type === "platform_post" && (
          <PlatformPostCard
            draft={draft}
            ownBrand={ownBrand}
            onDone={noop}
            hideMarkButton
          />
        )}
      </div>
    </div>
  );
}
