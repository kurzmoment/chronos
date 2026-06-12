import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border-[0.5px] border-[var(--glass-border)] bg-surface-low/70 px-3 py-2 text-sm text-on-surface backdrop-blur-sm",
          "shadow-[inset_0_1px_0_rgb(255_255_255_/_0.035)] transition-all",
          "placeholder:text-on-surface-variant/45 placeholder:uppercase placeholder:text-xs placeholder:tracking-[0.12em]",
          "focus-visible:border-secondary/60 focus-visible:bg-surface-container/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/25",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
