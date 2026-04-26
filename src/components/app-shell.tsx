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
              <Badge variant="outline" className="gap-1 text-[11px]">
                <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
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
