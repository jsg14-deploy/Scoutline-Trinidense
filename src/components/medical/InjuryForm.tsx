"use client";

import { useRef, useState, useTransition } from "react";
import { createInjury } from "@/app/actions/medical";
import type { InjurySeverity } from "@/generated/prisma/enums";

const SEVERITY_OPTIONS: { value: InjurySeverity; label: string }[] = [
  { value: "mild", label: "Leve" },
  { value: "moderate", label: "Moderada" },
  { value: "severe", label: "Grave" },
];

export function InjuryForm({ playerId }: { playerId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    const diagnosis = String(formData.get("diagnosis") || "").trim();
    const bodyPart = String(formData.get("bodyPart") || "").trim();
    const occurredAt = String(formData.get("occurredAt") || "");
    if (!diagnosis || !bodyPart || !occurredAt) {
      setError("Completá diagnóstico, zona y fecha.");
      return;
    }
    setError(null);

    startTransition(async () => {
      await createInjury({
        playerId,
        diagnosis,
        bodyPart,
        severity: String(formData.get("severity") || "moderate") as InjurySeverity,
        occurredAt,
        expectedReturnAt: String(formData.get("expectedReturnAt") || "") || undefined,
        notes: String(formData.get("notes") || "") || undefined,
      });
      formRef.current?.reset();
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="grid gap-3 rounded-2xl border border-border bg-card p-5">
      <h3 className="text-sm font-bold text-text">Registrar lesión</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Diagnóstico" name="diagnosis" placeholder="Ej: desgarro fibrilar" />
        <Field label="Zona" name="bodyPart" placeholder="Ej: isquiotibial derecho" />
        <div>
          <label className="text-xs font-medium text-muted">Gravedad</label>
          <select
            name="severity"
            defaultValue="moderate"
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent-2 focus:outline-none"
          >
            {SEVERITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <Field label="Fecha de la lesión" name="occurredAt" type="date" />
        <Field label="Retorno estimado" name="expectedReturnAt" type="date" required={false} />
      </div>
      <div>
        <label className="text-xs font-medium text-muted">Notas</label>
        <textarea
          name="notes"
          rows={2}
          placeholder="Tratamiento, evolución, observaciones del cuerpo médico…"
          className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent-2 focus:outline-none"
        />
      </div>
      {error && <p className="text-xs text-negative">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="justify-self-start rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Guardando…" : "Guardar lesión"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required = true,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted">
        {label}
        {required && " *"}
      </label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent-2 focus:outline-none"
      />
    </div>
  );
}
