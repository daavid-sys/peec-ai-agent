import { Link, useLocation } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import peecLogo from "@/assets/peec-logo.png";

const steps = [
  { to: "/project", label: "Project" },
  { to: "/prompts", label: "Prompts" },
  { to: "/openings", label: "Openings" },
  { to: "/studio", label: "Studio" },
  { to: "/queue", label: "Queue" },
  { to: "/results", label: "Results" },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  
  const connected = useAppStore((s) => s.connected);
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-6">
          <Link to="/project" className="flex items-center gap-2">
            <img src={peecLogo} alt="Peec AI" className="h-5 w-auto" />
            <span className="text-sm font-medium tracking-tight text-muted-foreground">
              / Openings
            </span>
          </Link>

          <nav className="hidden flex-1 items-center gap-1 md:flex">
            {steps.map((s, i) => {
              const active = location.pathname === s.to;
              const disabled = !connected;
              return (
                <Link
                  key={s.to}
                  to={s.to}
                  disabled={disabled}
                  className={cn(
                    "group flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                    active
                      ? "bg-primary-soft text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground",
                    disabled && "pointer-events-none opacity-40",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full font-mono text-[10px]",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {i + 1}
                  </span>
                  {s.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {connected && (
              <Badge variant="outline" className="gap-1 text-[11px]">
                <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
                Connected via MCP
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border py-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 text-xs text-muted-foreground">
          <span>Peec measures AI visibility. Openings helps you act on it.</span>
          <span>Built at Big Berlin Hack · Peec AI · Tavily · Gemini</span>
        </div>
      </footer>
    </div>
  );
}
