"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ProductivityFlow() {
  const data = useQuery(api.analytics.getProductivityFlow);

  if (!data) return null;

  const maxMin = Math.max(...data.bars.map((b) => b.minutes), 1);
  const w = 400;
  const h = 120;
  const points = data.bars
    .map((b, i) => {
      const x = (i / Math.max(data.bars.length - 1, 1)) * w;
      const y = h - (b.minutes / maxMin) * (h - 8);
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
  const area = `${points} L${w},${h} L0,${h} Z`;
  const peak = Math.max(...data.bars.map((b) => b.minutes));
  const peakPct = maxMin > 0 ? Math.round((peak / maxMin) * 100) : 0;

  return (
    <Card className="glass-card h-full border-0 shadow-none">
      <CardHeader className="flex flex-row items-start justify-between px-5 pb-0 pt-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
            performance flow
          </p>
          <p className="mt-1 text-base font-semibold text-on-surface">
            7-day efficiency aggregate
          </p>
        </div>
        <span className="rounded-full border border-secondary/40 bg-secondary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary">
          live
        </span>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="h-44 w-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="flowFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4cd7f6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#4cd7f6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#flowFill)" />
          <path
            d={points}
            fill="none"
            stroke="#4cd7f6"
            strokeWidth="2.5"
            className="drop-shadow-[0_0_8px_rgba(76,215,246,0.6)]"
          />
        </svg>
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[0.5px] border-[var(--glass-border)] pt-4 sm:grid-cols-4">
          {[
            { label: "peak output", value: `${peakPct}%` },
            { label: "recovery", value: `${Math.round(peak / 60)}h` },
            { label: "focus", value: `${peak}m` },
            { label: "stress", value: "low", accent: true },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
                {s.label}
              </p>
              <p
                className={
                  s.accent
                    ? "text-mono-data text-sm font-semibold text-accent-critical"
                    : "text-mono-data text-sm font-semibold text-on-surface"
                }
              >
                {s.value}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
