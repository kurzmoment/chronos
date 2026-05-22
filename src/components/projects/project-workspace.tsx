"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { AppShell } from "@/components/layout/app-shell";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";
import { ProjectNotesTab } from "@/components/projects/project-notes-tab";
import { ProjectSnippetsTab } from "@/components/projects/project-snippets-tab";
import { ProjectLinksTab } from "@/components/projects/project-links-tab";
import { ProjectTasksTab } from "@/components/projects/project-tasks-tab";

const TABS = [
  { id: "notes", label: "Poznámky" },
  { id: "snippets", label: "Snippety" },
  { id: "links", label: "Odkazy" },
  { id: "tasks", label: "Úkoly" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ProjectWorkspace({ projectId }: { projectId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = (searchParams.get("tab") as TabId) || "notes";
  const project = useQuery(api.projects.get, {
    id: projectId as Id<"projects">,
  });

  const setActiveProjectId = useAppStore((s) => s.setActiveProjectId);

  useEffect(() => {
    if (project) setActiveProjectId(project._id);
  }, [project, setActiveProjectId]);

  function setTab(next: TabId) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", next);
    router.replace(`/projects/${projectId}?${params.toString()}`);
  }

  return (
    <AppShell searchPlaceholder="Hledat v projektu…">
      <div className="mb-4">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
          Všechny projekty
        </Link>
        <h1 className="mt-2 text-xl font-bold text-on-surface">
          {project?.name ?? "…"}
        </h1>
      </div>

      <div className="mb-4 flex flex-wrap gap-1 border-b border-[var(--glass-border)]">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-t-lg px-4 py-2 text-sm font-medium transition-colors",
              tab === t.id
                ? "border-b-2 border-secondary bg-surface-container/50 text-on-surface"
                : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "notes" && (
        <ProjectNotesTab projectId={projectId as Id<"projects">} />
      )}
      {tab === "snippets" && (
        <ProjectSnippetsTab projectId={projectId as Id<"projects">} />
      )}
      {tab === "links" && (
        <ProjectLinksTab projectId={projectId as Id<"projects">} />
      )}
      {tab === "tasks" && (
        <ProjectTasksTab projectId={projectId as Id<"projects">} />
      )}
    </AppShell>
  );
}
