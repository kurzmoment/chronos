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
      .query("projectSnippets")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    return items.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    language: v.string(),
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    await requireProjectAccess(ctx, userId, args.projectId);
    const existing = await ctx.db
      .query("projectSnippets")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    const now = Date.now();
    const id = await ctx.db.insert("projectSnippets", {
      userId,
      projectId: args.projectId,
      title: args.title.trim() || "Snippet",
      language: args.language || "text",
      code: args.code,
      sortOrder: existing.length,
      updatedAt: now,
    });
    await ctx.db.patch(args.projectId, { updatedAt: now });
    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("projectSnippets"),
    title: v.optional(v.string()),
    language: v.optional(v.string()),
    code: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const item = await ctx.db.get(args.id);
    if (!item || item.userId !== userId) throw new Error("Snippet nenalezen");
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
  args: { id: v.id("projectSnippets") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const item = await ctx.db.get(args.id);
    if (!item || item.userId !== userId) throw new Error("Snippet nenalezen");
    await ctx.db.delete(args.id);
    await ctx.db.patch(item.projectId, { updatedAt: Date.now() });
  },
});
