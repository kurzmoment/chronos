import * as React from "react";
import { cn } from "@/lib/utils";

const Select = React.forwardRef<HTMLSelectElement, React.ComponentProps<"select">>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-lg border border-[var(--glass-border)] bg-surface-low/70 px-3 text-sm text-on-surface backdrop-blur-sm transition-all",
        "focus-visible:border-secondary/60 focus-visible:bg-surface-container/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/25",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";

export { Select };
