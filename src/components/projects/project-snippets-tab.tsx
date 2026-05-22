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
    <div className="space-y-6">
      <Card className="glass-card border-0 shadow-none">
        <CardContent className="space-y-4 p-5">
          <h2 className="text-sm font-semibold text-on-surface">Nový snippet</h2>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Název</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Jazyk</Label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-[var(--glass-border)] bg-surface-container/40 px-3 text-sm"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Kód</Label>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={8}
                className="w-full rounded-md border border-[var(--glass-border)] bg-[#0b1326] px-3 py-2 font-mono text-sm text-on-surface"
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

      <div className="space-y-3">
        {snippets?.map((s) => (
          <Card key={s._id} className="glass-card border-0 shadow-none">
            <CardContent className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <p className="font-medium text-on-surface">{s.title}</p>
                  <p className="text-xs text-on-surface-variant">{s.language}</p>
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
              <pre className="max-h-48 overflow-auto rounded-md bg-[#0b1326] p-3 text-xs text-on-surface">
                {s.code}
              </pre>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
