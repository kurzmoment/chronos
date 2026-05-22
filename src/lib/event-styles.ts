import { Doc } from "convex/_generated/dataModel";

export type EventAccent = "work" | "personal" | "habit" | "break" | "fixed" | "neutral";

export function getEventAccent(event: Doc<"calendarEvents">): EventAccent {
  if (event.isFixed && event.eventType === "EVENT") return "fixed";
  if (event.eventType === "HABIT") return "habit";
  if (event.eventType === "BREAK") return "break";
  if (event.eventType === "TASK") {
    return event.isWorkContext ? "work" : "personal";
  }
  return "neutral";
}

export const accentBarClass: Record<EventAccent, string> = {
  work: "bg-accent-work",
  personal: "bg-accent-personal",
  habit: "bg-accent-habit",
  break: "bg-accent-break",
  fixed: "bg-outline",
  neutral: "bg-outline-variant",
};

export const accentGlowClass: Record<EventAccent, string> = {
  work: "shadow-[0_0_12px_rgb(34_211_238/0.2)]",
  personal: "shadow-[0_0_12px_rgb(251_191_36/0.2)]",
  habit: "shadow-[0_0_12px_rgb(52_211_153/0.2)]",
  break: "",
  fixed: "",
  neutral: "",
};

export const calendarBlockClass: Record<EventAccent, string> = {
  work: "bg-cyan-950/80 border-cyan-500/30 text-cyan-100",
  personal: "bg-amber-950/70 border-amber-500/30 text-amber-100",
  habit: "bg-emerald-950/70 border-emerald-500/30 text-emerald-100",
  break: "bg-surface-high/60 border-outline-variant/40 text-on-surface-variant",
  fixed: "bg-surface-highest/90 border-outline/50 text-on-surface",
  neutral: "bg-surface-high/80 border-outline-variant/40 text-on-surface-variant",
};

export const taskCardAccentClass: Record<"work" | "personal", string> = {
  work: "border-l-accent-work",
  personal: "border-l-accent-personal",
};
