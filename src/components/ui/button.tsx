import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "btn-gradient text-on-primary",
        secondary:
          "border-[0.5px] border-[var(--glass-border)] bg-surface-container/40 text-on-surface backdrop-blur-sm hover:bg-surface-high/60",
        outline:
          "border-[0.5px] border-outline-variant/60 bg-transparent text-on-surface-variant hover:bg-surface-container/50 hover:text-on-surface",
        ghost:
          "text-on-surface-variant hover:bg-surface-high/50 hover:text-on-surface",
        destructive:
          "bg-error-container text-error hover:bg-error-container/90",
        tertiary:
          "bg-tertiary-dim/25 text-tertiary border-[0.5px] border-tertiary/25 hover:bg-tertiary-dim/35",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-6",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
