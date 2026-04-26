import {
  Home,
  ScanLine,
  Globe,
  Link2,
  FileText,
  FileSearch,
  LineChart,
  Search,
  ScanSearch,
  User,
  Building2,
  Tag,
  Settings,
  Layers,
  KeyRound,
  Users,
  CreditCard,
  Gift,
  ChevronDown,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import peecLogo from "@/assets/peec-logo.png";

type Item = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
  trailing?: React.ReactNode;
  to?: string;
};

const general: Item[] = [
  { label: "Overview", icon: Home },
  { label: "Prompts", icon: ScanLine },
];

const sources: Item[] = [
  { label: "Domains", icon: Globe },
  { label: "URLs", icon: Link2 },
];

const actions: Item[] = [
  { label: "Earned · Off-page", icon: FileText },
  { label: "Owned · On-page", icon: FileSearch },
  { label: "Openings", icon: Search, active: true, to: "/openings" },
  { label: "Impact", icon: LineChart },
];

const agent: Item[] = [
  { label: "Crawl insights", icon: Search },
  { label: "Crawlability", icon: ScanSearch },
];

const project: Item[] = [
  { label: "Profile", icon: User, trailing: <span className="h-1.5 w-1.5 rounded-full bg-primary" /> },
  { label: "Brands", icon: Building2, trailing: <span className="text-xs text-muted-foreground">10+</span> },
  { label: "Tags", icon: Tag },
];

const company: Item[] = [
  { label: "Settings", icon: Settings },
  { label: "Projects", icon: Layers },
  { label: "API Keys", icon: KeyRound },
  { label: "Members", icon: Users },
  { label: "Billing", icon: CreditCard },
];

function Section({ title, items, badge }: { title: string; items: Item[]; badge?: string }) {
  return (
    <div className="px-3 pt-4">
      <div className="mb-1 flex items-center gap-1.5 px-2 text-[11px] font-medium text-muted-foreground">
        {title}
        {badge && (
          <span className="rounded border border-border bg-muted/50 px-1 py-px text-[9px] font-normal text-muted-foreground">
            {badge}
          </span>
        )}
      </div>
      <ul className="space-y-0.5">
        {items.map((it) => {
          const Icon = it.icon;
          const content = (
            <div
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] font-medium transition-colors",
                it.active
                  ? "bg-muted text-foreground"
                  : "text-foreground/80 hover:bg-muted/60",
                !it.active && "cursor-not-allowed opacity-90",
              )}
            >
              <Icon className="h-[15px] w-[15px] text-foreground/70" />
              <span className="flex-1 truncate">{it.label}</span>
              {it.trailing}
            </div>
          );
          return (
            <li key={it.label}>
              {it.active && it.to ? (
                <Link to={it.to}>{content}</Link>
              ) : (
                <div
                  aria-disabled
                  onClick={(e) => e.preventDefault()}
                  role="button"
                  tabIndex={-1}
                >
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function PeecSidebar() {
  return (
    <aside className="flex h-screen w-[260px] shrink-0 flex-col border-r border-border bg-[hsl(0_0%_98%)]">
      {/* Project switcher */}
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-md border border-border bg-background">
            <img
              src="https://www.google.com/s2/favicons?domain=attio.com&sz=64"
              alt="Attio"
              className="h-5 w-5"
            />
          </div>
          <span className="truncate text-[13px] font-semibold">Project 2 - Att…</span>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="flex-1 overflow-y-auto pb-3">
        <Section title="General" items={general} />
        <Section title="Sources" items={sources} />
        <Section title="Actions" items={actions} badge="Beta" />
        <Section title="Agent analytics" items={agent} badge="Beta" />
        <Section title="Project" items={project} />
        <Section title="Company" items={company} />
      </div>

      {/* Get set up card */}
      <div className="px-3 pb-2">
        <div className="rounded-xl border border-border bg-background p-3 shadow-sm">
          <div className="text-[13px] font-semibold">Get set up · 4/5</div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full w-[80%] bg-primary" />
          </div>
          <p className="mt-2 text-[12px] leading-snug text-muted-foreground">
            Define your competition to enable benchmarking.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-border px-4 py-2.5 text-[13px] font-medium text-foreground/80">
        <Gift className="h-4 w-4" />
        Refer & Earn
      </div>
    </aside>
  );
}
