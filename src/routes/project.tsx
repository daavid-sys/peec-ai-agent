import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Building2, Calendar, Cpu, Hash, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAppStore } from "@/lib/store";
import { Favicon } from "@/components/favicon";

export const Route = createFileRoute("/project")({
  head: () => ({
    meta: [{ title: "Project — Peec AI Openings" }],
  }),
  component: ProjectPage,
});

function ProjectPage() {
  const project = useAppStore((s) => s.project);
  const promptCount = useAppStore((s) => s.prompts.length);
  const navigate = useNavigate();

  if (!project) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="text-sm text-muted-foreground">No project loaded.</p>
        <Button asChild className="mt-4">
          <Link to="/">Connect Peec AI</Link>
        </Button>
      </div>
    );
  }

  const last = new Date(project.lastSyncedAt);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
        Step 2 · Project
      </div>
      <h1 className="text-3xl font-semibold tracking-tight">{project.name}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Selected via Peec AI MCP. Confirm the setup, then analyze prompts.
      </p>

      <Card className="mt-8 divide-y divide-border border-border bg-card p-0">
        <Row icon={Building2} label="Own brand">
          <Badge variant="outline" className="gap-1.5 font-medium">
            <Favicon name={project.ownBrand.name} kind="brand" size={14} />
            {project.ownBrand.name}
          </Badge>
          {project.ownBrand.domain && (
            <span className="font-mono text-xs text-muted-foreground">
              {project.ownBrand.domain}
            </span>
          )}
        </Row>
        <Row icon={Users} label="Competitors">
          <div className="flex flex-wrap gap-1.5">
            {project.competitors.map((c) => (
              <Badge key={c.name} variant="outline" className="gap-1.5 font-medium">
                <Favicon name={c.name} kind="brand" size={14} />
                {c.name}
              </Badge>
            ))}
          </div>
        </Row>
        <Row icon={Cpu} label="Models tracked">
          <div className="flex flex-wrap gap-1.5">
            {project.models.map((m) => (
              <span
                key={m}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-0.5 text-xs text-foreground"
              >
                <Favicon name={m} kind="model" size={14} />
                {m}
              </span>
            ))}
          </div>
        </Row>
        <Row icon={Hash} label="Prompts in project">
          <span className="font-mono text-sm">{project.promptCount}</span>
          <span className="text-xs text-muted-foreground">
            ({promptCount} loaded for analysis)
          </span>
        </Row>
        <Row icon={Calendar} label="Last synced">
          <span className="text-sm">{last.toLocaleString()}</span>
        </Row>
      </Card>

      <div className="mt-8 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          We&rsquo;ll rank every prompt by Opportunity Score and recommend the
          one with the highest payoff to fix first.
        </p>
        <Button onClick={() => navigate({ to: "/prompts" })} size="lg">
          Analyze prompts <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <Separator className="my-12" />
      <p className="text-xs text-muted-foreground">
        Tip: connecting more models in Peec AI improves opening detection
        coverage across ChatGPT, Perplexity, Gemini, and Claude.
      </p>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[180px_1fr] items-center gap-4 px-6 py-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}
