"use client";

import { useMutation } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "convex/_generated/api";
import type { Doc, Id } from "convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { formatTimeWallClock } from "@/lib/calendar-time";
import {
  WORK_CATEGORY_OPTIONS,
  resolveWorkCategory,
  workCategoryLabel,
  type WorkCategory,
} from "@/lib/work-category";
import { eventThemes } from "@/lib/calendar-event-theme";
import { calendarBlockKind } from "@/lib/work-category";
import { cn } from "@/lib/utils";

const eventTypeLabels: Record<
  Doc<"calendarEvents">["eventType"],
  string
> = {
  EVENT: "Pevná aktivita",
  TASK: "Úkol z projektu",
  HABIT: "Návyk",
  BREAK: "Pauza",
};

export function CalendarEventEditModal({
  event,
  open,
  onOpenChange,
}: {
  event: Doc<"calendarEvents"> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const updateEvent = useMutation(api.calendarEvents.update);
  const removeEvent = useMutation(api.calendarEvents.remove);
  const unschedule = useMutation(api.tasks.unschedule);
  const [workCategory, setWorkCategory] = useState<WorkCategory>("MEETING");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (event) {
      setWorkCategory(resolveWorkCategory(event) ?? "MEETING");
    }
  }, [event]);

  if (!event) return null;

  const kind = calendarBlockKind(event);
  const theme = eventThemes[kind];
  const timeRange = `${formatTimeWallClock(event.start)} – ${formatTimeWallClock(event.end)}`;
  const canEditCategory =
    event.eventType === "EVENT" ||
    (event.eventType === "TASK" && event.isWorkContext);

  async function handleSave() {
    if (!event || !canEditCategory) return;
    setSaving(true);
    try {
      await updateEvent({
        id: event._id,
        workCategory,
        isWorkContext: true,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!event) return;
    setSaving(true);
    try {
      if (event.eventType === "TASK" && event.taskId) {
        await unschedule({ id: event.taskId });
      } else {
        await removeEvent({ id: event._id });
      }
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 overflow-hidden rounded-none p-0">
        <div className={cn("border-b px-6 py-4", theme.shell, "rounded-none")}>
          <p className="font-mono text-sm font-semibold tabular-nums text-on-surface">
            {timeRange}
          </p>
          <DialogHeader className="mt-2 space-y-1 border-0 p-0">
            <DialogTitle className="text-left text-lg">{event.title}</DialogTitle>
          </DialogHeader>
          <p className="mt-2 text-xs text-on-surface-variant">
            {eventTypeLabels[event.eventType]}
            {canEditCategory && (
              <> · {workCategoryLabel(resolveWorkCategory(event)!)}</>
            )}
          </p>
        </div>

        <div className="space-y-4 px-6 py-4">
          {canEditCategory ? (
            <div className="space-y-2">
              <Label>Typ pro kalendář a výkaz</Label>
              <Select
                value={workCategory}
                onChange={(e) =>
                  setWorkCategory(e.target.value as WorkCategory)
                }
              >
                {WORK_CATEGORY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant">
              {event.eventType === "HABIT"
                ? "Návyky spravujte v sekci Návyky. Zde lze blok jen přesunout tažením v kalendáři."
                : "Pauzu generuje optimalizace dne — přesuňte ji tažením, pokud potřebujete."}
            </p>
          )}

          {event.description && (
            <div className="space-y-1">
              <Label>Poznámka</Label>
              <p className="text-sm text-on-surface">{event.description}</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 border-t border-[var(--glass-border)] px-6 py-4">
          {(event.eventType === "EVENT" ||
            (event.eventType === "TASK" && event.taskId)) && (
            <Button
              type="button"
              variant="ghost"
              className="text-accent-critical"
              onClick={handleDelete}
              disabled={saving}
            >
              {event.eventType === "TASK" ? "Zrušit v kalendáři" : "Smazat"}
            </Button>
          )}
          <div className="flex-1" />
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Zavřít
          </Button>
          {canEditCategory && (
            <Button onClick={handleSave} disabled={saving}>
              Uložit
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
