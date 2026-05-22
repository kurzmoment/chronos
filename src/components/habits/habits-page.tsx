"use client";

import { useMutation, useQuery } from "convex/react";
import { useMemo } from "react";
import { Flame, Trash2 } from "lucide-react";
import { api } from "convex/_generated/api";
import { AddHabitForm } from "@/components/habits/add-habit-form";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";
export function HabitsPage() {
  const selectedDate = useAppStore((s) => s.selectedDate);
  const searchQuery = useAppStore((s) => s.searchQuery);
  const habits = useQuery(api.habits.listWithCompletions, { date: selectedDate });
  const toggleCompletion = useMutation(api.habits.toggleCompletion);
  const removeHabit = useMutation(api.habits.remove);

  const filtered = useMemo(() => {
    if (!habits) return [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return habits;
    return habits.filter((h) => h.title.toLowerCase().includes(q));
  }, [habits, searchQuery]);

  return (
    <AppShell searchPlaceholder="Hledat návyky…">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-on-surface">Návyky</h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Zaškrtněte splnění pro dnešek. Po optimalizaci dne se návyky objeví v
            kalendáři na dashboardu.
          </p>
        </div>
        <AddHabitForm />
      </div>

      <div className="space-y-3">
        {filtered.map((habit) => (
          <Card key={habit._id} className="glass-card border-0 shadow-none">
            <CardContent className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="font-semibold text-on-surface">{habit.title}</p>
                <p className="mt-0.5 text-body-sm text-on-surface-variant">
                  {habit.durationMin} min · {habit.preferredTimeOfDay.toLowerCase()}
                  {habit.currentStreak > 0 && (
                    <span className="ml-2 inline-flex items-center gap-1 text-secondary">
                      <Flame className="h-3.5 w-3.5" />
                      {habit.currentStreak} dní
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={habit.completedToday}
                  onChange={() =>
                    toggleCompletion({ habitId: habit._id, date: selectedDate })
                  }
                  className="h-4 w-4 rounded border-outline-variant"
                  aria-label={`Splněno: ${habit.title}`}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => removeHabit({ id: habit._id })}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {!filtered.length && (
          <p className="text-on-surface-variant">
            {habits?.length
              ? "Žádný návyk neodpovídá hledání."
              : "Zatím žádné návyky — přidejte první výše."}
          </p>
        )}
      </div>
    </AppShell>
  );
}
