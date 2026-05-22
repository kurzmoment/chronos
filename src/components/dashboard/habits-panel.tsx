"use client";

import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { api } from "convex/_generated/api";
import { useAppStore } from "@/store/app-store";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function HabitsPanel() {
  const selectedDate = useAppStore((s) => s.selectedDate);
  const searchQuery = useAppStore((s) => s.searchQuery);
  const habits = useQuery(api.habits.listWithCompletions, { date: selectedDate });
  const toggleCompletion = useMutation(api.habits.toggleCompletion);

  const filtered = useMemo(() => {
    if (!habits) return [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return habits;
    return habits.filter((h) => h.title.toLowerCase().includes(q));
  }, [habits, searchQuery]);

  const completed = habits?.filter((h) => h.completedToday).length ?? 0;
  const total = habits?.length ?? 0;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Card className="glass-card flex flex-col border-0 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between py-3">
        <p className="text-sm font-semibold text-on-surface">Návyky</p>
        <span className="text-mono-data text-[10px] font-bold text-secondary">
          {pct}%
        </span>
      </CardHeader>
      <CardContent className="space-y-2 pb-4">
        {filtered.map((habit) => (
          <div
            key={habit._id}
            className="flex items-center justify-between rounded-sm border border-surface-high bg-surface-low px-3 py-2.5"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg opacity-80">◎</span>
              <span
                className={cn(
                  "truncate text-body-sm",
                  habit.completedToday
                    ? "text-on-surface-variant line-through"
                    : "text-on-surface"
                )}
              >
                {habit.title}
              </span>
            </div>
            <input
              type="checkbox"
              checked={habit.completedToday}
              onChange={() =>
                toggleCompletion({ habitId: habit._id, date: selectedDate })
              }
              className="h-4 w-4 shrink-0 rounded-sm border-outline-variant text-primary-solid"
            />
          </div>
        ))}
        {!filtered.length && (
          <p className="text-body-sm text-on-surface-variant">
            {habits?.length ? "Nic neodpovídá hledání." : "Žádné návyky — přidejte v sekci Návyky."}
          </p>
        )}
        <Link
          href="/habits"
          className="mt-2 flex items-center gap-1 text-body-sm text-secondary hover:underline"
        >
          Spravovat návyky
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </CardContent>
    </Card>
  );
}
