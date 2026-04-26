import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function InfoPopover({
  children,
  ariaLabel = "More info",
}: {
  children: React.ReactNode;
  ariaLabel?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={ariaLabel}
          className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-muted-foreground/40 text-[9px] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
        >
          i
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        className="w-80 text-xs leading-relaxed"
      >
        {children}
      </PopoverContent>
    </Popover>
  );
}
