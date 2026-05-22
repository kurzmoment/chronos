import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUserId } from "./lib/auth";
import { requireProjectAccess } from "./lib/projects";

export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    await requireProjectAccess(ctx, userId, args.projectId);
    const items = await ctx.db
      .query("projectLinks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    return items.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    url: v.string(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    await requireProjectAccess(ctx, userId, args.projectId);
    const existing = await ctx.db
      .query("projectLinks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    const now = Date.now();
    const id = await ctx.db.insert("projectLinks", {
      userId,
      projectId: args.projectId,
      title: args.title.trim() || args.url,
      url: args.url.trim(),
      note: args.note,
      sortOrder: existing.length,
      updatedAt: now,
    });
    await ctx.db.patch(args.projectId, { updatedAt: now });
    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("projectLinks"),
    title: v.optional(v.string()),
    url: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const item = await ctx.db.get(args.id);
    if (!item || item.userId !== userId) throw new Error("Odkaz nenalezen");
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    const now = Date.now();
    await ctx.db.patch(id, { ...filtered, updatedAt: now });
    await ctx.db.patch(item.projectId, { updatedAt: now });
  },
});

export const remove = mutation({
  args: { id: v.id("projectLinks") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const item = await ctx.db.get(args.id);
    if (!item || item.userId !== userId) throw new Error("Odkaz nenalezen");
    await ctx.db.delete(args.id);
    await ctx.db.patch(item.projectId, { updatedAt: Date.now() });
  },
});
