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
    <AppShell searchPlaceholder="Filtrovat návyky…">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 rounded-xl border border-[var(--glass-border)] bg-surface-container/40 p-5 shadow-[var(--shadow-ambient)] backdrop-blur-2xl">
        <div>
          <p className="section-kicker">návyky</p>
          <h1 className="mt-1 text-[clamp(2rem,4vw,3.75rem)] font-black leading-none tracking-[-0.06em] text-on-surface">
            Habits
          </h1>
          <p className="mt-3 max-w-2xl text-body-sm text-on-surface-variant">
            Návyky se dají odškrtávat ručně nebo zařadit do denního plánu
            automaticky podle preferovaného času.
          </p>
        </div>
        <AddHabitForm />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {filtered.map((habit) => (
          <Card
            key={habit._id}
            className="mission-section border-0 shadow-none transition-all hover:bg-surface-container/30"
          >
            <CardContent className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="font-bold tracking-[-0.02em] text-on-surface">
                  {habit.title}
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">
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
                  className="h-4 w-4 rounded border-outline-variant bg-surface-low text-secondary"
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
          <p className="mission-section px-5 py-10 text-center text-on-surface-variant lg:col-span-2">
            {habits?.length
              ? "Žádný návyk neodpovídá hledání."
              : "Zatím žádné návyky — přidejte první výše."}
          </p>
        )}
      </div>
    </AppShell>
  );
}
