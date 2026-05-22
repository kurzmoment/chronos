"use client";

import { useConvexAuth, useMutation } from "convex/react";
import { useEffect } from "react";
import { api } from "convex/_generated/api";
import { AuthForm } from "@/components/auth/auth-form";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const ensureDefaults = useMutation(api.userPreferences.ensureDefaults);
  const migrateTasks = useMutation(api.projects.migrateTasksToDefaultProject);

  useEffect(() => {
    if (isAuthenticated) {
      void ensureDefaults();
      void migrateTasks({});
    }
  }, [isAuthenticated, ensureDefaults, migrateTasks]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-mono-data text-on-surface-variant">Načítání…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthForm />;
  }

  return <>{children}</>;
}
