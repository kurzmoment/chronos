import { cn } from "@/lib/utils";
import { taskCardAccentClass } from "@/lib/event-styles";

export function TaskCard({
  accent,
  className,
  children,
}: {
  accent: "work" | "personal" | "habit";
  className?: string;
  children: React.ReactNode;
}) {
  const accentBorder =
    accent === "habit"
      ? "border-l-accent-habit"
      : taskCardAccentClass[accent];

  return (
    <div
      className={cn(
        "group relative rounded-sm border border-surface-high bg-surface-low px-3 py-2.5",
        "border-l-[3px] transition-colors hover:bg-surface-container",
        accentBorder,
        className
      )}
    >
      {children}
    </div>
  );
}
