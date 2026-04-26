import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { PeecSidebar } from "@/components/peec-sidebar";
import { StepDots } from "@/components/step-dots";
import { Link } from "@tanstack/react-router";

export function AppShell({ children }: { children: React.ReactNode }) {
  const connected = useAppStore((s) => s.connected);

  return (
    <div className="flex min-h-screen bg-background">
      <PeecSidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-12 items-center justify-between gap-4 border-b border-border bg-background/80 px-6 backdrop-blur">
          <div className="text-[13px] font-medium text-muted-foreground">
            <Link
              to="/prompts"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Openings
            </Link>{" "}
            <span className="mx-1 text-border">/</span>{" "}
            <span className="text-foreground">Find where to show up next</span>
          </div>
          <div className="flex items-center gap-4">
            <StepDots />
            {connected && (
              <Badge
                variant="outline"
                aria-disabled
                title="Live data stream — read-only"
                className="pointer-events-none gap-1.5 text-[11px] animate-pulse select-none"
              >
                {/* Official MCP-style mark */}
                <svg
                  viewBox="0 0 24 24"
                  width="12"
                  height="12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M3 12 L9 6 L15 12 L9 18 Z" />
                  <path d="M9 12 L15 6 L21 12 L15 18 Z" />
                </svg>
                <span className="relative inline-flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-70" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
                </span>
                Connected via MCP
              </Badge>
            )}
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
