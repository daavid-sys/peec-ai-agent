import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Eye, Sparkles, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { store, useAppStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Connect — Peec AI Openings" },
      {
        name: "description",
        content:
          "Connect your Peec AI account to find the exact sources causing your brand to lose AI search visibility.",
      },
    ],
  }),
  component: ConnectPage,
});

function ConnectPage() {
  const connected = useAppStore((s) => s.connected);
  const navigate = useNavigate();

  function handleConnect() {
    store.loadDemoProject();
    setTimeout(() => navigate({ to: "/project" }), 250);
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col items-center px-6 py-20">
      <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
        <Sparkles className="h-3 w-3 text-primary" />
        Source engagement autopilot for GEO
      </div>
      <h1 className="max-w-3xl text-center text-4xl font-semibold tracking-tight md:text-5xl">
        Find where AI recommends your competitors —{" "}
        <span className="text-primary">and act on the sources causing it.</span>
      </h1>
      <p className="mt-5 max-w-2xl text-center text-base text-muted-foreground md:text-lg">
        Connect Peec AI to scan your prompts, cited sources, and hidden search
        fanouts. We&rsquo;ll find the best openings to improve your AI visibility.
      </p>

      <Card className="mt-10 w-full max-w-xl border-border bg-card p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft">
            <Target className="h-6 w-6 text-primary" />
          </div>
          <h2 className="mt-4 text-lg font-semibold">Connect Peec AI</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            We&rsquo;ll pull your projects, prompts, cited sources, and hidden
            questions through the Peec AI MCP. Read-only by default.
          </p>
          <Button
            size="lg"
            onClick={handleConnect}
            className="mt-6 w-full font-medium"
          >
            {connected ? (
              <>
                <CheckCircle2 className="h-4 w-4" /> Connected to Peec AI
              </>
            ) : (
              <>
                Connect Peec AI <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
          <p className="mt-3 text-[11px] text-muted-foreground">
            No live keys configured — we&rsquo;ll load a realistic Attio demo
            project so you can walk through the full flow.
          </p>
        </div>
      </Card>

      <div className="mt-16 grid w-full grid-cols-1 gap-4 md:grid-cols-3">
        {[
          {
            icon: Eye,
            title: "Find the sources AI reads",
            body: "We surface every cited URL and hidden search fanout influencing each prompt.",
          },
          {
            icon: Target,
            title: "Detect where your brand is missing",
            body: "We compare brand mentions, pain signals, and missing proof per source.",
          },
          {
            icon: Zap,
            title: "Engage where it matters",
            body: "Source-specific drafts with quality checks. No content spam.",
          },
        ].map((f) => (
          <Card key={f.title} className="border-border bg-card p-5">
            <f.icon className="h-4 w-4 text-primary" />
            <h3 className="mt-3 text-sm font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
