"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useAppStore } from "@/store/app-store";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionLabel } from "@/components/ui/section-label";

export function FocusDepthChart() {
  const selectedDate = useAppStore((s) => s.selectedDate);
  const data = useQuery(api.analytics.getFocusDepth, { date: selectedDate });

  if (!data) return null;

  const maxMin = Math.max(...data.buckets.map((b) => b.minutes), 1);
  const w = 360;
  const h = 100;
  const points = data.buckets
    .map((b, i) => {
      const x = (i / (data.buckets.length - 1)) * w;
      const y = h - (b.minutes / maxMin) * h;
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
  const area = `${points} L${w},${h} L0,${h} Z`;
  const peakIdx = data.buckets.reduce(
    (best, b, i, arr) => (b.minutes > arr[best].minutes ? i : best),
    0
  );
  const peakX = (peakIdx / (data.buckets.length - 1)) * w;
  const peakY = h - (data.buckets[peakIdx].minutes / maxMin) * h;

  return (
    <Card className="glass-card h-full border-0">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <SectionLabel>focus session depth</SectionLabel>
          <p className="text-title-md font-semibold text-on-surface">
            Focus Session Depth
          </p>
        </div>
        <span className="text-mono-data text-[10px] text-on-surface-variant">
          {data.avgSessionMin}m AVG. SESSION
        </span>
      </CardHeader>
      <CardContent>
        {data.buckets.every((b) => b.minutes === 0) ? (
          <p className="py-8 text-center text-body-sm text-on-surface-variant">
            Naplánujte den pro zobrazení hloubky focusu.
          </p>
        ) : (
          <>
            <svg viewBox={`0 0 ${w} ${h + 20}`} className="h-40 w-full">
              <defs>
                <linearGradient id="focusFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(192 193 255 / 0.25)" />
                  <stop offset="100%" stopColor="rgb(192 193 255 / 0)" />
                </linearGradient>
              </defs>
              <path d={area} fill="url(#focusFill)" transform="translate(0,10)" />
              <path
                d={points}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-on-surface"
                transform="translate(0,10)"
              />
              <circle
                cx={peakX}
                cy={peakY + 10}
                r="4"
                fill="white"
                className="drop-shadow-[0_0_8px_white]"
              />
            </svg>
            <div className="mt-2 flex justify-between text-mono-data text-[10px] text-on-surface-variant">
              <span>06:00</span>
              <span>10:00</span>
              <span>14:00</span>
              <span>18:00</span>
              <span>22:00</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
