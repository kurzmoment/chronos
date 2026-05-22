const SLOT_MINUTES = 15;

export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function roundUpToSlot(minutes: number): number {
  return Math.ceil(minutes / SLOT_MINUTES) * SLOT_MINUTES;
}

export function roundDownToSlot(minutes: number): number {
  return Math.floor(minutes / SLOT_MINUTES) * SLOT_MINUTES;
}

function parseDateParts(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return { y, m, d };
}

/** Midnight of calendar day as UTC instant (wall-clock dates, TZ-safe on server). */
export function dayStartIso(dateStr: string): string {
  const { y, m, d } = parseDateParts(dateStr);
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0)).toISOString();
}

export function dayEndIso(dateStr: string): string {
  const { y, m, d } = parseDateParts(dateStr);
  return new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999)).toISOString();
}

/** Minutes from midnight on dateStr, read from ISO stored via minutesOnDayToIso. */
export function isoToMinutesOnDay(iso: string, _dateStr: string): number {
  const d = new Date(iso);
  return d.getUTCHours() * 60 + d.getUTCMinutes();
}

/** Wall-clock time on dateStr encoded as UTC components in ISO string. */
export function minutesOnDayToIso(dateStr: string, minutes: number): string {
  const { y, m, d } = parseDateParts(dateStr);
  const h = Math.floor(minutes / 60);
  const min = minutes % 60;
  return new Date(Date.UTC(y, m - 1, d, h, min, 0, 0)).toISOString();
}

export type TimeRange = { startMin: number; endMin: number };

export function mergeBlockedRanges(ranges: TimeRange[]): TimeRange[] {
  if (ranges.length === 0) return [];
  const sorted = [...ranges].sort((a, b) => a.startMin - b.startMin);
  const merged: TimeRange[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1];
    const current = sorted[i];
    if (current.startMin <= last.endMin) {
      last.endMin = Math.max(last.endMin, current.endMin);
    } else {
      merged.push(current);
    }
  }
  return merged;
}

export function subtractRanges(
  available: TimeRange[],
  blocked: TimeRange[]
): TimeRange[] {
  let result = [...available];
  for (const block of blocked) {
    const next: TimeRange[] = [];
    for (const range of result) {
      if (block.endMin <= range.startMin || block.startMin >= range.endMin) {
        next.push(range);
        continue;
      }
      if (block.startMin > range.startMin) {
        next.push({ startMin: range.startMin, endMin: block.startMin });
      }
      if (block.endMin < range.endMin) {
        next.push({ startMin: block.endMin, endMin: range.endMin });
      }
    }
    result = next;
  }
  return result.filter((r) => r.endMin - r.startMin >= SLOT_MINUTES);
}

export function timeOfDayRange(
  _dateStr: string,
  period: "MORNING" | "AFTERNOON" | "EVENING" | "ANYTIME"
): TimeRange {
  switch (period) {
    case "MORNING":
      return { startMin: 6 * 60, endMin: 12 * 60 };
    case "AFTERNOON":
      return { startMin: 12 * 60, endMin: 17 * 60 };
    case "EVENING":
      return { startMin: 17 * 60, endMin: 22 * 60 };
    case "ANYTIME":
      return { startMin: 6 * 60, endMin: 22 * 60 };
  }
}

export { SLOT_MINUTES };
