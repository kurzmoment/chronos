"use client";

import { Bell, Command, Search } from "lucide-react";
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
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-[0.5px] border-[var(--glass-border)] bg-[#071022]/72 px-5 backdrop-blur-2xl sm:px-6">
      <div className="relative min-w-0 flex-1 max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
        <Input
          className="h-10 rounded-lg border-surface-high/80 bg-surface-container/45 pl-10 pr-20 text-sm uppercase tracking-[0.12em]"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-lg border border-[var(--glass-border)] bg-surface-low/70 px-2 py-1 text-[10px] text-on-surface-variant sm:flex">
          <Command className="h-3 w-3" /> K
        </div>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <div className="hidden items-center gap-2 rounded-md border border-secondary/15 bg-secondary/8 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary md:flex">
          <span className="h-1.5 w-1.5 rounded-sm bg-secondary/80" />
          online
        </div>
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
