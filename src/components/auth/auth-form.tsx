"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionLabel } from "@/components/ui/section-label";

export function AuthForm() {
  const { signIn } = useAuthActions();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) {
    return (
      <div className="grain-overlay flex min-h-screen items-center justify-center bg-background">
        <p className="text-mono-data text-on-surface-variant">Načítání…</p>
      </div>
    );
  }

  if (isAuthenticated) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("email", email);
      formData.set("password", password);
      formData.set("flow", mode);
      if (mode === "signUp" && name) {
        formData.set("name", name);
      }
      await signIn("password", formData);
    } catch {
      setError("Přihlášení se nezdařilo. Zkontrolujte údaje.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grain-overlay relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgb(99 102 241 / 0.15), transparent), radial-gradient(ellipse 40% 30% at 80% 80%, rgb(34 211 238 / 0.08), transparent)",
        }}
      />
      <Card className="surface-elevated relative w-full max-w-md border-surface-highest">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-solid text-xl font-bold text-white shadow-[var(--glow-primary)]">
            C
          </div>
          <CardTitle className="text-2xl">Chronos</CardTitle>
          <SectionLabel className="mt-1 block">Precision System</SectionLabel>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signUp" && (
              <div className="space-y-2">
                <Label htmlFor="name">Jméno</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Vaše jméno"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Heslo</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
              />
            </div>
            {error && <p className="text-body-sm text-error">{error}</p>}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting
                ? "Probíhá…"
                : mode === "signIn"
                  ? "Přihlásit se"
                  : "Registrovat se"}
            </Button>
          </form>
          <button
            type="button"
            className="mt-4 w-full text-center text-body-sm text-primary hover:underline"
            onClick={() => setMode(mode === "signIn" ? "signUp" : "signIn")}
          >
            {mode === "signIn"
              ? "Nemáte účet? Registrujte se"
              : "Máte účet? Přihlaste se"}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
