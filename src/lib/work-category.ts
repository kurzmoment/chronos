import type { Doc } from "convex/_generated/dataModel";

export type WorkCategory = "MEETING" | "DEEP_WORK" | "ADMIN" | "OTHER";

export const WORK_CATEGORY_OPTIONS: {
  value: WorkCategory;
  label: string;
  shortLabel: string;
}[] = [
  { value: "MEETING", label: "Schůzka / meeting", shortLabel: "schůzka" },
  { value: "DEEP_WORK", label: "Deep work", shortLabel: "deep work" },
  { value: "ADMIN", label: "Administrativa", shortLabel: "admin" },
  { value: "OTHER", label: "Jiná práce", shortLabel: "práce" },
];

export function resolveWorkCategory(
  event: Pick<
    Doc<"calendarEvents">,
    "eventType" | "isWorkContext" | "isFixed" | "workCategory"
  >
): WorkCategory | null {
  if (event.workCategory) return event.workCategory;
  if (event.eventType === "BREAK") return null;
  if (event.eventType === "TASK" && event.isWorkContext) return "DEEP_WORK";
  if (event.eventType === "EVENT" && (event.isWorkContext || event.isFixed)) {
    return "MEETING";
  }
  return null;
}

export function workCategoryLabel(category: WorkCategory): string {
  return (
    WORK_CATEGORY_OPTIONS.find((o) => o.value === category)?.shortLabel ?? category
  );
}

export type CalendarBlockKind =
  | "meeting"
  | "deep"
  | "admin"
  | "other"
  | "habit"
  | "break"
  | "personal";

export function calendarBlockKind(
  event: Pick<
    Doc<"calendarEvents">,
    "eventType" | "isWorkContext" | "isFixed" | "workCategory"
  >
): CalendarBlockKind {
  if (event.eventType === "BREAK") return "break";
  if (event.eventType === "HABIT") return "habit";
  const cat = resolveWorkCategory(event);
  if (cat === "MEETING") return "meeting";
  if (cat === "DEEP_WORK") return "deep";
  if (cat === "ADMIN") return "admin";
  if (cat === "OTHER") return "other";
  if (event.eventType === "TASK" && !event.isWorkContext) return "personal";
  if (event.eventType === "EVENT") return "meeting";
  return "personal";
}

export const blockKindStyles: Record<
  CalendarBlockKind,
  { shell: string; label: string; labelClass: string }
> = {
  meeting: {
    shell:
      "border-[0.5px] border-secondary/55 bg-[#0a2830]/90 shadow-[var(--glow-cyan)] ring-1 ring-secondary/20",
    label: "schůzka",
    labelClass: "text-secondary",
  },
  deep: {
    shell:
      "border-[0.5px] border-tertiary/45 bg-[#1a1240]/85 shadow-[inset_0_0_24px_rgba(160,120,255,0.12)] ring-1 ring-tertiary/25",
    label: "deep work",
    labelClass: "text-tertiary",
  },
  admin: {
    shell:
      "border-[0.5px] border-amber-500/40 bg-amber-950/50 ring-1 ring-amber-500/20",
    label: "admin",
    labelClass: "text-amber-400",
  },
  other: {
    shell: "border-[0.5px] border-outline-variant/50 bg-surface-container/85",
    label: "práce",
    labelClass: "text-on-surface-variant",
  },
  habit: {
    shell: "border-[0.5px] border-emerald-500/30 bg-emerald-950/40",
    label: "návyk",
    labelClass: "text-emerald-400",
  },
  break: {
    shell: "border-[0.5px] border-outline-variant/30 bg-surface-low/80",
    label: "pauza",
    labelClass: "text-on-surface-variant",
  },
  personal: {
    shell: "border-[0.5px] border-amber-500/25 bg-amber-950/30",
    label: "osobní",
    labelClass: "text-amber-300/80",
  },
};
