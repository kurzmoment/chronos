import { Suspense } from "react";
import { ProjectWorkspace } from "@/components/projects/project-workspace";

export default async function Page({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return (
    <Suspense fallback={<p className="p-6 text-on-surface-variant">Načítám…</p>}>
      <ProjectWorkspace projectId={projectId} />
    </Suspense>
  );
}
