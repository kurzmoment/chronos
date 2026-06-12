"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { api } from "convex/_generated/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAppStore } from "@/store/app-store";
export function ProjectTasksPanel() {
  const tasks = useQuery(api.tasks.listBacklogWithProjects, { limit: 8 });
  const setAddTaskModalOpen = useAppStore((s) => s.setAddTaskModalOpen);

  return (
    <Card className="glass-card flex flex-col border-0 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between py-3">
        <div>
          <p className="text-label-caps">backlog</p>
          <Link
            href="/projects"
            className="mt-1 block text-sm font-semibold text-on-surface hover:text-secondary"
          >
            Úkoly z projektů
          </Link>
        </div>
        <button
          type="button"
          className="cursor-pointer text-on-surface-variant hover:text-on-surface"
          aria-label="Přidat úkol"
          onClick={() => setAddTaskModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
        </button>
      </CardHeader>
      <CardContent className="max-h-[280px] space-y-2 overflow-y-auto pb-4">
        {tasks?.map((task) => (
          <Link
            key={task._id}
            href={`/projects/${task.projectId}?tab=board`}
            className="block rounded-lg border border-surface-high bg-surface-low/75 px-3 py-2.5 transition-all hover:bg-surface-container/70"
          >
            <p className="truncate text-sm font-medium text-on-surface">
              {task.title}
            </p>
            <p className="mt-0.5 flex items-center gap-2 text-[10px] text-on-surface-variant">
              <span
                className="rounded px-1.5 py-0.5 font-medium"
                style={{
                  backgroundColor: `${task.projectColor ?? "#22d3ee"}22`,
                  color: task.projectColor ?? "#22d3ee",
                }}
              >
                {task.projectName}
              </span>
              <span>{task.estimatedDurationMin} min</span>
            </p>
          </Link>
        ))}
        {tasks && tasks.length === 0 && (
          <p className="text-body-sm text-on-surface-variant">
            Backlog je prázdný.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
