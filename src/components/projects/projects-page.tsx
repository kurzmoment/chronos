"use client";

import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, RadioTower, Trash2 } from "lucide-react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";

const COLORS = ["#22d3ee", "#a78bfa", "#fbbf24", "#34d399", "#f472b6"];

export function ProjectsPage() {
  const projects = useQuery(api.projects.list);
  const migrate = useMutation(api.projects.migrateTasksToDefaultProject);
  const createProject = useMutation(api.projects.create);
  const removeProject = useMutation(api.projects.remove);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    void migrate({});
  }, [migrate]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await createProject({
        name: newName.trim(),
        color: COLORS[(projects?.length ?? 0) % COLORS.length],
      });
      setNewName("");
    } finally {
      setCreating(false);
    }
  }

  return (
    <AppShell searchPlaceholder="Filtrovat projekty a úkoly…">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 rounded-xl border border-[var(--glass-border)] bg-surface-container/40 p-5 shadow-[var(--shadow-ambient)] backdrop-blur-2xl">
        <div>
          <p className="text-label-caps">projekty</p>
          <h1 className="mt-1 text-[clamp(2rem,4vw,3.75rem)] font-black leading-none tracking-[-0.06em] text-on-surface">
            Projects
          </h1>
          <p className="mt-3 max-w-2xl text-body-sm text-on-surface-variant">
            Prostor pro úkoly, poznámky, snippety a odkazy. Věci tu vznikají,
            dnešek je pak vytáhne do plánu.
          </p>
        </div>
        <form onSubmit={handleCreate} className="flex gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Název nového projektu"
            className="w-56"
          />
          <Button type="submit" disabled={creating || !newName.trim()}>
            <Plus className="mr-1 h-4 w-4" />
            Nový projekt
          </Button>
        </form>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects?.map((project) => (
          <Card
            key={project._id}
            className="mission-card group border-0 shadow-none transition-colors hover:bg-surface-container/30"
          >
            <CardContent className="relative p-5">
              <Link
                href={`/projects/${project._id}`}
                onClick={() =>
                  useAppStore.getState().setActiveProjectId(project._id)
                }
                className="block"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-[var(--glass-border)]"
                    style={{ backgroundColor: `${project.color ?? "#22d3ee"}22` }}
                  >
                    <RadioTower
                      className="h-5 w-5"
                      style={{ color: project.color ?? "#22d3ee" }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-black tracking-[-0.03em] text-on-surface">
                      {project.name}
                    </p>
                    <p className="mt-1 text-xs text-on-surface-variant">
                      {project.counts.notes} pozn. · {project.counts.snippets}{" "}
                      snip. · {project.counts.links} odk. ·{" "}
                      {project.counts.backlogTasks} úkolů
                    </p>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-4 gap-2">
                  <ProjectMetric label="notes" value={project.counts.notes} />
                  <ProjectMetric label="code" value={project.counts.snippets} />
                  <ProjectMetric label="links" value={project.counts.links} />
                  <ProjectMetric label="úkoly" value={project.counts.backlogTasks} />
                </div>
              </Link>
              {project.name !== "Obecné" && (
                <button
                  type="button"
                  className={cn(
                    "mt-3 flex items-center gap-1 text-xs text-on-surface-variant opacity-0 transition-opacity hover:text-accent-critical group-hover:opacity-100"
                  )}
                  onClick={() =>
                    removeProject({ id: project._id as Id<"projects"> })
                  }
                >
                  <Trash2 className="h-3 w-3" />
                  Smazat projekt
                </button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {projects && projects.length === 0 && (
        <p className="text-center text-on-surface-variant">
          Zatím žádný projekt. Vytvořte první výše.
        </p>
      )}
    </AppShell>
  );
}

function ProjectMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[var(--glass-border)] bg-surface-low/55 px-2 py-2 text-center">
      <p className="text-mono-data text-sm font-bold text-on-surface">{value}</p>
      <p className="mt-0.5 text-[9px] uppercase tracking-[0.14em] text-on-surface-variant">
        {label}
      </p>
    </div>
  );
}
