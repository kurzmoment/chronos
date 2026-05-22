import { create } from "zustand";
import { formatDateKey } from "@/lib/utils";

export type BacklogSort = "priority" | "duration" | "title";
export type BacklogStatusFilter = "ALL" | "BACKLOG" | "SCHEDULED" | "DONE";
interface AppState {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  showRescheduleBanner: boolean;
  setShowRescheduleBanner: (show: boolean) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  addTaskModalOpen: boolean;
  setAddTaskModalOpen: (open: boolean) => void;
  addCalendarEventModalOpen: boolean;
  setAddCalendarEventModalOpen: (open: boolean) => void;
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
  scheduleTaskId: string | null;
  setScheduleTaskId: (id: string | null) => void;
  preferencesModalOpen: boolean;
  setPreferencesModalOpen: (open: boolean) => void;
  backlogSort: BacklogSort;
  setBacklogSort: (sort: BacklogSort) => void;
  backlogStatusFilter: BacklogStatusFilter;
  setBacklogStatusFilter: (f: BacklogStatusFilter) => void;
  showBacklogFilters: boolean;
  setShowBacklogFilters: (show: boolean) => void;
  activityPanelOpen: boolean;
  setActivityPanelOpen: (open: boolean) => void;
  supportModalOpen: boolean;
  setSupportModalOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedDate: formatDateKey(new Date()),
  setSelectedDate: (date) => set({ selectedDate: date }),
  showRescheduleBanner: false,
  setShowRescheduleBanner: (show) => set({ showRescheduleBanner: show }),
  searchQuery: "",
  setSearchQuery: (q) => set({ searchQuery: q }),
  addTaskModalOpen: false,
  setAddTaskModalOpen: (open) => set({ addTaskModalOpen: open }),
  addCalendarEventModalOpen: false,
  setAddCalendarEventModalOpen: (open) => set({ addCalendarEventModalOpen: open }),
  activeProjectId: null,
  setActiveProjectId: (id) => set({ activeProjectId: id }),
  scheduleTaskId: null,
  setScheduleTaskId: (id) => set({ scheduleTaskId: id }),
  preferencesModalOpen: false,
  setPreferencesModalOpen: (open) => set({ preferencesModalOpen: open }),
  backlogSort: "priority",
  setBacklogSort: (sort) => set({ backlogSort: sort }),
  backlogStatusFilter: "ALL",
  setBacklogStatusFilter: (f) => set({ backlogStatusFilter: f }),
  showBacklogFilters: false,
  setShowBacklogFilters: (show) => set({ showBacklogFilters: show }),
  activityPanelOpen: false,
  setActivityPanelOpen: (open) => set({ activityPanelOpen: open }),
  supportModalOpen: false,
  setSupportModalOpen: (open) => set({ supportModalOpen: open }),
}));
