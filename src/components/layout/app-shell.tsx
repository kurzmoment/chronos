"use client";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";

export function AppShell({
  children,
  searchPlaceholder,
}: {
  children: React.ReactNode;
  searchPlaceholder?: string;
}) {
  return (
    <div className="grain-overlay flex h-screen flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader searchPlaceholder={searchPlaceholder} />
          <main className="min-h-0 flex-1 overflow-y-auto px-6 py-6 md:px-12">
            <div className="mx-auto max-w-[1440px]">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
