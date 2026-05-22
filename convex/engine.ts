import { v } from "convex/values";
import { internalMutation, internalQuery, action } from "./_generated/server";
import { internal } from "./_generated/api";
import { requireUserId } from "./lib/auth";
import { Id } from "./_generated/dataModel";
import {
  TimeRange,
  isoToMinutesOnDay,
  mergeBlockedRanges,
  minutesOnDayToIso,
  parseTimeToMinutes,
  roundUpToSlot,
  subtractRanges,
  timeOfDayRange,
  SLOT_MINUTES,
} from "./lib/time";
import { dayEndIso, dayStartIso } from "./lib/time";

const CAPACITY_TARGET = 0.78;

type ScheduledItem = {
  title: string;
  startMin: number;
  endMin: number;
  isWorkContext: boolean;
  eventType: "TASK" | "HABIT" | "BREAK";
  taskId?: Id<"tasks">;
  habitId?: Id<"habits">;
};

function allocateInRanges(
  ranges: TimeRange[],
  durationMin: number
): { range: TimeRange; startMin: number; endMin: number } | null {
  const needed = roundUpToSlot(durationMin);
  for (const range of ranges) {
    const available = range.endMin - range.startMin;
    if (available >= needed) {
      return {
        range,
        startMin: range.startMin,
        endMin: range.startMin + needed,
      };
    }
  }
  return null;
}

function consumeRange(ranges: TimeRange[], used: TimeRange): TimeRange[] {
  return subtractRanges(ranges, [used]);
}

function buildWorkBlocks(
  freeInFocus: TimeRange[],
  targetWorkMin: number,
  minBlock: number,
  maxBlock: number,
  breakMin: number
): TimeRange[] {
  const blocks: TimeRange[] = [];
  let allocated = 0;
  let ranges = [...freeInFocus];

  while (allocated < targetWorkMin && ranges.length > 0) {
    const remaining = targetWorkMin - allocated;
    const blockSize = Math.min(
      maxBlock,
      Math.max(minBlock, remaining),
      ranges[0].endMin - ranges[0].startMin
    );

    if (blockSize < minBlock && remaining < minBlock) {
      const slot = allocateInRanges(ranges, remaining);
      if (slot) {
        blocks.push({ startMin: slot.startMin, endMin: slot.endMin });
        allocated += slot.endMin - slot.startMin;
        ranges = consumeRange(ranges, {
          startMin: slot.startMin,
          endMin: slot.endMin + breakMin,
        });
      }
      break;
    }

    const slot = allocateInRanges(ranges, blockSize);
    if (!slot) break;

    blocks.push({ startMin: slot.startMin, endMin: slot.endMin });
    allocated += slot.endMin - slot.startMin;
    ranges = consumeRange(ranges, {
      startMin: slot.startMin,
      endMin: slot.endMin + breakMin,
    });
  }

  return blocks;
}

export const optimizeDay = action({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);

    const data = await ctx.runQuery(internal.engine.loadPlanningData, {
      userId,
      date: args.date,
    });

    const blocked: TimeRange[] = data.fixedEvents.map((e) => ({
      startMin: isoToMinutesOnDay(e.start, args.date),
      endMin: isoToMinutesOnDay(e.end, args.date),
    }));

    const mergedBlocked = mergeBlockedRanges(blocked);
    const dayRange: TimeRange = { startMin: 6 * 60, endMin: 22 * 60 };
    let freeRanges = subtractRanges([dayRange], mergedBlocked);

    const scheduled: ScheduledItem[] = [];
    const prefs = data.preferences;

    for (const habit of data.habits) {
      const periodRange = timeOfDayRange(args.date, habit.preferredTimeOfDay);
      const habitFree = subtractRanges(
        freeRanges.filter(
          (r) => r.endMin > periodRange.startMin && r.startMin < periodRange.endMin
        ),
        mergedBlocked
      );

      const slot = allocateInRanges(habitFree, habit.durationMin);
      if (slot) {
        scheduled.push({
          title: habit.title,
          startMin: slot.startMin,
          endMin: slot.endMin,
          isWorkContext: false,
          eventType: "HABIT",
          habitId: habit._id,
        });
        freeRanges = consumeRange(freeRanges, {
          startMin: slot.startMin,
          endMin: slot.endMin,
        });
        mergedBlocked.push({ startMin: slot.startMin, endMin: slot.endMin });
      }
    }

    const focusRanges: TimeRange[] = prefs.preferredFocusWindows.map((w) => ({
      startMin: parseTimeToMinutes(w.start),
      endMin: parseTimeToMinutes(w.end),
    }));

    let freeInFocus: TimeRange[] = [];
    for (const focus of focusRanges) {
      const intersected = subtractRanges([focus], mergeBlockedRanges([...mergedBlocked]));
      freeInFocus.push(...intersected);
    }
    freeInFocus = freeInFocus.filter((r) => r.endMin - r.startMin >= SLOT_MINUTES);

    const targetWorkMin = Math.floor(
      prefs.dailyTargetWorkHours * 60 * CAPACITY_TARGET
    );

    const workBlocks = buildWorkBlocks(
      freeInFocus,
      targetWorkMin,
      prefs.minWorkBlockMin,
      prefs.maxWorkBlockMin,
      prefs.breakDurationMin
    );

    const workTasks = data.tasks
      .filter((t) => t.isWorkContext && t.status === "BACKLOG")
      .sort((a, b) => a.priority - b.priority);

    let taskIndex = 0;
    for (let i = 0; i < workBlocks.length && taskIndex < workTasks.length; i++) {
      const block = workBlocks[i];
      let cursor = block.startMin;

      while (cursor < block.endMin && taskIndex < workTasks.length) {
        const task = workTasks[taskIndex];
        const duration = roundUpToSlot(task.estimatedDurationMin);
        const remaining = block.endMin - cursor;

        if (duration > remaining) break;

        scheduled.push({
          title: task.title,
          startMin: cursor,
          endMin: cursor + duration,
          isWorkContext: true,
          eventType: "TASK",
          taskId: task._id,
        });
        cursor += duration;
        taskIndex++;
      }

      if (i < workBlocks.length - 1) {
        const breakStart = block.endMin;
        const breakEnd = breakStart + prefs.breakDurationMin;
        scheduled.push({
          title: "Pauza",
          startMin: breakStart,
          endMin: breakEnd,
          isWorkContext: false,
          eventType: "BREAK",
        });
      }
    }

    const personalTasks = data.tasks
      .filter((t) => !t.isWorkContext && t.status === "BACKLOG")
      .sort((a, b) => a.priority - b.priority);

    for (const task of personalTasks) {
      const slot = allocateInRanges(freeRanges, task.estimatedDurationMin);
      if (!slot) break;

      scheduled.push({
        title: task.title,
        startMin: slot.startMin,
        endMin: slot.endMin,
        isWorkContext: false,
        eventType: "TASK",
        taskId: task._id,
      });
      freeRanges = consumeRange(freeRanges, {
        startMin: slot.startMin,
        endMin: slot.endMin,
      });
    }

    await ctx.runMutation(internal.engine.applySchedule, {
      userId,
      date: args.date,
      items: scheduled.map((item) => ({
        ...item,
        start: minutesOnDayToIso(args.date, item.startMin),
        end: minutesOnDayToIso(args.date, item.endMin),
      })),
    });

    return { scheduledCount: scheduled.length };
  },
});

export const loadPlanningData = internalQuery({
  args: { userId: v.id("users"), date: v.string() },
  handler: async (ctx, args) => {
    const start = dayStartIso(args.date);
    const end = dayEndIso(args.date);

    const allEvents = await ctx.db
      .query("calendarEvents")
      .withIndex("by_user_and_time", (q) => q.eq("userId", args.userId))
      .collect();

    const fixedEvents = allEvents.filter(
      (e) => e.isFixed && e.start >= start && e.start <= end
    );

    const prefs =
      (await ctx.db
        .query("userPreferences")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .unique()) ?? {
        dailyTargetWorkHours: 8,
        minWorkBlockMin: 90,
        maxWorkBlockMin: 180,
        breakDurationMin: 15,
        preferredFocusWindows: [
          { start: "09:00", end: "12:00", weight: 1.0 },
          { start: "13:00", end: "17:00", weight: 0.8 },
        ],
      };

    const habits = await ctx.db
      .query("habits")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const backlogTasks = await ctx.db
      .query("tasks")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", args.userId).eq("status", "BACKLOG")
      )
      .collect();

    return {
      fixedEvents,
      preferences: prefs,
      habits,
      tasks: backlogTasks,
    };
  },
});

export const applySchedule = internalMutation({
  args: {
    userId: v.id("users"),
    date: v.string(),
    items: v.array(
      v.object({
        title: v.string(),
        start: v.string(),
        end: v.string(),
        startMin: v.number(),
        endMin: v.number(),
        isWorkContext: v.boolean(),
        eventType: v.union(
          v.literal("TASK"),
          v.literal("HABIT"),
          v.literal("BREAK")
        ),
        taskId: v.optional(v.id("tasks")),
        habitId: v.optional(v.id("habits")),
      })
    ),
  },
  handler: async (ctx, args) => {
    const start = dayStartIso(args.date);
    const end = dayEndIso(args.date);

    const existing = await ctx.db
      .query("calendarEvents")
      .withIndex("by_user_and_time", (q) => q.eq("userId", args.userId))
      .collect();

    for (const event of existing) {
      if (
        event.start >= start &&
        event.start <= end &&
        !event.isFixed &&
        event.eventType !== "EVENT"
      ) {
        await ctx.db.delete(event._id);
      }
    }

    for (const item of args.items) {
      await ctx.db.insert("calendarEvents", {
        userId: args.userId,
        title: item.title,
        start: item.start,
        end: item.end,
        isWorkContext: item.isWorkContext,
        isFixed: false,
        eventType: item.eventType,
        workCategory:
          item.eventType === "TASK" && item.isWorkContext
            ? "DEEP_WORK"
            : undefined,
        taskId: item.taskId,
        habitId: item.habitId,
      });

      if (item.eventType === "TASK" && item.taskId) {
        await ctx.db.patch(item.taskId, { status: "SCHEDULED" });
      }
    }
  },
});
