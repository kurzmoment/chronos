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
        "flex rounded-sm border border-surface-high bg-surface-lowest p-0.5",
        className
      )}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-sm px-2 py-2 text-xs font-semibold transition-colors",
            value === opt.value
              ? opt.variant === "critical"
                ? "bg-red-600 text-white"
                : opt.variant === "work"
                  ? "bg-primary text-on-primary"
                  : "bg-surface-high text-on-surface"
              : "text-on-surface-variant hover:text-on-surface"
          )}
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  );
}
