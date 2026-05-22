import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUserId } from "./lib/auth";
import { requireProjectAccess } from "./lib/projects";

export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    await requireProjectAccess(ctx, userId, args.projectId);
    const notes = await ctx.db
      .query("projectNotes")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    return notes.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    body: v.optional(v.string()),
    parentId: v.optional(v.id("projectNotes")),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    await requireProjectAccess(ctx, userId, args.projectId);
    const existing = await ctx.db
      .query("projectNotes")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    const now = Date.now();
    const id = await ctx.db.insert("projectNotes", {
      userId,
      projectId: args.projectId,
      title: args.title.trim() || "Bez názvu",
      body: args.body ?? "",
      parentId: args.parentId,
      sortOrder: existing.length,
      updatedAt: now,
    });
    await ctx.db.patch(args.projectId, { updatedAt: now });
    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("projectNotes"),
    title: v.optional(v.string()),
    body: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const note = await ctx.db.get(args.id);
    if (!note || note.userId !== userId) throw new Error("Poznámka nenalezena");
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    const now = Date.now();
    await ctx.db.patch(id, { ...filtered, updatedAt: now });
    await ctx.db.patch(note.projectId, { updatedAt: now });
  },
});

export const remove = mutation({
  args: { id: v.id("projectNotes") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const note = await ctx.db.get(args.id);
    if (!note || note.userId !== userId) throw new Error("Poznámka nenalezena");
    await ctx.db.delete(args.id);
    await ctx.db.patch(note.projectId, { updatedAt: Date.now() });
  },
});
