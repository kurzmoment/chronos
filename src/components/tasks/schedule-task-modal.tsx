"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/store/app-store";
import { parseTimeToMinutes } from "@/lib/calendar-time";

export function ScheduleTaskModal() {
  const scheduleTaskId = useAppStore((s) => s.scheduleTaskId);
  const setScheduleTaskId = useAppStore((s) => s.setScheduleTaskId);
  const selectedDate = useAppStore((s) => s.selectedDate);
  const schedule = useMutation(api.tasks.scheduleToCalendar);
  const tasks = useQuery(
    api.tasks.listByStatus,
    scheduleTaskId ? { status: "BACKLOG" } : "skip"
  );
  const task = tasks?.find((t) => t._id === scheduleTaskId);

  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!scheduleTaskId) return;
    const startMin = parseTimeToMinutes(startTime);
    const endMin = parseTimeToMinutes(endTime);
    if (endMin <= startMin) {
      setError("Čas konce musí být po začátku.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await schedule({
        id: scheduleTaskId as Id<"tasks">,
        date: selectedDate,
        startMin,
        endMin,
      });
      setScheduleTaskId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nepodařilo se zařadit.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={scheduleTaskId !== null}
      onOpenChange={(open) => !open && setScheduleTaskId(null)}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Do kalendáře</DialogTitle>
          <DialogDescription>
            {task ? (
              <>
                Úkol „{task.title}“ na {selectedDate}
              </>
            ) : (
              "Načítám úkol…"
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Začátek</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Konec</Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>
          {error && (
            <p className="text-body-sm text-accent-critical">{error}</p>
          )}
        </form>

        <DialogFooter className="px-6 pb-6">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setScheduleTaskId(null)}
          >
            Zrušit
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !task}>
            {submitting ? "Ukládám…" : "Přidat do kalendáře"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
