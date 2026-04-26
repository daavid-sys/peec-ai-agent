import { Badge } from "@/components/ui/badge";
import type { PromptStatus } from "@/lib/types";

const map: Record<PromptStatus, { label: string; style: React.CSSProperties }> = {
  best_opportunity: {
    label: "Best opportunity",
    style: {
      backgroundColor: "color-mix(in oklab, var(--primary) 12%, transparent)",
      color: "var(--primary)",
      borderColor: "color-mix(in oklab, var(--primary) 25%, transparent)",
    },
  },
  critical_gap: {
    label: "Critical gap",
    style: {
      backgroundColor: "color-mix(in oklab, var(--destructive) 10%, transparent)",
      color: "var(--destructive)",
      borderColor: "color-mix(in oklab, var(--destructive) 25%, transparent)",
    },
  },
  quick_win: {
    label: "Quick win",
    style: {
      backgroundColor: "color-mix(in oklab, var(--success) 12%, transparent)",
      color: "var(--success)",
      borderColor: "color-mix(in oklab, var(--success) 25%, transparent)",
    },
  },
  high_impact: {
    label: "High impact",
    style: {
      backgroundColor: "color-mix(in oklab, var(--warning) 14%, transparent)",
      color: "var(--warning)",
      borderColor: "color-mix(in oklab, var(--warning) 30%, transparent)",
    },
  },
  already_strong: {
    label: "Already strong",
    style: {
      backgroundColor: "var(--muted)",
      color: "var(--muted-foreground)",
      borderColor: "var(--border)",
    },
  },
  low_priority: {
    label: "Low priority",
    style: {
      backgroundColor: "transparent",
      color: "var(--muted-foreground)",
      borderColor: "var(--border)",
    },
  },
};

export function StatusBadge({ status }: { status: PromptStatus }) {
  const m = map[status];
  return (
    <Badge variant="outline" style={m.style} className="font-medium">
      {m.label}
    </Badge>
  );
}
