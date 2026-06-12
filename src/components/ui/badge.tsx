import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-body-sm font-medium",
  {
    variants: {
      variant: {
        default:
          "border-primary/30 bg-primary-container/30 text-primary",
        secondary:
          "border-outline-variant/50 bg-surface-high text-on-surface-variant",
        work: "border-accent-work/30 bg-cyan-950/50 text-accent-work",
        personal: "border-accent-personal/30 bg-amber-950/50 text-accent-personal",
        habit: "border-accent-habit/30 bg-emerald-950/50 text-accent-habit",
        warning: "border-accent-personal/40 bg-amber-950/60 text-accent-personal",
        outline: "border-outline-variant/60 bg-transparent text-on-surface-variant",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
