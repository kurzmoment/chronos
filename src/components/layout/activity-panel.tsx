"use client";

import { useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { cs } from "date-fns/locale";
import { api } from "convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ActivityPanel({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const activity = useQuery(api.analytics.getRecentActivity, open ? {} : "skip");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nedávná aktivita</DialogTitle>
        </DialogHeader>
        <ul className="max-h-80 space-y-2 overflow-y-auto px-6 pb-6">
          {!activity?.items.length && (
            <li className="text-body-sm text-on-surface-variant">
              Zatím žádná aktivita. Dokončete úkol nebo návyk.
            </li>
          )}
          {activity?.items.map((item, i) => (
            <li
              key={`${item.kind}-${item.title}-${item.at}-${i}`}
              className="rounded-sm border border-surface-high bg-surface-container px-3 py-2"
            >
              <p className="text-body-sm text-on-surface">
                {item.kind === "task" ? "✓ Úkol" : "◎ Návyk"}: {item.title}
              </p>
              <p className="text-mono-data text-[10px] text-on-surface-variant">
                {formatDistanceToNow(item.at, { addSuffix: true, locale: cs })}
                {item.kind === "habit" && "date" in item ? ` · ${item.date}` : ""}
              </p>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
