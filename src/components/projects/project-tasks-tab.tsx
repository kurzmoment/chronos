"use client";

import { useMutation, useQuery } from "convex/react";
import { useMemo } from "react";
import { Calendar, Check, Plus, Trash2 } from "lucide-react";
import { api } from "convex/_generated/api";
import type { Doc, Id } from "convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";

const priorityColor = {
  1: "border-l-red-500",
  2: "border-l-secondary",
  3: "border-l-outline-variant",
};

export function ProjectTasksTab({ projectId }: { projectId: Id<"projects"> }) {
  const tasks = useQuery(api.tasks.listByProject, { projectId });
  const markDone = useMutation(api.tasks.markDone);
  const remove = useMutation(api.tasks.remove);
  const unschedule = useMutation(api.tasks.unschedule);
  const setAddTaskModalOpen = useAppStore((s) => s.setAddTaskModalOpen);
  const setActiveProjectId = useAppStore((s) => s.setActiveProjectId);
  const setScheduleTaskId = useAppStore((s) => s.setScheduleTaskId);

  const grouped = useMemo(() => {
    const list = tasks ?? [];
    return {
      backlog: list.filter((t) => t.status === "BACKLOG"),
      scheduled: list.filter((t) => t.status === "SCHEDULED"),
      done: list.filter((t) => t.status === "DONE"),
    };
  }, [tasks]);

  function openAddTask() {
    setActiveProjectId(projectId);
    setAddTaskModalOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={openAddTask}>
          <Plus className="mr-1 h-4 w-4" />
          Úkol v projektu
        </Button>
      </div>

      <TaskSection title="Backlog" tasks={grouped.backlog}>
        {(task) => (
          <>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="gap-1 text-xs"
              onClick={() => setScheduleTaskId(task._id)}
            >
              <Calendar className="h-3.5 w-3.5" />
              Do kalendáře
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => markDone({ id: task._id })}
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => remove({ id: task._id })}
            >
              <Trash2 className="h-3.5 w-3.5 text-accent-critical" />
            </Button>
          </>
        )}
      </TaskSection>

      <TaskSection title="V kalendáři" tasks={grouped.scheduled}>
        {(task) => (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-xs"
            onClick={() => unschedule({ id: task._id })}
          >
            Zrušit v kalendáři
          </Button>
        )}
      </TaskSection>

      <TaskSection title="Hotovo" tasks={grouped.done}>
        {(task) => (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => remove({ id: task._id })}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </TaskSection>
    </div>
  );
}

function TaskSection({
  title,
  tasks,
  children,
}: {
  title: string;
  tasks: Doc<"tasks">[];
  children: (task: Doc<"tasks">) => React.ReactNode;
}) {
  if (tasks.length === 0) return null;
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
        {title}
      </h3>
      <div className="space-y-2">
        {tasks.map((task) => (
          <Card key={task._id} className="glass-card border-0 shadow-none">
            <CardContent
              className={cn(
                "flex flex-wrap items-center justify-between gap-2 border-l-[3px] p-3",
                priorityColor[task.priority]
              )}
            >
              <div>
                <p className="font-medium text-on-surface">{task.title}</p>
                <p className="text-xs text-on-surface-variant">
                  {task.estimatedDurationMin} min · priorita {task.priority}
                </p>
              </div>
              <div className="flex gap-1">{children(task)}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
