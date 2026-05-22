import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUserId } from "./lib/auth";
import { dayEndIso, dayStartIso, minutesOnDayToIso } from "./lib/time";
import { workCategoryValidator } from "./lib/workCategory";

export const listForDay = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const start = dayStartIso(args.date);
    const end = dayEndIso(args.date);

    const events = await ctx.db
      .query("calendarEvents")
      .withIndex("by_user_and_time", (q) => q.eq("userId", userId))
      .collect();

    return events
      .filter((e) => e.start >= start && e.start <= end)
      .sort((a, b) => a.start.localeCompare(b.start));
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    start: v.string(),
    end: v.string(),
    isWorkContext: v.boolean(),
    isFixed: v.boolean(),
    workCategory: v.optional(workCategoryValidator),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const workCategory =
      args.workCategory ??
      (args.isWorkContext ? ("MEETING" as const) : undefined);
    return await ctx.db.insert("calendarEvents", {
      userId,
      title: args.title,
      description: args.description,
      start: args.start,
      end: args.end,
      isWorkContext: args.isWorkContext,
      isFixed: args.isFixed,
      workCategory,
      eventType: "EVENT",
    });
  },
});

export const moveToTime = mutation({
  args: {
    id: v.id("calendarEvents"),
    date: v.string(),
    startMin: v.number(),
    endMin: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const event = await ctx.db.get(args.id);
    if (!event || event.userId !== userId) {
      throw new Error("Událost nenalezena");
    }
    if (args.endMin <= args.startMin) {
      throw new Error("Neplatný časový rozsah");
    }

    await ctx.db.patch(args.id, {
      start: minutesOnDayToIso(args.date, args.startMin),
      end: minutesOnDayToIso(args.date, args.endMin),
      isFixed: true,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("calendarEvents"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    start: v.optional(v.string()),
    end: v.optional(v.string()),
    isWorkContext: v.optional(v.boolean()),
    isFixed: v.optional(v.boolean()),
    workCategory: v.optional(workCategoryValidator),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const event = await ctx.db.get(args.id);
    if (!event || event.userId !== userId) {
      throw new Error("Událost nenalezena");
    }

    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );
    await ctx.db.patch(id, filtered);
  },
});

export const remove = mutation({
  args: { id: v.id("calendarEvents") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const event = await ctx.db.get(args.id);
    if (!event || event.userId !== userId) {
      throw new Error("Událost nenalezena");
    }
    await ctx.db.delete(args.id);
  },
});

export const clearGeneratedForDay = mutation({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const start = dayStartIso(args.date);
    const end = dayEndIso(args.date);

    const events = await ctx.db
      .query("calendarEvents")
      .withIndex("by_user_and_time", (q) => q.eq("userId", userId))
      .collect();

    for (const event of events) {
      if (
        event.start >= start &&
        event.start <= end &&
        !event.isFixed &&
        event.eventType !== "EVENT"
      ) {
        await ctx.db.delete(event._id);
      }
    }

    const scheduledTasks = await ctx.db
      .query("tasks")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", userId).eq("status", "SCHEDULED")
      )
      .collect();

    for (const task of scheduledTasks) {
      await ctx.db.patch(task._id, { status: "BACKLOG" });
    }
  },
});
