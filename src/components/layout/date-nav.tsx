"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, format, parseISO } from "date-fns";
import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";

export function DateNav() {
  const selectedDate = useAppStore((s) => s.selectedDate);
  const setSelectedDate = useAppStore((s) => s.setSelectedDate);
  const isToday = selectedDate === format(new Date(), "yyyy-MM-dd");

  function changeDay(offset: number) {
    setSelectedDate(
      format(addDays(parseISO(selectedDate), offset), "yyyy-MM-dd")
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => changeDay(-1)}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant={isToday ? "default" : "secondary"}
        className="h-8 px-3 text-xs"
        onClick={() => setSelectedDate(format(new Date(), "yyyy-MM-dd"))}
      >
        today
      </Button>
      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => changeDay(1)}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
