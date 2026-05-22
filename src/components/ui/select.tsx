import * as React from "react";
import { cn } from "@/lib/utils";

const Select = React.forwardRef<HTMLSelectElement, React.ComponentProps<"select">>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-sm border border-outline-variant/60 bg-surface-lowest px-3 text-sm text-on-surface transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-solid/60 focus-visible:border-primary-solid/50",
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
