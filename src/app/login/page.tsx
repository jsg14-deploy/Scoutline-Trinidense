"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/app/actions/auth";
import { Logo } from "@/components/ui/Logo";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8">
        <div className="mb-8 text-center">
          <Logo variant="full" size={36} className="mx-auto" />
          <p className="mt-2 text-xs text-muted">Trinidense · Plataforma de scouting</p>
        </div>

        <form action={formAction} className="grid gap-4">
          <div className="grid gap-1.5">
            <label htmlFor="email" className="text-xs font-medium text-muted">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              autoFocus
              placeholder="scout@club.com"
              className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text outline-none focus-visible:ring-2 focus-visible:ring-accent-2 focus:border-accent-2"
            />
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="password" className="text-xs font-medium text-muted">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text outline-none focus-visible:ring-2 focus-visible:ring-accent-2 focus:border-accent-2"
            />
          </div>

          {state?.error && (
            <p role="alert" aria-live="polite" className="text-sm text-negative">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "Verificando…" : "Entrar"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-muted">
          ¿Sin cuenta?{" "}
          <Link href="/register" className="font-medium text-text hover:underline">
            Registrar organización
          </Link>
        </p>
      </div>
    </main>
  );
}
