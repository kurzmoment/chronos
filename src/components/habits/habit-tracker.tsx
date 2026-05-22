"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { Flame, Plus, Trash2 } from "lucide-react";
import { api } from "convex/_generated/api";
import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionLabel } from "@/components/ui/section-label";
import { Select } from "@/components/ui/select";
import { TaskCard } from "@/components/ui/task-card";
import { cn } from "@/lib/utils";

const timeLabels = {
  MORNING: "Ráno",
  AFTERNOON: "Odpoledne",
  EVENING: "Večer",
  ANYTIME: "Kdykoli",
} as const;

export function HabitTracker() {
  const selectedDate = useAppStore((s) => s.selectedDate);
  const habits = useQuery(api.habits.listWithCompletions, { date: selectedDate });
  const createHabit = useMutation(api.habits.create);
  const removeHabit = useMutation(api.habits.remove);
  const toggleCompletion = useMutation(api.habits.toggleCompletion);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(30);
  const [timeOfDay, setTimeOfDay] = useState<
    "MORNING" | "AFTERNOON" | "EVENING" | "ANYTIME"
  >("MORNING");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await createHabit({
      title: title.trim(),
      durationMin: duration,
      frequency: "DAILY",
      preferredTimeOfDay: timeOfDay,
    });
    setTitle("");
    setShowForm(false);
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <SectionLabel>Návyky</SectionLabel>
        <Button size="icon" variant="ghost" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 overflow-hidden">
        {showForm && (
          <form
            onSubmit={handleCreate}
            className="space-y-3 rounded-sm border border-surface-high bg-surface-low p-3"
          >
            <div className="space-y-2">
              <Label>Název návyku</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Např. Meditace"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Minuty</Label>
                <Input
                  type="number"
                  min={15}
                  step={15}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Preferovaný čas</Label>
                <Select
                  value={timeOfDay}
                  onChange={(e) =>
                    setTimeOfDay(
                      e.target.value as "MORNING" | "AFTERNOON" | "EVENING" | "ANYTIME"
                    )
                  }
                >
                  {Object.entries(timeLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <Button type="submit" size="sm" className="w-full">
              Přidat návyk
            </Button>
          </form>
        )}

        <div className="flex-1 space-y-2 overflow-y-auto">
          {!habits?.length && (
            <p className="text-body-sm text-on-surface-variant/70">Zatím žádné návyky</p>
          )}
          {habits?.map((habit) => (
            <TaskCard key={habit._id} accent="habit" className="group">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={habit.completedToday}
                  onChange={() =>
                    toggleCompletion({ habitId: habit._id, date: selectedDate })
                  }
                  className="h-4 w-4 rounded-sm border-outline-variant bg-surface-lowest text-primary-solid focus:ring-primary-solid/50"
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "truncate text-body-sm font-medium",
                      habit.completedToday
                        ? "text-on-surface-variant/50 line-through"
                        : "text-on-surface"
                    )}
                  >
                    {habit.title}
                  </p>
                  <div className="mt-1.5 flex gap-1">
                    <Badge variant="outline">
                      <span className="text-mono-data">{habit.durationMin} min</span>
                    </Badge>
                    <Badge variant="secondary">
                      {timeLabels[habit.preferredTimeOfDay]}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-accent-personal">
                  <Flame className="h-3.5 w-3.5" />
                  <span className="text-mono-data text-xs font-semibold">
                    {habit.currentStreak}
                  </span>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => removeHabit({ id: habit._id })}
                >
                  <Trash2 className="h-3.5 w-3.5 text-on-surface-variant" />
                </Button>
              </div>
            </TaskCard>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
