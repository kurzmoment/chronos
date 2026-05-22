import {
  CALENDAR_END_HOUR,
  CALENDAR_START_HOUR,
  SLOT_MINUTES,
} from "@/lib/utils";

/** Must match convex/lib/time.ts minutesOnDayToIso encoding. */
export function isoToMinutesOnDay(iso: string): number {
  const d = new Date(iso);
  return d.getUTCHours() * 60 + d.getUTCMinutes();
}

export function minutesOnDayToIso(dateStr: string, minutes: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const h = Math.floor(minutes / 60);
  const min = minutes % 60;
  return new Date(Date.UTC(y, m - 1, d, h, min, 0, 0)).toISOString();
}

export function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
}

export function formatTimeWallClock(iso: string): string {
  const d = new Date(iso);
  const h = d.getUTCHours();
  const m = d.getUTCMinutes();
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Výška jedné hodiny v timeline (měřítko).
 * 15 min = HOUR_HEIGHT_PX / 4. Při 128 px → 32 px na 15min blok.
 */
export const HOUR_HEIGHT_PX = 128;
export const SLOTS_PER_HOUR = 60 / SLOT_MINUTES;

export function calendarTimelineHeightPx(): number {
  return (CALENDAR_END_HOUR - CALENDAR_START_HOUR) * HOUR_HEIGHT_PX;
}

export function minutesToTopPx(minutes: number): number {
  const dayStart = CALENDAR_START_HOUR * 60;
  return ((minutes - dayStart) / 60) * HOUR_HEIGHT_PX;
}

export function durationToHeightPx(durationMin: number): number {
  return Math.max((durationMin / 60) * HOUR_HEIGHT_PX, (SLOT_MINUTES / 60) * HOUR_HEIGHT_PX);
}

/** Přesná výška podle trvání — karta nepřesahuje slot. */
export function eventHeightPx(durationMin: number): number {
  return Math.max(2, (durationMin / 60) * HOUR_HEIGHT_PX);
}

export function snapMinutesToSlot(minutes: number): number {
  return Math.round(minutes / SLOT_MINUTES) * SLOT_MINUTES;
}

export function pxToMinutesOnDay(px: number): number {
  const dayStart = CALENDAR_START_HOUR * 60;
  const raw = dayStart + (px / HOUR_HEIGHT_PX) * 60;
  return snapMinutesToSlot(
    Math.max(
      dayStart,
      Math.min(CALENDAR_END_HOUR * 60, raw)
    )
  );
}
