import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { workCategoryValidator } from "./lib/workCategory";

export default defineSchema({
  ...authTables,

  userPreferences: defineTable({
    userId: v.id("users"),
    dailyTargetWorkHours: v.number(),
    minWorkBlockMin: v.number(),
    maxWorkBlockMin: v.number(),
    breakDurationMin: v.number(),
    activeContextTags: v.optional(v.array(v.string())),
    preferredFocusWindows: v.array(
      v.object({
        start: v.string(),
        end: v.string(),
        weight: v.number(),
      })
    ),
  }).index("by_user", ["userId"]),

  calendarEvents: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    start: v.string(),
    end: v.string(),
    isWorkContext: v.boolean(),
    isFixed: v.boolean(),
    workCategory: v.optional(workCategoryValidator),
    eventType: v.union(
      v.literal("EVENT"),
      v.literal("TASK"),
      v.literal("HABIT"),
      v.literal("BREAK")
    ),
    taskId: v.optional(v.id("tasks")),
    habitId: v.optional(v.id("habits")),
  }).index("by_user_and_time", ["userId", "start"]),

  projects: defineTable({
    userId: v.id("users"),
    name: v.string(),
    color: v.optional(v.string()),
    sortOrder: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  projectNotes: defineTable({
    userId: v.id("users"),
    projectId: v.id("projects"),
    title: v.string(),
    body: v.string(),
    parentId: v.optional(v.id("projectNotes")),
    sortOrder: v.number(),
    updatedAt: v.number(),
  }).index("by_project", ["projectId"]),

  projectSnippets: defineTable({
    userId: v.id("users"),
    projectId: v.id("projects"),
    title: v.string(),
    language: v.string(),
    code: v.string(),
    sortOrder: v.number(),
    updatedAt: v.number(),
  }).index("by_project", ["projectId"]),

  projectLinks: defineTable({
    userId: v.id("users"),
    projectId: v.id("projects"),
    title: v.string(),
    url: v.string(),
    note: v.optional(v.string()),
    sortOrder: v.number(),
    updatedAt: v.number(),
  }).index("by_project", ["projectId"]),

  tasks: defineTable({
    userId: v.id("users"),
    /** Optional until migrateTasksToDefaultProject runs for legacy rows. */
    projectId: v.optional(v.id("projects")),
    title: v.string(),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    priority: v.union(v.literal(1), v.literal(2), v.literal(3)),
    estimatedDurationMin: v.number(),
    deadline: v.optional(v.string()),
    isWorkContext: v.boolean(),
    status: v.union(
      v.literal("BACKLOG"),
      v.literal("SCHEDULED"),
      v.literal("DONE")
    ),
  })
    .index("by_user_status", ["userId", "status"])
    .index("by_project_status", ["projectId", "status"])
    .index("by_user_project", ["userId", "projectId"]),

  habits: defineTable({
    userId: v.id("users"),
    title: v.string(),
    durationMin: v.number(),
    frequency: v.union(v.literal("DAILY"), v.literal("WEEKLY")),
    preferredTimeOfDay: v.union(
      v.literal("MORNING"),
      v.literal("AFTERNOON"),
      v.literal("EVENING"),
      v.literal("ANYTIME")
    ),
    currentStreak: v.number(),
  }).index("by_user", ["userId"]),

  habitCompletions: defineTable({
    userId: v.id("users"),
    habitId: v.id("habits"),
    date: v.string(),
  })
    .index("by_habit_date", ["habitId", "date"])
    .index("by_user_date", ["userId", "date"]),
});
