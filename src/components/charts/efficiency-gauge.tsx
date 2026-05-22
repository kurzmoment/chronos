"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionLabel } from "@/components/ui/section-label";

export function EfficiencyGauge({
  value = 0,
  deepWorkHours = 0,
  meetingsHours = 0,
}: {
  value?: number;
  deepWorkHours?: number;
  meetingsHours?: number;
}) {
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (value / 100) * circumference;

  return (
    <Card className="glass-card border-0">
      <CardHeader className="pb-2">
        <SectionLabel>focus velocity</SectionLabel>
      </CardHeader>
      <CardContent className="flex flex-col items-center pb-6">
        <div className="relative h-36 w-36">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-surface-highest"
            />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="text-secondary transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-on-surface">{value}%</span>
            <span className="text-label-sm">focus level</span>
          </div>
        </div>
        <div className="mt-4 grid w-full grid-cols-2 gap-4 border-t border-surface-high pt-4 text-center">
          <div>
            <p className="text-mono-data text-lg font-semibold text-on-surface">
              {deepWorkHours}h
            </p>
            <p className="text-label-sm">deep work</p>
          </div>
          <div>
            <p className="text-mono-data text-lg font-semibold text-on-surface">
              {meetingsHours}h
            </p>
            <p className="text-label-sm">meetings</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
