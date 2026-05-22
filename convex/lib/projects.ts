import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

const DEFAULT_PROJECT_NAME = "Obecné";

export async function requireProjectAccess(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  projectId: Id<"projects">
) {
  const project = await ctx.db.get(projectId);
  if (!project || project.userId !== userId) {
    throw new Error("Projekt nenalezen");
  }
  return project;
}

export async function ensureDefaultProject(
  ctx: MutationCtx,
  userId: Id<"users">
): Promise<Id<"projects">> {
  const existing = await ctx.db
    .query("projects")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();

  let defaultProject = existing.find((p) => p.name === DEFAULT_PROJECT_NAME);
  if (!defaultProject) {
    const now = Date.now();
    const id = await ctx.db.insert("projects", {
      userId,
      name: DEFAULT_PROJECT_NAME,
      color: "#22d3ee",
      sortOrder: 0,
      updatedAt: now,
    });
    defaultProject = (await ctx.db.get(id))!;
  }

  const statuses = ["BACKLOG", "SCHEDULED", "DONE"] as const;
  for (const status of statuses) {
    const batch = await ctx.db
      .query("tasks")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", userId).eq("status", status)
      )
      .collect();
    for (const task of batch) {
      const doc = task as { projectId?: Id<"projects"> };
      if (!doc.projectId) {
        await ctx.db.patch(task._id, { projectId: defaultProject._id });
      }
    }
  }

  return defaultProject._id;
}
