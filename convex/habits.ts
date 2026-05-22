import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUserId } from "./lib/auth";
import { format } from "date-fns";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    return await ctx.db
      .query("habits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const listWithCompletions = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const habits = await ctx.db
      .query("habits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const completions = await ctx.db
      .query("habitCompletions")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", userId).eq("date", args.date)
      )
      .collect();

    const completedIds = new Set(completions.map((c) => c.habitId));

    return habits.map((habit) => ({
      ...habit,
      completedToday: completedIds.has(habit._id),
    }));
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    durationMin: v.number(),
    frequency: v.union(v.literal("DAILY"), v.literal("WEEKLY")),
    preferredTimeOfDay: v.union(
      v.literal("MORNING"),
      v.literal("AFTERNOON"),
      v.literal("EVENING"),
      v.literal("ANYTIME")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    return await ctx.db.insert("habits", {
      userId,
      ...args,
      currentStreak: 0,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("habits") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const habit = await ctx.db.get(args.id);
    if (!habit || habit.userId !== userId) {
      throw new Error("Návyk nenalezen");
    }
    await ctx.db.delete(args.id);
  },
});

export const toggleCompletion = mutation({
  args: {
    habitId: v.id("habits"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const habit = await ctx.db.get(args.habitId);
    if (!habit || habit.userId !== userId) {
      throw new Error("Návyk nenalezen");
    }

    const existing = await ctx.db
      .query("habitCompletions")
      .withIndex("by_habit_date", (q) =>
        q.eq("habitId", args.habitId).eq("date", args.date)
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      await ctx.db.patch(args.habitId, {
        currentStreak: Math.max(0, habit.currentStreak - 1),
      });
      return false;
    }

    await ctx.db.insert("habitCompletions", {
      userId,
      habitId: args.habitId,
      date: args.date,
    });

    const yesterday = format(
      new Date(new Date(args.date).getTime() - 86400000),
      "yyyy-MM-dd"
    );
    const yesterdayCompletion = await ctx.db
      .query("habitCompletions")
      .withIndex("by_habit_date", (q) =>
        q.eq("habitId", args.habitId).eq("date", yesterday)
      )
      .unique();

    const newStreak =
      habit.frequency === "DAILY" && yesterdayCompletion
        ? habit.currentStreak + 1
        : habit.currentStreak + 1;

    await ctx.db.patch(args.habitId, { currentStreak: newStreak });
    return true;
  },
});
