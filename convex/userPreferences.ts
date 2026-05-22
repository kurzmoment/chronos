import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUserId } from "./lib/auth";

const defaultPreferences = {
  dailyTargetWorkHours: 8,
  minWorkBlockMin: 90,
  maxWorkBlockMin: 180,
  breakDurationMin: 15,
  activeContextTags: [] as string[],
  preferredFocusWindows: [
    { start: "09:00", end: "12:00", weight: 1.0 },
    { start: "13:00", end: "17:00", weight: 0.8 },
  ],
};

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const prefs = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    return prefs ?? { ...defaultPreferences, userId };
  },
});

export const upsert = mutation({
  args: {
    dailyTargetWorkHours: v.number(),
    minWorkBlockMin: v.number(),
    maxWorkBlockMin: v.number(),
    breakDurationMin: v.number(),
    preferredFocusWindows: v.array(
      v.object({
        start: v.string(),
        end: v.string(),
        weight: v.number(),
      })
    ),
    activeContextTags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }

    return await ctx.db.insert("userPreferences", { userId, ...args });
  },
});

export const ensureDefaults = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!existing) {
      await ctx.db.insert("userPreferences", {
        userId,
        ...defaultPreferences,
      });
    }
  },
});
