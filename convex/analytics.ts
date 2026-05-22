import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireUserId } from "./lib/auth";
import { dayEndIso, dayStartIso, isoToMinutesOnDay } from "./lib/time";
import {
  isTimesheetEntry,
  resolveWorkCategory,
  type WorkCategory,
} from "./lib/workCategory";

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T12:00:00`);
  d.setDate(d.getDate() + days);
  return dateKey(d);
}

function eventDurationMin(start: string, end: string): number {
  return Math.max(
    0,
    Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000)
  );
}

export const getHabitConsistency = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const habits = await ctx.db
      .query("habits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const habitCount = habits.length;
    if (habitCount === 0) {
      return { days: [] as { date: string; rate: number }[], habitCount: 0 };
    }

    const today = dateKey(new Date());
    const days: { date: string; rate: number }[] = [];

    for (let i = 30; i >= 0; i--) {
      const date = addDays(today, -i);
      const completions = await ctx.db
        .query("habitCompletions")
        .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", date))
        .collect();
      days.push({
        date,
        rate: Math.min(1, completions.length / habitCount),
      });
    }

    return { days, habitCount };
  },
});

export const getProductivityFlow = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const today = dateKey(new Date());
    const weekdayLabels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const bars: { label: string; minutes: number; isToday: boolean }[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = addDays(today, -i);
      const start = dayStartIso(date);
      const end = dayEndIso(date);
      const events = await ctx.db
        .query("calendarEvents")
        .withIndex("by_user_and_time", (q) => q.eq("userId", userId))
        .collect();

      const minutes = events
        .filter(
          (e) =>
            e.start >= start &&
            e.start <= end &&
            e.eventType === "TASK" &&
            e.isWorkContext
        )
        .reduce((sum, e) => sum + eventDurationMin(e.start, e.end), 0);

      const d = new Date(`${date}T12:00:00`);
      bars.push({
        label: weekdayLabels[d.getDay()],
        minutes,
        isToday: date === today,
      });
    }

    const thisWeek = bars.slice(-7).reduce((s, b) => s + b.minutes, 0);
    const lastWeekStart = addDays(today, -13);
    let lastWeek = 0;
    for (let i = 0; i < 7; i++) {
      const date = addDays(lastWeekStart, i);
      const start = dayStartIso(date);
      const end = dayEndIso(date);
      const events = await ctx.db
        .query("calendarEvents")
        .withIndex("by_user_and_time", (q) => q.eq("userId", userId))
        .collect();
      lastWeek += events
        .filter(
          (e) =>
            e.start >= start &&
            e.start <= end &&
            e.eventType === "TASK" &&
            e.isWorkContext
        )
        .reduce((sum, e) => sum + eventDurationMin(e.start, e.end), 0);
    }

    const weekChangePct =
      lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : 0;

    return { bars, weekChangePct };
  },
});

export const getFocusDepth = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const start = dayStartIso(args.date);
    const end = dayEndIso(args.date);

    const events = await ctx.db
      .query("calendarEvents")
      .withIndex("by_user_and_time", (q) => q.eq("userId", userId))
      .collect();

    const dayEvents = events.filter(
      (e) =>
        e.start >= start &&
        e.start <= end &&
        (e.eventType === "TASK" || e.eventType === "HABIT")
    );

    const buckets = Array.from({ length: 17 }, (_, i) => ({
      hour: 6 + i,
      minutes: 0,
    }));

    for (const e of dayEvents) {
      const hour = Math.floor(isoToMinutesOnDay(e.start, args.date) / 60);
      const idx = hour - 6;
      if (idx >= 0 && idx < buckets.length) {
        buckets[idx].minutes += eventDurationMin(e.start, e.end);
      }
    }

    const totalMin = dayEvents.reduce(
      (s, e) => s + eventDurationMin(e.start, e.end),
      0
    );
    const avgSession =
      dayEvents.length > 0 ? Math.round(totalMin / dayEvents.length) : 0;

    return { buckets, avgSessionMin: avgSession };
  },
});

export const getDayEfficiency = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const start = dayStartIso(args.date);
    const end = dayEndIso(args.date);

    const prefs =
      (await ctx.db
        .query("userPreferences")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .unique()) ?? { dailyTargetWorkHours: 8 };

    const events = await ctx.db
      .query("calendarEvents")
      .withIndex("by_user_and_time", (q) => q.eq("userId", userId))
      .collect();

    const dayEvents = events.filter((e) => e.start >= start && e.start <= end);

    let deepWorkMin = 0;
    let meetingsMin = 0;

    for (const e of dayEvents) {
      const dur = eventDurationMin(e.start, e.end);
      const cat = resolveWorkCategory(e);
      if (cat === "MEETING") meetingsMin += dur;
      else if (cat === "DEEP_WORK" || cat === "ADMIN" || cat === "OTHER") {
        deepWorkMin += dur;
      } else if (e.eventType === "HABIT") {
        deepWorkMin += dur;
      }
    }

    const targetMin = prefs.dailyTargetWorkHours * 60;
    const focusLevel = Math.min(
      100,
      targetMin > 0 ? Math.round((deepWorkMin / targetMin) * 100) : 0
    );

    return {
      focusLevel,
      deepWorkHours: Math.round((deepWorkMin / 60) * 10) / 10,
      meetingsHours: Math.round((meetingsMin / 60) * 10) / 10,
    };
  },
});

export const getInsight = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);

    const habits = await ctx.db
      .query("habits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const topHabit = [...habits].sort(
      (a, b) => b.currentStreak - a.currentStreak
    )[0];

    const backlog = await ctx.db
      .query("tasks")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", userId).eq("status", "BACKLOG")
      )
      .collect();

    const topTask = [...backlog].sort((a, b) => a.priority - b.priority)[0];

    let insightText =
      "Přidejte návyky a úkoly — Chronos z nich vypočítá doporučení.";
    if (topHabit && topHabit.currentStreak > 0) {
      insightText = `Návyk „${topHabit.title}" má ${topHabit.currentStreak}denní sérii. Držte rytmus — konzistence zvyšuje šanci na splnění.`;
    } else if (topTask) {
      insightText = `Nejdřív doporučujeme „${topTask.title}" (priorita ${topTask.priority}). Po optimalizaci dne se objeví v kalendáři.`;
    }

    return {
      insightText,
      topHabitTitle: topHabit?.title ?? null,
      topTaskTitle: topTask?.title ?? null,
    };
  },
});

export const getRecentActivity = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const today = dateKey(new Date());

    const doneTasks = await ctx.db
      .query("tasks")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", userId).eq("status", "DONE")
      )
      .collect();

    const recentTasks = [...doneTasks]
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, 5)
      .map((t) => ({
        kind: "task" as const,
        title: t.title,
        at: t._creationTime,
      }));

    const habits = await ctx.db
      .query("habits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const habitById = new Map(habits.map((h) => [h._id, h]));

    const habitItems: {
      kind: "habit";
      title: string;
      date: string;
      at: number;
    }[] = [];

    for (let i = 0; i < 14; i++) {
      const date = addDays(today, -i);
      const completions = await ctx.db
        .query("habitCompletions")
        .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", date))
        .collect();
      for (const c of completions) {
        const habit = habitById.get(c.habitId);
        if (habit) {
          habitItems.push({
            kind: "habit",
            title: habit.title,
            date,
            at: c._creationTime,
          });
        }
      }
    }

    habitItems.sort((a, b) => b.at - a.at);

    return {
      items: [...recentTasks, ...habitItems.slice(0, 5)]
        .sort((a, b) => b.at - a.at)
        .slice(0, 8),
    };
  },
});

const categoryLabels: Record<WorkCategory, string> = {
  MEETING: "Schůzka",
  DEEP_WORK: "Deep work",
  ADMIN: "Administrativa",
  OTHER: "Jiná práce",
};

export const getWorkTimesheet = query({
  args: { from: v.string(), to: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const rangeStart = dayStartIso(args.from);
    const rangeEnd = dayEndIso(args.to);

    const events = await ctx.db
      .query("calendarEvents")
      .withIndex("by_user_and_time", (q) => q.eq("userId", userId))
      .collect();

    const rows = events
      .filter(
        (e) =>
          e.start >= rangeStart &&
          e.start <= rangeEnd &&
          isTimesheetEntry(e)
      )
      .map((e) => {
        const cat = resolveWorkCategory(e)!;
        const durationMin = eventDurationMin(e.start, e.end);
        const date = e.start.slice(0, 10);
        return {
          id: e._id,
          date,
          start: e.start,
          end: e.end,
          startTime: formatWallClock(e.start),
          endTime: formatWallClock(e.end),
          title: e.title,
          description: e.description ?? "",
          category: cat,
          categoryLabel: categoryLabels[cat],
          durationMin,
          durationHours: Math.round((durationMin / 60) * 100) / 100,
        };
      })
      .sort((a, b) => a.start.localeCompare(b.start));

    const totalsByCategory: Record<WorkCategory, number> = {
      MEETING: 0,
      DEEP_WORK: 0,
      ADMIN: 0,
      OTHER: 0,
    };
    let totalMin = 0;
    for (const row of rows) {
      totalsByCategory[row.category] += row.durationMin;
      totalMin += row.durationMin;
    }

    return {
      rows,
      totalsByCategory: Object.entries(totalsByCategory).map(([cat, min]) => ({
        category: cat as WorkCategory,
        label: categoryLabels[cat as WorkCategory],
        hours: Math.round((min / 60) * 100) / 100,
        minutes: min,
      })),
      totalHours: Math.round((totalMin / 60) * 100) / 100,
      totalMinutes: totalMin,
    };
  },
});

function formatWallClock(iso: string): string {
  const d = new Date(iso);
  const h = String(d.getUTCHours()).padStart(2, "0");
  const m = String(d.getUTCMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export const getBacklogSummary = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);

    const backlog = await ctx.db
      .query("tasks")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", userId).eq("status", "BACKLOG")
      )
      .collect();

    const done = await ctx.db
      .query("tasks")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", userId).eq("status", "DONE")
      )
      .collect();

    const totalMin = backlog.reduce((s, t) => s + t.estimatedDurationMin, 0);
    const topTask = [...backlog].sort((a, b) => a.priority - b.priority)[0];

    const efficiencyPct =
      backlog.length + done.length > 0
        ? Math.round((done.length / (backlog.length + done.length)) * 100)
        : 0;

    return {
      pendingCount: backlog.length,
      totalEstimatedHours: Math.round((totalMin / 60) * 10) / 10,
      topTaskTitle: topTask?.title ?? null,
      efficiencyPct,
    };
  },
});
