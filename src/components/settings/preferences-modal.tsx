"use client";

import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/store/app-store";

export function PreferencesModal() {
  const open = useAppStore((s) => s.preferencesModalOpen);
  const setOpen = useAppStore((s) => s.setPreferencesModalOpen);
  const prefs = useQuery(api.userPreferences.get);
  const upsert = useMutation(api.userPreferences.upsert);

  const [form, setForm] = useState({
    dailyTargetWorkHours: 8,
    minWorkBlockMin: 90,
    maxWorkBlockMin: 180,
    breakDurationMin: 15,
    activeContextTags: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (prefs && "dailyTargetWorkHours" in prefs) {
      setForm({
        dailyTargetWorkHours: prefs.dailyTargetWorkHours,
        minWorkBlockMin: prefs.minWorkBlockMin,
        maxWorkBlockMin: prefs.maxWorkBlockMin,
        breakDurationMin: prefs.breakDurationMin,
        activeContextTags: (prefs.activeContextTags ?? []).join(", "),
      });
    }
  }, [prefs, open]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!prefs || !("preferredFocusWindows" in prefs)) return;
    setSaving(true);
    try {
      const tags = form.activeContextTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      await upsert({
        dailyTargetWorkHours: form.dailyTargetWorkHours,
        minWorkBlockMin: form.minWorkBlockMin,
        maxWorkBlockMin: form.maxWorkBlockMin,
        breakDurationMin: form.breakDurationMin,
        preferredFocusWindows: prefs.preferredFocusWindows,
        activeContextTags: tags,
      });
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pracovní preference</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4 px-6 pb-6">
          <div className="space-y-2">
            <Label>Cílové hodiny / den</Label>
            <Input
              type="number"
              step={0.5}
              value={form.dailyTargetWorkHours}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  dailyTargetWorkHours: Number(e.target.value),
                }))
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Min. blok (min)</Label>
              <Input
                type="number"
                value={form.minWorkBlockMin}
                onChange={(e) =>
                  setForm((f) => ({ ...f, minWorkBlockMin: Number(e.target.value) }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Max. blok (min)</Label>
              <Input
                type="number"
                value={form.maxWorkBlockMin}
                onChange={(e) =>
                  setForm((f) => ({ ...f, maxWorkBlockMin: Number(e.target.value) }))
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Pauza mezi bloky (min)</Label>
            <Input
              type="number"
              value={form.breakDurationMin}
              onChange={(e) =>
                setForm((f) => ({ ...f, breakDurationMin: Number(e.target.value) }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Active Context (čárkou oddělené)</Label>
            <Input
              value={form.activeContextTags}
              onChange={(e) =>
                setForm((f) => ({ ...f, activeContextTags: e.target.value }))
              }
              placeholder="@OFFICE, #FOCUS, #HEALTH"
            />
          </div>
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Ukládám…" : "Uložit"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
