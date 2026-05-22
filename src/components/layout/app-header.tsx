"use client";

import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/store/app-store";

export function AppHeader({
  searchPlaceholder = "system search…",
}: {
  searchPlaceholder?: string;
}) {
  const searchQuery = useAppStore((s) => s.searchQuery);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-[0.5px] border-[var(--glass-border)] bg-surface-low/60 px-6 backdrop-blur-xl">
      <div className="relative min-w-0 flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
        <Input
          className="h-9 border-surface-high/80 bg-surface-container/50 pl-10 uppercase tracking-wide"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-md text-on-surface-variant transition-colors hover:bg-surface-high/60 hover:text-on-surface"
          title="activity log"
          onClick={() => useAppStore.getState().setActivityPanelOpen(true)}
        >
          <Bell className="h-4 w-4" />
        </button>
        <div
          className="h-9 w-9 overflow-hidden rounded-full border-[0.5px] border-[var(--glass-border)] bg-gradient-to-br from-primary-dim via-tertiary-dim to-secondary"
          aria-hidden
        />
      </div>
    </header>
  );
}
