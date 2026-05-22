import { Doc } from "convex/_generated/dataModel";
import type { BacklogSort, BacklogStatusFilter } from "@/store/app-store";

export function filterAndSortTasks(
  tasks: Doc<"tasks">[],
  searchQuery: string,
  statusFilter: BacklogStatusFilter,
  sort: BacklogSort
): Doc<"tasks">[] {
  let result = [...tasks];

  if (statusFilter !== "ALL") {
    result = result.filter((t) => t.status === statusFilter);
  }

  const q = searchQuery.trim().toLowerCase();
  if (q) {
    result = result.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.tags?.some((tag) => tag.toLowerCase().includes(q))
    );
  }

  result.sort((a, b) => {
    switch (sort) {
      case "duration":
        return b.estimatedDurationMin - a.estimatedDurationMin;
      case "title":
        return a.title.localeCompare(b.title, "cs");
      case "priority":
      default:
        return a.priority - b.priority;
    }
  });

  return result;
}

export function taskTags(task: Doc<"tasks">): string[] {
  if (task.tags?.length) return task.tags;
  return [task.isWorkContext ? "@WORK" : "@PERSONAL"];
}
