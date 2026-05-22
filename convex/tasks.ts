import { v } from "convex/values";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { requireUserId } from "./lib/auth";
import { requireProjectAccess } from "./lib/projects";
import { minutesOnDayToIso } from "./lib/time";
import type { Id } from "./_generated/dataModel";

async function touchProject(
  ctx: MutationCtx,
  projectId: Id<"projects"> | undefined
) {
  if (projectId) {
    await ctx.db.patch(projectId, { updatedAt: Date.now() });
  }
}

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const statuses = ["BACKLOG", "SCHEDULED", "DONE"] as const;
    const results = await Promise.all(
      statuses.map((status) =>
        ctx.db
          .query("tasks")
          .withIndex("by_user_status", (q) =>
            q.eq("userId", userId).eq("status", status)
          )
          .collect()
      )
    );
    return results.flat().sort((a, b) => a.priority - b.priority);
  },
});

export const listByStatus = query({
  args: {
    status: v.optional(
      v.union(v.literal("BACKLOG"), v.literal("SCHEDULED"), v.literal("DONE"))
    ),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const status = args.status ?? "BACKLOG";

    return await ctx.db
      .query("tasks")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", userId).eq("status", status)
      )
      .collect();
  },
});

export const listBacklogWithProjects = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", userId).eq("status", "BACKLOG")
      )
      .collect();

    const sorted = tasks.sort((a, b) => a.priority - b.priority);
    const slice = sorted.slice(0, args.limit ?? 8);

    return await Promise.all(
      slice
        .filter((task): task is typeof task & { projectId: Id<"projects"> } =>
          Boolean(task.projectId)
        )
        .map(async (task) => {
          const project = await ctx.db.get(task.projectId);
          return {
            ...task,
            projectName: project?.name ?? "Obecné",
            projectColor: project?.color,
          };
        })
    );
  },
});

export const listByProject = query({
  args: {
    projectId: v.id("projects"),
    status: v.optional(
      v.union(v.literal("BACKLOG"), v.literal("SCHEDULED"), v.literal("DONE"))
    ),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    await requireProjectAccess(ctx, userId, args.projectId);

    if (args.status) {
      return await ctx.db
        .query("tasks")
        .withIndex("by_project_status", (q) =>
          q.eq("projectId", args.projectId).eq("status", args.status!)
        )
        .collect();
    }

    const statuses = ["BACKLOG", "SCHEDULED", "DONE"] as const;
    const results = await Promise.all(
      statuses.map((status) =>
        ctx.db
          .query("tasks")
          .withIndex("by_project_status", (q) =>
            q.eq("projectId", args.projectId).eq("status", status)
          )
          .collect()
      )
    );
    return results.flat().sort((a, b) => a.priority - b.priority);
  },
});

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    priority: v.union(v.literal(1), v.literal(2), v.literal(3)),
    estimatedDurationMin: v.number(),
    deadline: v.optional(v.string()),
    isWorkContext: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    await requireProjectAccess(ctx, userId, args.projectId);
    const { projectId, ...rest } = args;
    const id = await ctx.db.insert("tasks", {
      userId,
      projectId,
      ...rest,
      status: "BACKLOG",
    });
    await ctx.db.patch(projectId, { updatedAt: Date.now() });
    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    priority: v.optional(v.union(v.literal(1), v.literal(2), v.literal(3))),
    estimatedDurationMin: v.optional(v.number()),
    deadline: v.optional(v.string()),
    isWorkContext: v.optional(v.boolean()),
    status: v.optional(
      v.union(v.literal("BACKLOG"), v.literal("SCHEDULED"), v.literal("DONE"))
    ),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== userId) {
      throw new Error("Úkol nenalezen");
    }

    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );
    await ctx.db.patch(id, filtered);
    await touchProject(ctx, task.projectId);
  },
});

export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== userId) {
      throw new Error("Úkol nenalezen");
    }
    await ctx.db.delete(args.id);
    await touchProject(ctx, task.projectId);
  },
});

export const markDone = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== userId) {
      throw new Error("Úkol nenalezen");
    }
    await ctx.db.patch(args.id, { status: "DONE" });
    await touchProject(ctx, task.projectId);
  },
});

export const scheduleToCalendar = mutation({
  args: {
    id: v.id("tasks"),
    date: v.string(),
    startMin: v.number(),
    endMin: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== userId) {
      throw new Error("Úkol nenalezen");
    }
    if (task.status !== "BACKLOG") {
      throw new Error("Do kalendáře lze přidat jen úkoly v backlogu.");
    }
    if (args.endMin <= args.startMin) {
      throw new Error("Čas konce musí být po začátku.");
    }

    await ctx.db.insert("calendarEvents", {
      userId,
      title: task.title,
      description: task.description,
      start: minutesOnDayToIso(args.date, args.startMin),
      end: minutesOnDayToIso(args.date, args.endMin),
      isWorkContext: task.isWorkContext,
      isFixed: true,
      workCategory: task.isWorkContext ? "DEEP_WORK" : undefined,
      eventType: "TASK",
      taskId: task._id,
    });

    await ctx.db.patch(task._id, { status: "SCHEDULED" });
    await touchProject(ctx, task.projectId);
  },
});

export const unschedule = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== userId) {
      throw new Error("Úkol nenalezen");
    }

    const events = await ctx.db
      .query("calendarEvents")
      .withIndex("by_user_and_time", (q) => q.eq("userId", userId))
      .collect();

    for (const event of events) {
      if (event.taskId === task._id) {
        await ctx.db.delete(event._id);
      }
    }

    await ctx.db.patch(task._id, { status: "BACKLOG" });
    await touchProject(ctx, task.projectId);
  },
});
