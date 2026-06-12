"use client";

import Link from "next/link";
import { ConsistencyMatrix } from "@/components/charts/consistency-matrix";
import { FocusDepthChart } from "@/components/charts/focus-depth-chart";
import { ProductivityFlow } from "@/components/charts/productivity-flow";
import { EfficiencyGauge } from "@/components/charts/efficiency-gauge";
import { WorkTimesheet } from "@/components/analytics/work-timesheet";
import { AppShell } from "@/components/layout/app-shell";
import { useAppStore } from "@/store/app-store";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";

export function AnalyticsPage() {
  const selectedDate = useAppStore((s) => s.selectedDate);
  const efficiency = useQuery(api.analytics.getDayEfficiency, { date: selectedDate });

  return (
    <AppShell searchPlaceholder="Filtrovat statistiky…">
      <div className="mb-6 rounded-xl border border-[var(--glass-border)] bg-surface-container/40 p-5 shadow-[var(--shadow-ambient)] backdrop-blur-2xl">
        <p className="section-kicker">statistiky</p>
        <h1 className="mt-1 text-[clamp(2rem,4vw,3.75rem)] font-black leading-none tracking-[-0.06em] text-on-surface">
          Analytics
        </h1>
        <p className="mt-3 max-w-3xl text-body-sm text-on-surface-variant">
          Grafy z kalendáře a návyků. Úkoly a plán dne spravujte v{" "}
          <Link href="/dashboard" className="text-secondary hover:underline">
            Dnešku
          </Link>
          , návyky v sekci{" "}
          <Link href="/habits" className="text-secondary hover:underline">
            Habits
          </Link>
          .
        </p>
      </div>

      <div className="space-y-5">
        <WorkTimesheet />

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ProductivityFlow />
          </div>
          <ConsistencyMatrix />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <EfficiencyGauge
            value={efficiency?.focusLevel ?? 0}
            deepWorkHours={efficiency?.deepWorkHours ?? 0}
            meetingsHours={efficiency?.meetingsHours ?? 0}
          />
          <div className="md:col-span-2">
            <FocusDepthChart />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
