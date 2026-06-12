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
      ? "border-accent-habit/25"
      : taskCardAccentClass[accent].replace("border-l-", "border-");

  return (
    <div
      className={cn(
        "group relative rounded-lg border border-[var(--glass-border)] bg-surface-low/75 px-3 py-2.5",
        "transition-all hover:bg-surface-container/75",
        accentBorder,
        className
      )}
    >
      {children}
    </div>
  );
}
