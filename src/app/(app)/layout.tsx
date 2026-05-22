"use client";

import { AuthGate } from "@/components/auth/auth-gate";
import { AddTaskModal } from "@/components/tasks/add-task-modal";
import { AddCalendarEventModal } from "@/components/calendar/add-calendar-event-modal";
import { ScheduleTaskModal } from "@/components/tasks/schedule-task-modal";
import { PreferencesModal } from "@/components/settings/preferences-modal";
import { ActivityPanel } from "@/components/layout/activity-panel";
import { SupportModal } from "@/components/layout/support-modal";
import { useAppStore } from "@/store/app-store";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const addTaskModalOpen = useAppStore((s) => s.addTaskModalOpen);
  const setAddTaskModalOpen = useAppStore((s) => s.setAddTaskModalOpen);
  const addCalendarEventModalOpen = useAppStore((s) => s.addCalendarEventModalOpen);
  const setAddCalendarEventModalOpen = useAppStore(
    (s) => s.setAddCalendarEventModalOpen
  );
  const activityPanelOpen = useAppStore((s) => s.activityPanelOpen);
  const setActivityPanelOpen = useAppStore((s) => s.setActivityPanelOpen);
  const supportModalOpen = useAppStore((s) => s.supportModalOpen);
  const setSupportModalOpen = useAppStore((s) => s.setSupportModalOpen);

  return (
    <AuthGate>
      {children}
      <AddTaskModal open={addTaskModalOpen} onOpenChange={setAddTaskModalOpen} />
      <AddCalendarEventModal
        open={addCalendarEventModalOpen}
        onOpenChange={setAddCalendarEventModalOpen}
      />
      <ScheduleTaskModal />
      <PreferencesModal />
      <ActivityPanel open={activityPanelOpen} onOpenChange={setActivityPanelOpen} />
      <SupportModal open={supportModalOpen} onOpenChange={setSupportModalOpen} />
    </AuthGate>
  );
}
