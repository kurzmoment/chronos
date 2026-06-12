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
  { id: "board", label: "Board" },
  { id: "notes", label: "Poznámky" },
  { id: "snippets", label: "Snippety" },
  { id: "links", label: "Odkazy" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ProjectWorkspace({ projectId }: { projectId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab");
  const tab = ((rawTab === "tasks" ? "board" : rawTab) as TabId) || "board";
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
    <AppShell searchPlaceholder="Filtrovat projekt…">
      <div className="mb-5 rounded-xl border border-[var(--glass-border)] bg-surface-container/40 p-5 shadow-[var(--shadow-ambient)] backdrop-blur-2xl">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
          Všechny projekty
        </Link>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-label-caps">projekt</p>
            <h1 className="mt-1 text-[clamp(2rem,4vw,3.75rem)] font-black leading-none tracking-[-0.06em] text-on-surface">
              {project?.name ?? "…"}
            </h1>
            <p className="mt-3 max-w-2xl text-body-sm text-on-surface-variant">
              Úkoly, poznámky, snippety a odkazy pohromadě. Praktický prostor
              mezi nápadem a naplánovaným blokem v kalendáři.
            </p>
          </div>
          <div
            className="h-14 w-14 rounded-lg border border-[var(--glass-border)]"
            style={{ backgroundColor: `${project?.color ?? "#22d3ee"}22` }}
            aria-hidden
          />
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2 rounded-lg border border-[var(--glass-border)] bg-surface-low/50 p-1.5 backdrop-blur-xl">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-semibold transition-all",
              tab === t.id
                ? "bg-secondary/15 text-on-surface shadow-[inset_0_1px_0_rgb(255_255_255_/_0.06)]"
                : "text-on-surface-variant hover:bg-surface-container/50 hover:text-on-surface"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "board" && (
        <ProjectTasksTab projectId={projectId as Id<"projects">} />
      )}
      {tab === "notes" && (
        <ProjectNotesTab projectId={projectId as Id<"projects">} />
      )}
      {tab === "snippets" && (
        <ProjectSnippetsTab projectId={projectId as Id<"projects">} />
      )}
      {tab === "links" && (
        <ProjectLinksTab projectId={projectId as Id<"projects">} />
      )}
    </AppShell>
  );
}
