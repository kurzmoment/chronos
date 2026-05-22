import { v } from "convex/values";

export const workCategoryValidator = v.union(
  v.literal("MEETING"),
  v.literal("DEEP_WORK"),
  v.literal("ADMIN"),
  v.literal("OTHER")
);

export type WorkCategory = "MEETING" | "DEEP_WORK" | "ADMIN" | "OTHER";

type CalendarEventLike = {
  eventType: "EVENT" | "TASK" | "HABIT" | "BREAK";
  isWorkContext: boolean;
  isFixed: boolean;
  workCategory?: WorkCategory;
};

export function resolveWorkCategory(event: CalendarEventLike): WorkCategory | null {
  if (event.workCategory) return event.workCategory;
  if (event.eventType === "BREAK") return null;
  if (event.eventType === "TASK" && event.isWorkContext) return "DEEP_WORK";
  if (event.eventType === "EVENT" && (event.isWorkContext || event.isFixed)) {
    return "MEETING";
  }
  return null;
}

export function isTimesheetEntry(event: CalendarEventLike): boolean {
  if (event.eventType === "BREAK" || event.eventType === "HABIT") return false;
  return resolveWorkCategory(event) !== null;
}
