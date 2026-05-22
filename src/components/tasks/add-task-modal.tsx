"use client";

import { useAction, useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
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
import { Select } from "@/components/ui/select";
import { useAppStore } from "@/store/app-store";

const priorityOptions = [
  { value: "1", label: "Vysoká (1)" },
  { value: "2", label: "Střední (2)" },
  { value: "3", label: "Nízká (3)" },
] as const;

export function AddTaskModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const selectedDate = useAppStore((s) => s.selectedDate);
  const activeProjectId = useAppStore((s) => s.activeProjectId);
  const projects = useQuery(api.projects.list, open ? {} : "skip");
  const createTask = useMutation(api.tasks.create);
  const optimizeDay = useAction(api.engine.optimizeDay);
  const [projectId, setProjectId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<"1" | "2" | "3">("2");
  const [duration, setDuration] = useState(30);
  const [description, setDescription] = useState("");
  const [scheduleToCalendar, setScheduleToCalendar] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !projects?.length) return;
    const preferred =
      activeProjectId && projects.some((p) => p._id === activeProjectId)
        ? activeProjectId
        : projects[0]._id;
    setProjectId(preferred);
  }, [open, projects, activeProjectId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !projectId) return;
    setSubmitting(true);
    setError(null);
    try {
      await createTask({
        projectId: projectId as Id<"projects">,
        title: title.trim(),
        description: description.trim() || undefined,
        priority: Number(priority) as 1 | 2 | 3,
        estimatedDurationMin: duration,
        isWorkContext: true,
      });
      if (scheduleToCalendar) {
        await optimizeDay({ date: selectedDate });
      }
      setTitle("");
      setDescription("");
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Úkol uložen, ale optimalizace selhala. Zkuste „Optimalizovat den“ na dashboardu."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nový úkol</DialogTitle>
          <DialogDescription>
            Úkol se uloží do backlogu vybraného projektu. Kalendář ho zobrazí po
            optimalizaci nebo ručním zařazení.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-2">
          <div className="space-y-2">
            <Label>Projekt</Label>
            <Select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
            >
              {projects?.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Název</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Co je potřeba udělat?"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Délka (min)</Label>
              <Input
                type="number"
                min={15}
                step={15}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Priorita</Label>
              <Select
                value={priority}
                onChange={(e) => setPriority(e.target.value as "1" | "2" | "3")}
              >
                {priorityOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Popis (volitelné)</Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Kontext, podúkoly…"
              rows={3}
              className="flex w-full resize-none rounded-md border-[0.5px] border-outline-variant/40 bg-surface-container-lowest/80 px-3 py-2 text-sm text-on-surface focus-visible:border-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/30"
            />
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-md border border-[0.5px] border-[var(--glass-border)] bg-surface-container/40 p-3">
            <input
              type="checkbox"
              checked={scheduleToCalendar}
              onChange={(e) => setScheduleToCalendar(e.target.checked)}
              className="mt-0.5"
            />
            <span className="text-body-sm text-on-surface">
              <strong>Rozvrhnout do kalendáře</strong> — hned spustit optimalizaci
              pro {selectedDate}
            </span>
          </label>

          {error && (
            <p className="text-body-sm text-accent-critical">{error}</p>
          )}
        </form>

        <DialogFooter className="px-6 pb-6">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Zrušit
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !title.trim() || !projectId}
          >
            {submitting ? "Ukládám…" : "Uložit úkol"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
