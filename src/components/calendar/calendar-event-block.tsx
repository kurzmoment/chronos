"use client";

import { useMutation } from "convex/react";
import { useCallback, useRef, useState } from "react";
import { api } from "convex/_generated/api";
import type { Doc, Id } from "convex/_generated/dataModel";
import {
  formatTimeWallClock,
  minutesOnDayToIso,
  pxToMinutesOnDay,
} from "@/lib/calendar-time";
import { eventColumnStyle } from "@/lib/calendar-layout";
import { eventThemes } from "@/lib/calendar-event-theme";
import type { CalendarBlockKind } from "@/lib/work-category";
import { cn } from "@/lib/utils";

const CARD_INSET_PX = 1;

/** Pod touto výškou jen čas + název v jedné řádce. */
const SINGLE_LINE_MAX_PX = 52;
/** Nad touto výškou čas na řádku a název (až 2 řádky). */
const TWO_LINE_MIN_PX = 56;

export function CalendarEventBlock({
  event,
  selectedDate,
  startMin,
  endMin,
  topPx,
  heightPx,
  kind,
  column,
  totalColumns,
  onEdit,
}: {
  event: Doc<"calendarEvents">;
  selectedDate: string;
  startMin: number;
  endMin: number;
  topPx: number;
  heightPx: number;
  kind: CalendarBlockKind;
  column: number;
  totalColumns: number;
  onEdit: () => void;
}) {
  const theme = eventThemes[kind];
  const moveEvent = useMutation(api.calendarEvents.moveToTime);
  const col = eventColumnStyle(column, totalColumns);

  const displayTop = topPx + CARD_INSET_PX;
  const displayHeight = Math.max(2, heightPx - CARD_INSET_PX * 2);
  const singleLine = displayHeight < SINGLE_LINE_MAX_PX;
  const twoLine = displayHeight >= TWO_LINE_MIN_PX;

  const dragRef = useRef<{ startY: number; moved: boolean } | null>(null);
  const [dragTop, setDragTop] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const finishDrag = useCallback(
    async (finalTopPx: number) => {
      const durationMin = endMin - startMin;
      const newStart = pxToMinutesOnDay(finalTopPx + CARD_INSET_PX);
      setSaving(true);
      try {
        await moveEvent({
          id: event._id as Id<"calendarEvents">,
          date: selectedDate,
          startMin: newStart,
          endMin: newStart + durationMin,
        });
      } finally {
        setSaving(false);
        setDragTop(null);
      }
    },
    [endMin, startMin, event._id, moveEvent, selectedDate]
  );

  function onPointerDown(e: React.PointerEvent) {
    if (saving) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startY: e.clientY, moved: false };
    setDragTop(displayTop);
  }

  function onPointerMove(e: React.PointerEvent) {
    const drag = dragRef.current;
    if (!drag) return;
    if (Math.abs(e.clientY - drag.startY) > 4) drag.moved = true;
    setDragTop(displayTop + (e.clientY - drag.startY));
  }

  function onPointerUp(e: React.PointerEvent) {
    const drag = dragRef.current;
    if (!drag) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    dragRef.current = null;
    if (!drag.moved) {
      setDragTop(null);
      onEdit();
      return;
    }
    void finishDrag(displayTop + (e.clientY - drag.startY));
  }

  const visualTop = dragTop ?? displayTop;
  const previewStart =
    dragTop !== null ? pxToMinutesOnDay(visualTop) : startMin;
  const previewEnd = previewStart + (endMin - startMin);
  const timeLabel = `${formatTimeWallClock(
    minutesOnDayToIso(selectedDate, previewStart)
  )} – ${formatTimeWallClock(minutesOnDayToIso(selectedDate, previewEnd))}`;
  const startOnly = formatTimeWallClock(
    minutesOnDayToIso(selectedDate, previewStart)
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        dragRef.current = null;
        setDragTop(null);
      }}
      className={cn(
        "absolute cursor-grab touch-none select-none overflow-hidden rounded-none border text-left active:cursor-grabbing",
        "box-border hover:brightness-110",
        dragTop !== null && "ring-1 ring-inset ring-secondary/50",
        saving && "opacity-60",
        theme.shell
      )}
      style={{
        top: visualTop,
        height: displayHeight,
        left: col.left,
        width: col.width,
        zIndex: dragTop !== null ? 50 : col.zIndex,
      }}
      title={`${timeLabel} · ${event.title}`}
    >
      <div className={cn("absolute bottom-0 left-0 top-0 w-[3px]", theme.accent)} />

      {singleLine ? (
        <div className="flex h-full min-w-0 items-center gap-1.5 px-2 py-0.5">
          <span
            className={cn(
              "shrink-0 font-mono text-[11px] font-semibold tabular-nums",
              theme.timeColor
            )}
          >
            {startOnly}
          </span>
          <span className="min-w-0 truncate text-[12px] font-medium leading-none text-on-surface">
            {event.title}
          </span>
        </div>
      ) : twoLine ? (
        <div className="flex h-full flex-col gap-1 px-2.5 py-1.5">
          <p
            className={cn(
              "shrink-0 font-mono text-[11px] font-semibold leading-none tabular-nums",
              theme.timeColor
            )}
          >
            {timeLabel}
          </p>
          <p className="line-clamp-2 min-h-0 text-[13px] font-medium leading-snug text-on-surface">
            {event.title}
          </p>
        </div>
      ) : (
        <div className="flex h-full flex-col justify-center gap-0.5 px-2.5 py-1">
          <p
            className={cn(
              "shrink-0 font-mono text-[11px] font-semibold leading-none tabular-nums",
              theme.timeColor
            )}
          >
            {timeLabel}
          </p>
          <p className="truncate text-[13px] font-medium leading-snug text-on-surface">
            {event.title}
          </p>
        </div>
      )}
    </div>
  );
}
