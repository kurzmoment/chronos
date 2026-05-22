import type { Doc } from "convex/_generated/dataModel";
import type { CalendarBlockKind } from "@/lib/work-category";
import type { LaidOutSpan } from "@/lib/calendar-layout";

export type PositionedEvent = LaidOutSpan<{
  event: Doc<"calendarEvents">;
  startMin: number;
  endMin: number;
  topPx: number;
  heightPx: number;
  kind: CalendarBlockKind;
}>;

export type TimelineRenderItem =
  | { type: "single"; data: PositionedEvent }
  | {
      type: "habit-group";
      events: Doc<"calendarEvents">[];
      startMin: number;
      endMin: number;
      topPx: number;
      heightPx: number;
      column: number;
      totalColumns: number;
    };

export function buildTimelineRenderItems(
  positioned: PositionedEvent[]
): TimelineRenderItem[] {
  const habitGroupKeys = new Set<string>();
  const items: TimelineRenderItem[] = [];

  for (const data of positioned) {
    if (data.kind === "habit") {
      const key = `habit-${data.startMin}-${data.endMin}`;
      if (habitGroupKeys.has(key)) continue;

      const siblings = positioned.filter(
        (p) =>
          p.kind === "habit" &&
          p.startMin === data.startMin &&
          p.endMin === data.endMin
      );

      if (siblings.length > 1) {
        habitGroupKeys.add(key);
        const rowH = 28;
        const chrome = 40;
        const listH = siblings.length * rowH;
        items.push({
          type: "habit-group",
          events: siblings.map((s) => s.event),
          startMin: data.startMin,
          endMin: data.endMin,
          topPx: data.topPx,
          heightPx: Math.min(Math.max(data.heightPx, chrome + listH), 220),
          column: data.column,
          totalColumns: data.totalColumns,
        });
        continue;
      }
    }

    items.push({ type: "single", data });
  }

  return items;
}
