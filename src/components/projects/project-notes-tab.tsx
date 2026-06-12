"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { api } from "convex/_generated/api";
import type { Doc, Id } from "convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProjectNotesTab({ projectId }: { projectId: Id<"projects"> }) {
  const notes = useQuery(api.projectNotes.listByProject, { projectId });
  const create = useMutation(api.projectNotes.create);
  const update = useMutation(api.projectNotes.update);
  const remove = useMutation(api.projectNotes.remove);
  const [selectedId, setSelectedId] = useState<Id<"projectNotes"> | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const selected = notes?.find((n) => n._id === selectedId) ?? notes?.[0];

  async function handleAdd() {
    const id = await create({
      projectId,
      title: newTitle.trim() || "Nová poznámka",
      body: "",
    });
    setNewTitle("");
    setSelectedId(id);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <Card className="mission-section border-0 shadow-none">
        <CardContent className="space-y-2 p-4">
          <div>
            <p className="section-kicker">poznámky</p>
            <h2 className="mt-1 text-base font-bold text-on-surface">
              Projektové poznámky
            </h2>
          </div>
          <div className="flex gap-2">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Název poznámky"
              className="text-sm"
            />
            <Button type="button" size="sm" onClick={handleAdd}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <ul className="max-h-[60vh] space-y-1 overflow-y-auto">
            {notes?.map((note) => (
              <li key={note._id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(note._id)}
                  className={`w-full rounded-md px-3 py-2 text-left text-sm ${
                    selected?._id === note._id
                      ? "bg-secondary/15 text-on-surface"
                      : "text-on-surface-variant hover:bg-surface-container/50"
                  }`}
                >
                  {note.title}
                </button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {selected ? (
        <NoteEditor
          key={selected._id}
          note={selected}
          onUpdate={(patch) => update({ id: selected._id, ...patch })}
          onRemove={() => {
            remove({ id: selected._id });
            setSelectedId(null);
          }}
        />
      ) : (
        <p className="text-on-surface-variant">Přidejte první poznámku.</p>
      )}
    </div>
  );
}

function NoteEditor({
  note,
  onUpdate,
  onRemove,
}: {
  note: Doc<"projectNotes">;
  onUpdate: (patch: { title?: string; body?: string }) => void;
  onRemove: () => void;
}) {
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);

  function save() {
    onUpdate({ title, body });
  }

  return (
      <Card className="mission-section border-0 shadow-none">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 space-y-2">
            <Label>Název</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-accent-critical"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2">
          <Label>Obsah (Markdown)</Label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={16}
            className="w-full resize-y rounded-lg border border-[var(--glass-border)] bg-surface-container/40 px-4 py-3 font-mono text-sm leading-relaxed text-on-surface outline-none transition-colors focus:border-secondary/60"
            placeholder="# Nadpis&#10;- myšlenka&#10;- odkaz na koncept"
          />
        </div>
        <Button type="button" onClick={save}>
          Uložit
        </Button>
      </CardContent>
    </Card>
  );
}
