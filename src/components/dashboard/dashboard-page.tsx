"use client";

import type React from "react";
import { format, parseISO } from "date-fns";
import { cs } from "date-fns/locale";
import { Activity, CalendarClock, Compass } from "lucide-react";
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
    <AppShell searchPlaceholder="Filtrovat úkoly, návyky, projekty…">
      <div className="mb-5 overflow-hidden rounded-xl border border-[var(--glass-border)] bg-surface-container/40 p-4 shadow-[var(--shadow-ambient)] backdrop-blur-2xl md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-md border border-secondary/20 bg-secondary/8 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-secondary">
                <span className="h-1.5 w-1.5 rounded-sm bg-secondary/80" />
                dnešní plán
              </span>
              <span className="text-label-caps capitalize">{dateLabel}</span>
            </div>
            <h1 className="text-[clamp(2rem,4vw,4.25rem)] font-black leading-[0.9] tracking-[-0.07em] text-on-surface">
              Co dnes stojí za čas.
            </h1>
            <p className="mt-3 max-w-2xl text-body-sm text-on-surface-variant">
              Úkoly, návyky a fixní události v jednom pohledu. Bez přepínání
              mezi nástroji, jen jasný plán a zbytek kontextu po ruce.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:items-end">
            <DateNav />
            <div className="grid grid-cols-3 gap-2 text-center">
              <MissionStat icon={CalendarClock} label="časová osa" value="dnes" />
              <MissionStat icon={Compass} label="režim" value="focus" />
              <MissionStat icon={Activity} label="sync" value="convex" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid min-h-[calc(100vh-14rem)] grid-cols-1 gap-4 xl:grid-cols-[minmax(260px,310px)_minmax(520px,1fr)_minmax(270px,320px)]">
        <aside className="flex min-h-0 flex-col gap-4">
          <MissionPanelHeader
            eyebrow="inbox"
            title="Fronta úkolů"
            description="Backlog a návyky, ze kterých skládáš dnešek."
          />
          <ProjectTasksPanel />
          <HabitsPanel />
        </aside>

        <section className="flex min-h-[620px] flex-col overflow-hidden rounded-xl border border-secondary/12 bg-[#071022]/55 p-3 backdrop-blur-2xl">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1">
            <div>
              <p className="text-label-caps">primary timeline</p>
              <h2 className="mt-1 text-title-md text-on-surface">
                Časová osa dne
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-md border border-primary/15 bg-primary/8 px-3 py-1.5 text-xs font-semibold text-primary">
              auto rozvrh
            </div>
          </div>
          <CalendarHint />
          <DayCalendar />
        </section>

        <aside className="flex min-h-0 flex-col gap-4">
          <MissionPanelHeader
            eyebrow="přehled"
            title="Nastavení dne"
            description="Optimalizace, focus metriky a hranice plánu."
          />
          <DayControlPanel />
        </aside>
      </div>
    </AppShell>
  );
}

function MissionStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--glass-border)] bg-surface-low/65 px-3 py-2">
      <Icon className="mx-auto mb-1 h-3.5 w-3.5 text-secondary" />
      <p className="text-[9px] uppercase tracking-[0.16em] text-on-surface-variant">
        {label}
      </p>
      <p className="text-mono-data text-[11px] font-bold uppercase text-on-surface">
        {value}
      </p>
    </div>
  );
}

function MissionPanelHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--glass-border)] bg-surface-low/45 px-4 py-3">
      <p className="text-label-caps">{eyebrow}</p>
      <h2 className="mt-1 text-base font-bold text-on-surface">{title}</h2>
      <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">
        {description}
      </p>
    </div>
  );
}
