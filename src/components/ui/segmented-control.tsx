"use client";

import { cn } from "@/lib/utils";

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; icon?: React.ReactNode; variant?: "critical" | "work" | "default" }[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex rounded-lg border border-[var(--glass-border)] bg-surface-low/60 p-1 backdrop-blur-xl",
        className
      )}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs font-semibold transition-all",
            value === opt.value
              ? opt.variant === "critical"
                ? "bg-red-500/80 text-white shadow-[0_0_24px_rgb(248_113_113_/_0.22)]"
                : opt.variant === "work"
                  ? "bg-secondary/16 text-secondary"
                  : "bg-surface-container/80 text-on-surface shadow-[inset_0_1px_0_rgb(255_255_255_/_0.05)]"
              : "text-on-surface-variant hover:bg-surface-container/45 hover:text-on-surface"
          )}
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  );
}
