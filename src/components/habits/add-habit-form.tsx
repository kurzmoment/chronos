"use client";

import { useMutation } from "convex/react";
import { Plus } from "lucide-react";
import { useState } from "react";
import { api } from "convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export function AddHabitForm() {
  const createHabit = useMutation(api.habits.create);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(30);
  const [timeOfDay, setTimeOfDay] = useState<
    "MORNING" | "AFTERNOON" | "EVENING" | "ANYTIME"
  >("MORNING");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await createHabit({
      title: title.trim(),
      durationMin: duration,
      frequency: "DAILY",
      preferredTimeOfDay: timeOfDay,
    });
    setTitle("");
    setOpen(false);
  }

  if (!open) {
    return (
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Přidat návyk
      </Button>
    );
  }

  return (
    <Card className="mission-section border-0 shadow-none">
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label>Název návyku</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Např. Deep Work Block"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Minuty</Label>
              <Input
                type="number"
                min={15}
                step={15}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Preferovaný čas</Label>
              <Select
                value={timeOfDay}
                onChange={(e) =>
                  setTimeOfDay(
                    e.target.value as "MORNING" | "AFTERNOON" | "EVENING" | "ANYTIME"
                  )
                }
              >
                <option value="MORNING">Ráno</option>
                <option value="AFTERNOON">Odpoledne</option>
                <option value="EVENING">Večer</option>
                <option value="ANYTIME">Kdykoli</option>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm">
              Uložit
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Zrušit
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
