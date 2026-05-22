"use client";

import { useQuery } from "convex/react";
import { Info } from "lucide-react";
import { api } from "convex/_generated/api";
import { useAppStore } from "@/store/app-store";

export function CalendarHint() {
  const selectedDate = useAppStore((s) => s.selectedDate);
  const backlog = useQuery(api.tasks.listByStatus, { status: "BACKLOG" });
  const events = useQuery(api.calendarEvents.listForDay, { date: selectedDate });

  const backlogCount = backlog?.length ?? 0;
  const hasEvents = (events?.length ?? 0) > 0;

  if (!backlogCount || hasEvents) return null;

  return (
    <div className="mb-3 flex gap-3 rounded-lg border border-secondary/30 bg-secondary/10 px-4 py-3">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
      <p className="text-body-sm text-on-surface">
        Úkoly vlevo v backlogu zatím nejsou v kalendáři. Klikněte vpravo na{" "}
        <strong className="text-secondary">Optimalizovat den</strong> — engine je
        rozvrhne do volných slotů.
      </p>
    </div>
  );
}
