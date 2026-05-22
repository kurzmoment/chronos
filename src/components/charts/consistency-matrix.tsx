"use client";

import { useQuery } from "convex/react";
import { format, parseISO } from "date-fns";
import { cs } from "date-fns/locale";
import { api } from "convex/_generated/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionLabel } from "@/components/ui/section-label";

export function ConsistencyMatrix() {
  const data = useQuery(api.analytics.getHabitConsistency);

  if (!data) {
    return null;
  }

  const first = data.days[0]?.date;
  const mid = data.days[Math.floor(data.days.length / 2)]?.date;
  const last = data.days[data.days.length - 1]?.date;

  const fmt = (d?: string) =>
    d ? format(parseISO(d), "MMM dd", { locale: cs }).toUpperCase() : "";

  return (
    <Card className="glass-card border-0">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <SectionLabel>consistency matrix</SectionLabel>
          <p className="text-title-md font-semibold text-on-surface">habit density</p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-on-surface-variant">
          <span>0%</span>
          <div className="flex gap-0.5">
            {[0.2, 0.5, 0.8, 1].map((o) => (
              <div
                key={o}
                className="h-3 w-3 rounded-sm bg-secondary"
                style={{ opacity: o }}
              />
            ))}
          </div>
          <span>100%</span>
        </div>
      </CardHeader>
      <CardContent>
        {data.habitCount === 0 ? (
          <p className="text-body-sm text-on-surface-variant">
            Přidejte návyky pro zobrazení matice konzistence.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap gap-1.5">
              {data.days.map((day) => (
                <div
                  key={day.date}
                  className="h-8 w-8 rounded-md bg-secondary"
                  style={{ opacity: Math.max(0.12, day.rate) }}
                  title={`${day.date}: ${Math.round(day.rate * 100)}%`}
                />
              ))}
            </div>
            <div className="mt-3 flex justify-between text-mono-data text-[10px] text-on-surface-variant">
              <span>{fmt(first)}</span>
              <span>{fmt(mid)}</span>
              <span>{fmt(last)}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
