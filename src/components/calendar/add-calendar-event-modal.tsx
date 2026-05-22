"use client";

import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "convex/_generated/api";
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
import { minutesOnDayToIso, parseTimeToMinutes } from "@/lib/calendar-time";
import {
  WORK_CATEGORY_OPTIONS,
  type WorkCategory,
} from "@/lib/work-category";

export function AddCalendarEventModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const selectedDate = useAppStore((s) => s.selectedDate);
  const createEvent = useMutation(api.calendarEvents.create);
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [description, setDescription] = useState("");
  const [isFixed, setIsFixed] = useState(true);
  const [isWorkContext, setIsWorkContext] = useState(true);
  const [workCategory, setWorkCategory] = useState<WorkCategory>("MEETING");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const startMin = parseTimeToMinutes(startTime);
    const endMin = parseTimeToMinutes(endTime);
    if (endMin <= startMin) {
      setError("Čas konce musí být po začátku.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await createEvent({
        title: title.trim(),
        description: description.trim() || undefined,
        start: minutesOnDayToIso(selectedDate, startMin),
        end: minutesOnDayToIso(selectedDate, endMin),
        isFixed,
        isWorkContext,
        workCategory: isWorkContext ? workCategory : undefined,
      });
      setTitle("");
      setDescription("");
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nepodařilo se uložit aktivitu.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Přidat do kalendáře</DialogTitle>
          <DialogDescription>
            Pevný blok se zobrazí přímo v timeline pro {selectedDate}. Při
            optimalizaci dne zůstane na místě; engine ho nepřepisuje.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-2">
          <div className="space-y-2">
            <Label>Název aktivity</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Schůzka, oběd, sport…"
              required
            />
          </div>

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

          <div className="space-y-2">
            <Label>Popis (volitelné)</Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Místo, poznámky…"
              rows={2}
              className="flex w-full resize-none rounded-md border-[0.5px] border-outline-variant/40 bg-surface-container-lowest/80 px-3 py-2 text-sm text-on-surface focus-visible:border-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/30"
            />
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-md border border-[0.5px] border-[var(--glass-border)] bg-surface-container/40 p-3">
            <input
              type="checkbox"
              checked={isFixed}
              onChange={(e) => setIsFixed(e.target.checked)}
              className="mt-0.5"
            />
            <span className="text-body-sm text-on-surface">
              <strong>Pevný blok</strong> — při „Optimalizovat den“ se nemění
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-md border border-[0.5px] border-[var(--glass-border)] bg-surface-container/40 p-3">
            <input
              type="checkbox"
              checked={isWorkContext}
              onChange={(e) => setIsWorkContext(e.target.checked)}
              className="mt-0.5"
            />
            <span className="text-body-sm text-on-surface">
              <strong>Pracovní aktivita</strong> — zahrnout do výkazu pro backoffice
            </span>
          </label>

          {isWorkContext && (
            <div className="space-y-2">
              <Label>Typ práce</Label>
              <select
                value={workCategory}
                onChange={(e) => setWorkCategory(e.target.value as WorkCategory)}
                className="flex h-10 w-full rounded-md border-[0.5px] border-outline-variant/40 bg-surface-container-lowest/80 px-3 text-sm text-on-surface"
              >
                {WORK_CATEGORY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {error && (
            <p className="text-body-sm text-accent-critical">{error}</p>
          )}
        </form>

        <DialogFooter className="px-6 pb-6">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Zrušit
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !title.trim()}>
            {submitting ? "Ukládám…" : "Přidat do kalendáře"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
