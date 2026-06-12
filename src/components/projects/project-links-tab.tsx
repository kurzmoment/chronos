"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProjectLinksTab({ projectId }: { projectId: Id<"projects"> }) {
  const links = useQuery(api.projectLinks.listByProject, { projectId });
  const create = useMutation(api.projectLinks.create);
  const remove = useMutation(api.projectLinks.remove);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    await create({
      projectId,
      title: title.trim() || url.trim(),
      url: url.trim(),
      note: note.trim() || undefined,
    });
    setTitle("");
    setUrl("");
    setNote("");
  }

  return (
    <div className="space-y-5">
      <Card className="mission-section border-0 shadow-none">
        <CardContent className="space-y-4 p-5">
          <div>
            <p className="section-kicker">odkazy</p>
            <h2 className="mt-1 text-title-md text-on-surface">Nový odkaz</h2>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              Dokumentace, zdroje a další kontext k projektu.
            </p>
          </div>
          <form onSubmit={handleAdd} className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Název</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>URL</Label>
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://…"
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Poznámka</Label>
              <Input value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            <Button type="submit" className="sm:col-span-2 w-fit">
              <Plus className="mr-1 h-4 w-4" />
              Přidat odkaz
            </Button>
          </form>
        </CardContent>
      </Card>

      <ul className="grid gap-3 lg:grid-cols-2">
        {links?.map((link) => (
          <li key={link._id}>
            <Card className="mission-section border-0 shadow-none transition-all hover:bg-surface-container/30">
              <CardContent className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold tracking-[-0.02em] text-on-surface hover:text-secondary"
                  >
                    {link.title}
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  </a>
                  <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-[0.12em] text-secondary/85">
                    {link.url}
                  </p>
                  {link.note && (
                    <p className="mt-1 text-sm text-on-surface-variant">
                      {link.note}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => remove({ id: link._id })}
                >
                  <Trash2 className="h-4 w-4 text-accent-critical" />
                </Button>
              </CardContent>
            </Card>
          </li>
        ))}
        {links && links.length === 0 && (
          <li className="mission-section px-5 py-10 text-center text-body-sm text-on-surface-variant lg:col-span-2">
            Zatím žádné odkazy.
          </li>
        )}
      </ul>
    </div>
  );
}
