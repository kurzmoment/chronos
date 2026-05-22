import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border-[0.5px] border-outline-variant/40 bg-surface-container-lowest/80 px-3 py-2 text-sm text-on-surface backdrop-blur-sm",
          "border-b-secondary/30",
          "placeholder:text-on-surface-variant/50 placeholder:uppercase placeholder:text-xs placeholder:tracking-wide",
          "focus-visible:border-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/30",
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
