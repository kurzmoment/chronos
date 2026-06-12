"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { Check, Copy, Plus, Trash2 } from "lucide-react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

const LANGUAGES = [
  "typescript",
  "javascript",
  "python",
  "bash",
  "sql",
  "json",
  "text",
];

export function ProjectSnippetsTab({
  projectId,
}: {
  projectId: Id<"projects">;
}) {
  const snippets = useQuery(api.projectSnippets.listByProject, { projectId });
  const create = useMutation(api.projectSnippets.create);
  const remove = useMutation(api.projectSnippets.remove);
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("typescript");
  const [code, setCode] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    await create({
      projectId,
      title: title.trim() || "Snippet",
      language,
      code,
    });
    setTitle("");
    setCode("");
  }

  async function copyCode(id: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div className="space-y-5">
      <Card className="mission-section border-0 shadow-none">
        <CardContent className="space-y-4 p-5">
          <div>
            <p className="section-kicker">snippety</p>
            <h2 className="mt-1 text-title-md text-on-surface">Nový snippet</h2>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              Malé kusy kódu a poznámky, které se hodí držet u projektu.
            </p>
          </div>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Název</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Jazyk</Label>
                <Select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Kód</Label>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={8}
                className="w-full rounded-lg border border-[var(--glass-border)] bg-[#050b18]/90 px-4 py-3 font-mono text-sm leading-relaxed text-on-surface outline-none transition-colors focus:border-secondary/60 focus:ring-2 focus:ring-secondary/25"
                required
              />
            </div>
            <Button type="submit">
              <Plus className="mr-1 h-4 w-4" />
              Uložit snippet
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-3 xl:grid-cols-2">
        {snippets?.map((s) => (
          <Card key={s._id} className="mission-section border-0 shadow-none">
            <CardContent className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <p className="font-bold tracking-[-0.02em] text-on-surface">
                    {s.title}
                  </p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-secondary">
                    {s.language}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => copyCode(s._id, s.code)}
                  >
                    {copiedId === s._id ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => remove({ id: s._id })}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-accent-critical" />
                  </Button>
                </div>
              </div>
              <pre className="max-h-56 overflow-auto rounded-lg border border-[var(--glass-border)] bg-[#050b18]/90 p-4 text-xs leading-relaxed text-on-surface">
                {s.code}
              </pre>
            </CardContent>
          </Card>
        ))}
        {snippets && snippets.length === 0 && (
          <div className="mission-section px-5 py-10 text-center text-body-sm text-on-surface-variant xl:col-span-2">
            Zatím žádné snippety.
          </div>
        )}
      </div>
    </div>
  );
}
