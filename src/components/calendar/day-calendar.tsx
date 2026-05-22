"use client";

import { useQuery } from "convex/react";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { api } from "convex/_generated/api";
import { useAppStore } from "@/store/app-store";
import {
  CALENDAR_END_HOUR,
  CALENDAR_START_HOUR,
} from "@/lib/utils";
import {
  calendarTimelineHeightPx,
  eventHeightPx,
  HOUR_HEIGHT_PX,
  isoToMinutesOnDay,
  minutesToTopPx,
} from "@/lib/calendar-time";
import { layoutOverlappingEvents, MIN_COLUMN_WIDTH_PX } from "@/lib/calendar-layout";
import { calendarBlockKind } from "@/lib/work-category";
import { eventThemes } from "@/lib/calendar-event-theme";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CalendarEventEditModal } from "@/components/calendar/calendar-event-edit-modal";
import { CalendarEventBlock } from "@/components/calendar/calendar-event-block";
import type { Doc } from "convex/_generated/dataModel";

const DAY_START_MIN = CALENDAR_START_HOUR * 60;
const DAY_END_MIN = CALENDAR_END_HOUR * 60;

const LEGEND = [
  "meeting",
  "deep",
  "habit",
  "break",
] as const;

const LEGEND_DOT: Record<(typeof LEGEND)[number], string> = {
  meeting: "#4cd7f6",
  deep: "#c4a8ff",
  habit: "#34d399",
  break: "#6b7280",
};

export function DayCalendar() {
  const selectedDate = useAppStore((s) => s.selectedDate);
  const setShowRescheduleBanner = useAppStore((s) => s.setShowRescheduleBanner);
  const setAddCalendarEventModalOpen = useAppStore(
    (s) => s.setAddCalendarEventModalOpen
  );

  const events = useQuery(api.calendarEvents.listForDay, { date: selectedDate });
  const [now, setNow] = useState(new Date());
  const [editEvent, setEditEvent] = useState<Doc<"calendarEvents"> | null>(null);

  const timelineHeight = calendarTimelineHeightPx();

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!events) return;
    const todayKey = format(new Date(), "yyyy-MM-dd");
    if (selectedDate !== todayKey) {
      setShowRescheduleBanner(false);
      return;
    }
    const currentMin = now.getHours() * 60 + now.getMinutes();
    const overdue = events.some((event) => {
      if (event.eventType !== "TASK") return false;
      return isoToMinutesOnDay(event.end) < currentMin;
    });
    setShowRescheduleBanner(overdue);
  }, [events, now, selectedDate, setShowRescheduleBanner]);

  const timeLabels = useMemo(() => {
    const labels: string[] = [];
    for (let h = CALENDAR_START_HOUR; h < CALENDAR_END_HOUR; h++) {
      labels.push(`${String(h).padStart(2, "0")}:00`);
    }
    return labels;
  }, []);

  const isToday = selectedDate === format(new Date(), "yyyy-MM-dd");
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowTopPx = minutesToTopPx(nowMinutes);
  const nowLabel = format(now, "HH:mm");

  const renderItems = useMemo(() => {
    if (!events) return [];
    const spans = events
      .map((event) => {
        const startMin = isoToMinutesOnDay(event.start);
        const endMin = isoToMinutesOnDay(event.end);
        if (startMin >= DAY_END_MIN || endMin <= DAY_START_MIN) return null;
        const clampedStart = Math.max(startMin, DAY_START_MIN);
        const clampedEnd = Math.min(endMin, DAY_END_MIN);
        const kind = calendarBlockKind(event);
        return {
          event,
          startMin: clampedStart,
          endMin: clampedEnd,
          topPx: minutesToTopPx(clampedStart),
          heightPx: eventHeightPx(clampedEnd - clampedStart),
          kind,
        };
      })
      .filter(Boolean) as {
        event: Doc<"calendarEvents">;
        startMin: number;
        endMin: number;
        topPx: number;
        heightPx: number;
        kind: ReturnType<typeof calendarBlockKind>;
      }[];

    return layoutOverlappingEvents(spans);
  }, [events]);

  const maxColumns = useMemo(
    () => Math.max(1, ...renderItems.map((e) => e.totalColumns)),
    [renderItems]
  );

  const eventTrackMinWidth =
    maxColumns > 1
      ? maxColumns * (MIN_COLUMN_WIDTH_PX + 6) + 20
      : undefined;

  return (
    <>
      <Card className="glass-card flex flex-col overflow-hidden border-0 shadow-none">
        <CardHeader className="flex flex-col gap-3 border-b border-[0.5px] border-[var(--glass-border)] px-5 py-4">
          <div className="flex flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="glow-dot" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-on-surface">
                Denní timeline
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden text-[11px] font-medium text-on-surface-variant sm:inline">
                {CALENDAR_START_HOUR}:00 – {CALENDAR_END_HOUR}:00
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 border-secondary/30 text-xs"
                onClick={() => setAddCalendarEventModalOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                Přidat aktivitu
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            {LEGEND.map((kind) => {
              const t = eventThemes[kind];
              return (
                <span
                  key={kind}
                  className="inline-flex items-center gap-1.5 text-[10px] text-on-surface-variant"
                >
                  <span
                    className="h-2 w-2 rounded-sm"
                    style={{
                      backgroundColor: LEGEND_DOT[kind],
                      boxShadow: `0 0 8px ${LEGEND_DOT[kind]}88`,
                    }}
                  />
                  {t.label}
                </span>
              );
            })}
            <span className="text-[10px] text-on-surface-variant/70">
              · překryvy vedle sebe · táhněte = čas · klik = detail
            </span>
          </div>
        </CardHeader>

        <CardContent className="max-h-[min(72vh,1024px)] overflow-y-auto p-0">
          <div className="flex" style={{ height: timelineHeight }}>
            <div className="sticky left-0 z-10 w-[52px] shrink-0 border-r border-[var(--glass-border)] bg-[#060e20]/95">
              {timeLabels.map((label, i) => (
                <div
                  key={label}
                  style={{ height: HOUR_HEIGHT_PX }}
                  className="relative flex items-start justify-end pr-2 pt-1.5"
                >
                  <span className="font-mono text-[11px] font-medium tabular-nums text-on-surface-variant/80">
                    {label}
                  </span>
                  {i > 0 && (
                    <span className="absolute right-0 top-0 h-px w-2 bg-outline-variant/30" />
                  )}
                </div>
              ))}
            </div>

            <div className="relative min-w-0 flex-1 overflow-x-auto">
              <div
                className="relative bg-[#080f1e]"
                style={{
                  height: timelineHeight,
                  minWidth: eventTrackMinWidth,
                }}
              >
                {timeLabels.map((label, i) => (
                  <div
                    key={label}
                    className="pointer-events-none absolute inset-x-0 border-b border-white/[0.04]"
                    style={{
                      top: i * HOUR_HEIGHT_PX,
                      height: HOUR_HEIGHT_PX,
                      background:
                        i % 2 === 0
                          ? "linear-gradient(90deg, rgba(255,255,255,0.02) 0%, transparent 60%)"
                          : "transparent",
                    }}
                  />
                ))}

                {isToday && nowTopPx >= 0 && nowTopPx <= timelineHeight && (
                  <div
                    className="pointer-events-none absolute inset-x-0 z-[60]"
                    style={{ top: nowTopPx }}
                  >
                    <div className="flex items-center gap-2 px-3">
                      <div className="relative flex h-3 w-3 items-center justify-center">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary/40" />
                        <span className="relative h-2 w-2 rounded-full bg-secondary shadow-[var(--glow-cyan)]" />
                      </div>
                      <div className="h-px flex-1 bg-gradient-to-r from-secondary/70 via-secondary/30 to-transparent" />
                      <span className="rounded-md border border-secondary/30 bg-secondary/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-secondary">
                        {nowLabel}
                      </span>
                    </div>
                  </div>
                )}

                {renderItems.map((item) => (
                  <CalendarEventBlock
                    key={item.event._id}
                    event={item.event}
                    selectedDate={selectedDate}
                    startMin={item.startMin}
                    endMin={item.endMin}
                    topPx={item.topPx}
                    heightPx={item.heightPx}
                    kind={item.kind}
                    column={item.column}
                    totalColumns={item.totalColumns}
                    onEdit={() => setEditEvent(item.event)}
                  />
                ))}

                {!renderItems.length && events && (
                  <p className="absolute inset-0 flex items-center justify-center px-8 text-center text-sm text-on-surface-variant">
                    Prázdný den — přidejte aktivitu nebo optimalizujte úkoly z
                    projektů.
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <CalendarEventEditModal
        event={editEvent}
        open={editEvent !== null}
        onOpenChange={(open) => !open && setEditEvent(null)}
      />
    </>
  );
}
