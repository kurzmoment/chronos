"use client";

import { useAction, useQuery } from "convex/react";
import { Loader2, RefreshCw, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { api } from "convex/_generated/api";
import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EfficiencyGauge } from "@/components/charts/efficiency-gauge";

export function DayControlPanel() {
  const selectedDate = useAppStore((s) => s.selectedDate);
  const prefs = useQuery(api.userPreferences.get);
  const efficiency = useQuery(api.analytics.getDayEfficiency, { date: selectedDate });
  const backlog = useQuery(api.tasks.listByStatus, { status: "BACKLOG" });
  const events = useQuery(api.calendarEvents.listForDay, { date: selectedDate });
  const optimizeDay = useAction(api.engine.optimizeDay);
  const setPreferencesModalOpen = useAppStore((s) => s.setPreferencesModalOpen);
  const [optimizing, setOptimizing] = useState(false);

  async function handleOptimize() {
    setOptimizing(true);
    try {
      await optimizeDay({ date: selectedDate });
    } finally {
      setOptimizing(false);
    }
  }

  const p =
    prefs && "dailyTargetWorkHours" in prefs
      ? prefs
      : {
          dailyTargetWorkHours: 8,
          breakDurationMin: 15,
          minWorkBlockMin: 90,
        };

  const backlogCount = backlog?.length ?? 0;
  const hasSchedule = (events?.length ?? 0) > 0;

  return (
    <div className="flex flex-col gap-4">
      <Card className="glass-card border-0 shadow-none">
        <CardContent className="space-y-4 p-5">
          <div>
            <p className="text-label-caps">rozvrh</p>
            <p className="mt-1 text-sm font-semibold text-on-surface">
              Optimalizace dne
            </p>
          </div>
          <p className="text-body-sm leading-relaxed text-on-surface-variant">
            Úkoly z backlogu se do kalendáře dostanou až po optimalizaci. Návyky se
            zařadí podle preferovaného času.
          </p>

          {backlogCount > 0 && !hasSchedule && (
            <p className="rounded-md border border-secondary/30 bg-secondary/10 px-3 py-2 text-body-sm text-secondary">
              {backlogCount} {backlogCount === 1 ? "úkol" : "úkolů"} čeká
              v backlogu — spusťte optimalizaci.
            </p>
          )}

          <Button
            className="w-full gap-2"
            onClick={handleOptimize}
            disabled={optimizing || backlogCount === 0}
          >
            {optimizing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Optimalizovat den
          </Button>

          {backlogCount === 0 && (
            <p className="text-center text-body-sm text-on-surface-variant">
              Nejdřív přidejte úkol do backlogu.
            </p>
          )}
        </CardContent>
      </Card>

      <EfficiencyGauge
        value={efficiency?.focusLevel ?? 0}
        deepWorkHours={efficiency?.deepWorkHours ?? 0}
        meetingsHours={efficiency?.meetingsHours ?? 0}
      />

      <Card className="glass-card border-0 shadow-none">
        <CardContent className="space-y-3 p-4">
          <p className="text-label-caps">preference</p>
          <div className="flex justify-between text-body-sm">
            <span className="text-on-surface-variant">Cíl hodin</span>
            <span className="text-mono-data font-medium">{p.dailyTargetWorkHours}h</span>
          </div>
          <div className="flex justify-between text-body-sm">
            <span className="text-on-surface-variant">Pauza</span>
            <span className="text-mono-data font-medium">{p.breakDurationMin} min</span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="mt-1 w-full gap-2"
            onClick={() => setPreferencesModalOpen(true)}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Upravit preference
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
