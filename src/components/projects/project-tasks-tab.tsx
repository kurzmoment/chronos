"use client";

import { useMutation, useQuery } from "convex/react";
import { useMemo } from "react";
import {
  Calendar,
  Check,
  ChevronLeft,
  Clock3,
  Flame,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { api } from "convex/_generated/api";
import type { Doc, Id } from "convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/store/app-store";
export function ProjectTasksTab({ projectId }: { projectId: Id<"projects"> }) {
  const tasks = useQuery(api.tasks.listByProject, { projectId });
  const markDone = useMutation(api.tasks.markDone);
  const remove = useMutation(api.tasks.remove);
  const unschedule = useMutation(api.tasks.unschedule);
  const update = useMutation(api.tasks.update);
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
    <div className="space-y-4">
      <div className="mission-card px-4 py-3">
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-label-caps">úkoly</p>
            <h2 className="mt-1 text-title-md text-on-surface">Board</h2>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              Jednoduché sloupce nad existujícími stavy úkolů.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-secondary/15 bg-secondary/8 px-3 py-1.5 text-xs font-semibold text-secondary">
            {tasks?.length ?? 0} úkolů
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={openAddTask}>
          <Plus className="mr-1 h-4 w-4" />
          Nový úkol
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <TaskColumn
          title="Backlog"
          eyebrow="nezařazeno"
          description="Úkoly, které ještě nejsou v kalendáři."
          tone="cyan"
          tasks={grouped.backlog}
          empty="Backlog je prázdný."
        >
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
                Timeline
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => markDone({ id: task._id })}
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
              <DeleteButton onClick={() => remove({ id: task._id })} />
            </>
          )}
        </TaskColumn>

        <TaskColumn
          title="Scheduled"
          eyebrow="v plánu"
          description="Úkoly už mají časový blok v kalendáři."
          tone="violet"
          tasks={grouped.scheduled}
          empty="Zatím nic naplánovaného."
        >
          {(task) => (
            <>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-xs"
                onClick={() => unschedule({ id: task._id })}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Backlog
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => markDone({ id: task._id })}
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </TaskColumn>

        <TaskColumn
          title="Done"
          eyebrow="hotovo"
          description="Dokončené úkoly připravené na případné uklizení."
          tone="green"
          tasks={grouped.done}
          empty="Ještě nic dokončeno."
        >
          {(task) => (
            <>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-xs"
                onClick={() => update({ id: task._id, status: "BACKLOG" })}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reopen
              </Button>
              <DeleteButton onClick={() => remove({ id: task._id })} />
            </>
          )}
        </TaskColumn>
      </div>
    </div>
  );
}

function TaskColumn({
  title,
  eyebrow,
  description,
  tone,
  tasks,
  empty,
  children,
}: {
  title: string;
  eyebrow: string;
  description: string;
  tone: "cyan" | "violet" | "green";
  tasks: Doc<"tasks">[];
  empty: string;
  children: (task: Doc<"tasks">) => React.ReactNode;
}) {
  const toneClass = {
    cyan: "from-secondary/20 text-secondary",
    violet: "from-tertiary/20 text-tertiary",
    green: "from-emerald-400/20 text-emerald-300",
  }[tone];

  return (
    <section className="min-h-[420px] rounded-xl border border-[var(--glass-border)] bg-surface-low/55 p-3 backdrop-blur-xl">
      <div className={`mb-3 rounded-lg bg-gradient-to-r ${toneClass} to-transparent p-3`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-80">
              {eyebrow}
            </p>
            <h3 className="mt-1 text-lg font-black tracking-[-0.03em] text-on-surface">
              {title}
            </h3>
          </div>
          <span className="rounded-md border border-current/25 bg-background/30 px-2 py-1 text-mono-data text-[11px]">
            {tasks.length}
          </span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">
          {description}
        </p>
      </div>

      <div className="space-y-2">
        {tasks.map((task) => (
          <Card
            key={task._id}
            className="group border-0 bg-surface-container/55 shadow-none transition-all hover:-translate-y-0.5 hover:bg-surface-container/80"
          >
            <CardContent className="space-y-3 p-3">
              <div className="space-y-2">
                <p className="font-semibold leading-snug text-on-surface">
                  {task.title}
                </p>
                {task.description && (
                  <p className="line-clamp-2 text-xs leading-relaxed text-on-surface-variant">
                    {task.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
                  <span className="inline-flex items-center gap-1 rounded-md bg-surface-low px-2 py-1">
                    <Clock3 className="h-3 w-3" />
                    {task.estimatedDurationMin}m
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-surface-low px-2 py-1">
                    <Flame className="h-3 w-3" />
                    P{task.priority}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 opacity-90 transition-opacity group-hover:opacity-100">
                {children(task)}
              </div>
            </CardContent>
          </Card>
        ))}
        {tasks.length === 0 && (
          <div className="rounded-lg border border-dashed border-[var(--glass-border)] bg-surface-container/25 px-4 py-8 text-center text-body-sm text-on-surface-variant">
            {empty}
          </div>
        )}
      </div>
    </section>
  );
}

function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <Button type="button" size="sm" variant="ghost" onClick={onClick}>
      <Trash2 className="h-3.5 w-3.5 text-accent-critical" />
    </Button>
  );
}
