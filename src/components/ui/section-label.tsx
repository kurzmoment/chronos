import { cn } from "@/lib/utils";

export function SectionLabel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span className={cn("text-label-sm block", className)}>{children}</span>
  );
}
