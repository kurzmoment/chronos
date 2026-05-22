"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";

export function SupportModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <p className="text-label-sm text-secondary">nápověda</p>
          <DialogTitle className="text-headline uppercase tracking-tight">
            Jak Chronos funguje
          </DialogTitle>
          <DialogDescription className="sr-only">
            Přehled hlavních akcí v aplikaci
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 px-6 pb-4 text-body-sm text-on-surface-variant">
          <p>
            <strong className="text-on-surface">Přidat aktivitu</strong> (u kalendáře)
            — schůzka, oběd, sport; jde rovnou do timeline.
          </p>
          <p>
            <strong className="text-on-surface">Projekty</strong> — poznámky,
            snippety, odkazy a úkoly podle projektu.
          </p>
          <p>
            <strong className="text-on-surface">Návyky</strong> — sekce Návyky;
            engine je rozvrhne při optimalizaci.
          </p>
          <p>
            <strong className="text-on-surface">Preference</strong> — cílové hodiny,
            velikost bloků a kontexty.
          </p>
        </div>
        <Button
          className="mx-6 mb-6 w-[calc(100%-3rem)]"
          onClick={() => {
            onOpenChange(false);
            useAppStore.getState().setPreferencesModalOpen(true);
          }}
        >
          Otevřít preference
        </Button>
      </DialogContent>
    </Dialog>
  );
}
