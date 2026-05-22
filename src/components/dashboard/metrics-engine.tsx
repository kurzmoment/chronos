"use client";

import { useQuery } from "convex/react";
import { Cpu, Gauge, Hourglass } from "lucide-react";
import { api } from "convex/_generated/api";
import { useAppStore } from "@/store/app-store";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  valueClass,
  children,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  valueClass?: string;
  children?: React.ReactNode;
}) {
  return (
    <Card className="glass-card border-0 shadow-none">
      <CardContent className="p-5">
        <div className="mb-3 flex items-start justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
            {label}
          </span>
          <Icon className="h-5 w-5 text-on-surface-variant/70" />
        </div>
        <p className={cn("text-mono-data text-[2rem] font-semibold leading-none", valueClass)}>
          {value}
        </p>
        {sub && <p className="mt-2 text-[12px] text-secondary">{sub}</p>}
        {children}
      </CardContent>
    </Card>
  );
}

export function MetricsEngine() {
  const selectedDate = useAppStore((s) => s.selectedDate);
  const efficiency = useQuery(api.analytics.getDayEfficiency, { date: selectedDate });
  const backlog = useQuery(api.tasks.listByStatus, { status: "BACKLOG" });
  const habits = useQuery(api.habits.listWithCompletions, { date: selectedDate });

  const focus = efficiency?.focusLevel ?? 0;
  const load = backlog?.length ?? 0;
  const uptimeH = Math.floor(efficiency?.deepWorkHours ?? 0);
  const uptimeM = Math.round(((efficiency?.deepWorkHours ?? 0) % 1) * 60);
  const nodes = habits?.slice(0, 3) ?? [];

  return (
    <div className="flex flex-col gap-3">
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
        metrics engine
      </span>

      <MetricCard label="focus velocity" value={`${focus}%`} icon={Gauge}>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-highest">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary-dim to-secondary shadow-[var(--glow-cyan)]"
            style={{ width: `${focus}%` }}
          />
        </div>
      </MetricCard>

      <MetricCard
        label="system load"
        value={`${load} tps`}
        sub="optimal bandwidth usage"
        icon={Cpu}
        valueClass="text-secondary"
      />

      <MetricCard
        label="daily uptime"
        value={`${String(uptimeH).padStart(2, "0")}:${String(uptimeM).padStart(2, "0")} hrs`}
        icon={Hourglass}
        valueClass="text-tertiary"
      />

      <Card className="glass-card relative overflow-hidden border-0 shadow-none">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 20%, var(--secondary) 0%, transparent 50%)",
          }}
        />
        <CardContent className="relative space-y-3 p-5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
            node status
          </span>
          {nodes.length ? (
            nodes.map((h) => (
              <div
                key={h._id}
                className="flex items-center justify-between text-sm text-on-surface"
              >
                <span className="truncate font-medium">{h.title}</span>
                <span className={h.completedToday ? "glow-dot" : "glow-dot opacity-30"} />
              </div>
            ))
          ) : (
            <p className="text-body-sm text-on-surface-variant">no active nodes</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
