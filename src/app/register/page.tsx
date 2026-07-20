"use client";

import { useActionState } from "react";
import Link from "next/link";
import { register } from "@/app/actions/auth";
import { Logo } from "@/components/ui/Logo";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(register, undefined);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8">
        <div className="mb-8 text-center">
          <Logo variant="full" size={36} className="mx-auto" />
          <p className="mt-2 text-xs text-muted">Registrar una nueva organización</p>
        </div>

        <form action={formAction} className="grid gap-4">
          <Field name="tenant_name" label="Nombre del club / organización" placeholder="Club Sportivo Trinidense" />
          <Field name="full_name" label="Tu nombre completo" placeholder="Jonathan Santana" />
          <Field name="email" label="Email" type="email" placeholder="scout@club.com" autoComplete="email" />
          <Field
            name="password"
            label="Contraseña"
            type="password"
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            minLength={8}
          />

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
            {pending ? "Creando…" : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-muted">
          <Link href="/login" className="font-medium text-text hover:underline">
            ← Volver al login
          </Link>
        </p>
      </div>
    </main>
  );
}

function Field({
  name,
  label,
  type = "text",
  placeholder,
  autoComplete,
  minLength,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  minLength?: number;
}) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={name} className="text-xs font-medium text-muted">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        minLength={minLength}
        required
        className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text outline-none focus-visible:ring-2 focus-visible:ring-accent-2 focus:border-accent-2"
      />
    </div>
  );
}
