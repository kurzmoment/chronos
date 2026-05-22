import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUserId } from "./lib/auth";
import { ensureDefaultProject, requireProjectAccess } from "./lib/projects";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const enriched = await Promise.all(
      projects.map(async (project) => {
        const [notes, snippets, links, backlogTasks] = await Promise.all([
          ctx.db
            .query("projectNotes")
            .withIndex("by_project", (q) => q.eq("projectId", project._id))
            .collect(),
          ctx.db
            .query("projectSnippets")
            .withIndex("by_project", (q) => q.eq("projectId", project._id))
            .collect(),
          ctx.db
            .query("projectLinks")
            .withIndex("by_project", (q) => q.eq("projectId", project._id))
            .collect(),
          ctx.db
            .query("tasks")
            .withIndex("by_project_status", (q) =>
              q.eq("projectId", project._id).eq("status", "BACKLOG")
            )
            .collect(),
        ]);
        return {
          ...project,
          counts: {
            notes: notes.length,
            snippets: snippets.length,
            links: links.length,
            backlogTasks: backlogTasks.length,
          },
        };
      })
    );

    return enriched.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const get = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    return await requireProjectAccess(ctx, userId, args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const now = Date.now();
    return await ctx.db.insert("projects", {
      userId,
      name: args.name.trim(),
      color: args.color ?? "#a78bfa",
      sortOrder: existing.length,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("projects"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    await requireProjectAccess(ctx, userId, args.id);
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );
    await ctx.db.patch(id, { ...filtered, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    await requireProjectAccess(ctx, userId, args.id);

    const [notes, snippets, links, tasks] = await Promise.all([
      ctx.db
        .query("projectNotes")
        .withIndex("by_project", (q) => q.eq("projectId", args.id))
        .collect(),
      ctx.db
        .query("projectSnippets")
        .withIndex("by_project", (q) => q.eq("projectId", args.id))
        .collect(),
      ctx.db
        .query("projectLinks")
        .withIndex("by_project", (q) => q.eq("projectId", args.id))
        .collect(),
      ctx.db
        .query("tasks")
        .withIndex("by_user_project", (q) =>
          q.eq("userId", userId).eq("projectId", args.id)
        )
        .collect(),
    ]);

    if (tasks.length > 0) {
      throw new Error("Projekt obsahuje úkoly. Přesuňte nebo smažte je nejdřív.");
    }

    for (const n of notes) await ctx.db.delete(n._id);
    for (const s of snippets) await ctx.db.delete(s._id);
    for (const l of links) await ctx.db.delete(l._id);
    await ctx.db.delete(args.id);
  },
});

export const migrateTasksToDefaultProject = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    return await ensureDefaultProject(ctx, userId);
  },
});
