"use client";

import { useQuery } from "convex/react";
import { useMemo, useState } from "react";
import { format, parseISO, startOfWeek, endOfWeek } from "date-fns";
import { cs } from "date-fns/locale";
import { Copy, Check } from "lucide-react";
import { api } from "convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAppStore } from "@/store/app-store";

function weekRange(anchorDate: string) {
  const d = parseISO(anchorDate);
  const from = format(startOfWeek(d, { weekStartsOn: 1 }), "yyyy-MM-dd");
  const to = format(endOfWeek(d, { weekStartsOn: 1 }), "yyyy-MM-dd");
  return { from, to };
}

function rowsToCsv(
  rows: {
    date: string;
    startTime: string;
    endTime: string;
    title: string;
    categoryLabel: string;
    durationHours: number;
    description: string;
  }[]
) {
  const header = "Datum;Od;Do;Hodiny;Kategorie;Aktivita;Poznámka";
  const lines = rows.map(
    (r) =>
      `${r.date};${r.startTime};${r.endTime};${r.durationHours};${r.categoryLabel};"${r.title.replace(/"/g, '""')}";"${(r.description ?? "").replace(/"/g, '""')}"`
  );
  return [header, ...lines].join("\n");
}

export function WorkTimesheet() {
  const selectedDate = useAppStore((s) => s.selectedDate);
  const { from, to } = useMemo(() => weekRange(selectedDate), [selectedDate]);
  const data = useQuery(api.analytics.getWorkTimesheet, { from, to });
  const [copied, setCopied] = useState(false);

  const rangeLabel = `${format(parseISO(from), "d. M.", { locale: cs })} – ${format(parseISO(to), "d. M. yyyy", { locale: cs })}`;

  async function copyCsv() {
    if (!data?.rows.length) return;
    await navigator.clipboard.writeText(rowsToCsv(data.rows));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card className="glass-card border-0 shadow-none">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b border-[var(--glass-border)] px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-on-surface">
            Výkaz práce (backoffice)
          </h2>
          <p className="text-body-sm text-on-surface-variant">
            Týden {rangeLabel} · podle data v kalendáři
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="gap-1.5"
          disabled={!data?.rows.length}
          onClick={copyCsv}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          {copied ? "Zkopírováno" : "Kopírovat CSV"}
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        {data && data.totalsByCategory.some((t) => t.minutes > 0) && (
          <div className="flex flex-wrap gap-2 border-b border-[var(--glass-border)] px-5 py-3">
            {data.totalsByCategory
              .filter((t) => t.minutes > 0)
              .map((t) => (
                <span
                  key={t.category}
                  className="rounded-full border border-[var(--glass-border)] bg-surface-container/60 px-3 py-1 text-xs text-on-surface"
                >
                  {t.label}: <strong>{t.hours} h</strong>
                </span>
              ))}
            <span className="rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 text-xs text-secondary">
              Celkem: <strong>{data.totalHours} h</strong>
            </span>
          </div>
        )}

        <div className="max-h-[420px] overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-surface-container/95 text-[11px] uppercase tracking-wide text-on-surface-variant">
              <tr className="border-b border-[var(--glass-border)]">
                <th className="px-4 py-2 font-medium">Datum</th>
                <th className="px-2 py-2 font-medium">Čas</th>
                <th className="px-2 py-2 font-medium">Kategorie</th>
                <th className="px-2 py-2 font-medium">Aktivita</th>
                <th className="px-4 py-2 text-right font-medium">Hodiny</th>
              </tr>
            </thead>
            <tbody>
              {!data?.rows.length && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-on-surface-variant"
                  >
                    V tomto týdnu žádné pracovní bloky. Označte aktivity v
                    kalendáři jako práci a nastavte typ (schůzka / deep work).
                  </td>
                </tr>
              )}
              {data?.rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-surface-high/40 hover:bg-surface-container/40"
                >
                  <td className="whitespace-nowrap px-4 py-2 text-mono-data text-xs">
                    {format(parseISO(row.date), "EEE d.M.", { locale: cs })}
                  </td>
                  <td className="whitespace-nowrap px-2 py-2 text-mono-data text-xs text-on-surface-variant">
                    {row.startTime}–{row.endTime}
                  </td>
                  <td className="px-2 py-2 text-xs">{row.categoryLabel}</td>
                  <td className="max-w-[200px] truncate px-2 py-2">
                    {row.title}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right font-medium tabular-nums">
                    {row.durationHours}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
