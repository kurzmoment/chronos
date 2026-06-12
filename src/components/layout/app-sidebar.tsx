"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, LayoutDashboard, FolderKanban, Repeat, Settings, Plus } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Dnešek", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/habits", label: "Habits", icon: Repeat },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
] as const;

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-[236px] shrink-0 flex-col border-r border-[0.5px] border-[var(--glass-border)] bg-[#050b18]/90 backdrop-blur-2xl">
      <div className="border-b border-[0.5px] border-[var(--glass-border)] px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-secondary/20 bg-secondary/8">
            <span className="text-sm font-black tracking-[-0.08em] text-secondary">CH</span>
          </div>
          <div>
            <p className="text-[15px] font-black tracking-[0.14em] text-on-surface">
              CHRONOS
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-secondary">
              osobní plán
            </p>
          </div>
        </div>
        <div className="mt-5 rounded-lg border border-primary/10 bg-surface-container/35 px-3 py-2">
          <p className="text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">
            aktuální režim
          </p>
          <p className="mt-1 text-sm font-semibold text-on-surface">
            plánovat podle dne
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all",
                active
                  ? "bg-gradient-to-r from-secondary/12 via-surface-container/80 to-transparent text-on-surface shadow-[inset_0_1px_0_rgb(255_255_255_/_0.04)]"
                  : "text-on-surface-variant hover:bg-surface-container/50 hover:text-on-surface"
              )}
            >
              {active && (
                <span className="absolute right-0 top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-l-sm bg-secondary/85" />
              )}
              <Icon className={cn("h-4 w-4 shrink-0", active && "text-secondary")} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-[0.5px] border-[var(--glass-border)] px-3 py-4">
        <Button
          className="mb-1 w-full"
          onClick={() => useAppStore.getState().setAddTaskModalOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nový úkol
        </Button>
        <button
          type="button"
          onClick={() => useAppStore.getState().setPreferencesModalOpen(true)}
          className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-on-surface-variant transition-colors hover:bg-surface-container/50 hover:text-on-surface"
        >
          <Settings className="h-4 w-4" />
          Nastavení
        </button>
      </div>
    </aside>
  );
}
