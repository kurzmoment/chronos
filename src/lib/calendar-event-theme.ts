import type { CalendarBlockKind } from "@/lib/work-category";

export type EventTheme = {
  label: string;
  accent: string;
  shell: string;
  timeColor: string;
};

export const eventThemes: Record<CalendarBlockKind, EventTheme> = {
  meeting: {
    label: "Schůzka",
    accent: "bg-secondary",
    shell: "border-secondary/30 bg-[#0a222c]/95",
    timeColor: "text-secondary",
  },
  deep: {
    label: "Deep work",
    accent: "bg-tertiary",
    shell: "border-tertiary/30 bg-[#15102a]/95",
    timeColor: "text-tertiary",
  },
  admin: {
    label: "Admin",
    accent: "bg-amber-400",
    shell: "border-amber-500/25 bg-amber-950/60",
    timeColor: "text-amber-300",
  },
  other: {
    label: "Práce",
    accent: "bg-outline-variant",
    shell: "border-outline-variant/40 bg-surface-container/90",
    timeColor: "text-on-surface-variant",
  },
  habit: {
    label: "Návyk",
    accent: "bg-emerald-400",
    shell: "border-emerald-500/25 bg-emerald-950/50",
    timeColor: "text-emerald-300",
  },
  break: {
    label: "Pauza",
    accent: "bg-outline-variant/60",
    shell: "border-dashed border-outline-variant/35 bg-surface-low/80",
    timeColor: "text-on-surface-variant",
  },
  personal: {
    label: "Osobní",
    accent: "bg-amber-300/80",
    shell: "border-amber-500/20 bg-amber-950/40",
    timeColor: "text-amber-200",
  },
};
