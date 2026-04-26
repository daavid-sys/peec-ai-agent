import { useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

const STEPS = [
  { path: "/prompts", label: "Choose a prompt" },
  { path: "/openings", label: "Action plan" },
  { path: "/studio", label: "Engagement studio" },
  { path: "/queue", label: "Approval queue" },
  { path: "/results", label: "Results" },
] as const;

export function StepDots() {
  const { pathname } = useLocation();
  const currentIndex = STEPS.findIndex((s) => pathname.startsWith(s.path));
  // If we're not on a flow page, hide the dots
  if (currentIndex === -1) return null;

  return (
    <div
      className="flex items-center gap-1.5"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={STEPS.length}
      aria-valuenow={currentIndex + 1}
      aria-label={`Step ${currentIndex + 1} of ${STEPS.length}: ${STEPS[currentIndex].label}`}
    >
      {STEPS.map((step, i) => {
        const completed = i < currentIndex;
        const current = i === currentIndex;
        return (
          <span
            key={step.path}
            title={`Step ${i + 1} · ${step.label}`}
            className={cn(
              "h-2 w-2 rounded-full border transition-colors",
              completed && "border-success bg-success",
              current && "border-success bg-success ring-2 ring-success/20",
              !completed &&
                !current &&
                "border-muted-foreground/40 bg-transparent",
            )}
          />
        );
      })}
      <span className="ml-2 text-[11px] font-medium text-muted-foreground">
        Step {currentIndex + 1} of {STEPS.length}
        <span className="mx-1.5 text-border">·</span>
        <span className="text-foreground">{STEPS[currentIndex].label}</span>
      </span>
    </div>
  );
}
