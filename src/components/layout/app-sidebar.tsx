"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  LayoutDashboard,
  FolderKanban,
  Repeat,
  Settings,
  Plus,
} from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Přehled dne", icon: LayoutDashboard },
  { href: "/projects", label: "Projekty", icon: FolderKanban },
  { href: "/habits", label: "Návyky", icon: Repeat },
  { href: "/analytics", label: "Statistiky", icon: BarChart3 },
] as const;

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-[220px] shrink-0 flex-col border-r border-[0.5px] border-[var(--glass-border)] bg-[#060e20]/90 backdrop-blur-xl">
      <div className="border-b border-[0.5px] border-[var(--glass-border)] px-5 py-6">
        <p className="text-[15px] font-extrabold tracking-[0.12em] text-on-surface">
          CHRONOS
        </p>
        <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wider text-secondary">
          plánovač dne
        </p>
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
                  ? "bg-[#171f33]/90 text-on-surface"
                  : "text-on-surface-variant hover:bg-surface-container/50 hover:text-on-surface"
              )}
            >
              {active && (
                <span className="absolute right-0 top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-l-full bg-secondary shadow-[var(--glow-cyan)]" />
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
          Přidat úkol
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
