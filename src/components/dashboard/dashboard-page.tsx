"use client";

import { format, parseISO } from "date-fns";
import { cs } from "date-fns/locale";
import { DayCalendar } from "@/components/calendar/day-calendar";
import { ProjectTasksPanel } from "@/components/dashboard/project-tasks-panel";
import { CalendarHint } from "@/components/dashboard/calendar-hint";
import { DayControlPanel } from "@/components/dashboard/day-control-panel";
import { HabitsPanel } from "@/components/dashboard/habits-panel";
import { AppShell } from "@/components/layout/app-shell";
import { DateNav } from "@/components/layout/date-nav";
import { useAppStore } from "@/store/app-store";

export function DashboardPage() {
  const selectedDate = useAppStore((s) => s.selectedDate);
  const dateLabel = format(parseISO(selectedDate), "EEEE d. MMMM", { locale: cs });

  return (
    <AppShell searchPlaceholder="Hledat úkoly a návyky…">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-on-surface">Přehled dne</h1>
          <p className="mt-0.5 text-body-sm capitalize text-on-surface-variant">
            {dateLabel}
          </p>
        </div>
        <DateNav />
      </div>

      <div className="grid min-h-[calc(100vh-10rem)] grid-cols-1 gap-4 xl:grid-cols-[minmax(240px,280px)_1fr_minmax(240px,280px)]">
        <aside className="flex flex-col gap-4">
          <ProjectTasksPanel />
          <HabitsPanel />
        </aside>

        <section className="flex min-h-[560px] flex-col">
          <CalendarHint />
          <DayCalendar />
        </section>

        <aside>
          <DayControlPanel />
        </aside>
      </div>
    </AppShell>
  );
}
