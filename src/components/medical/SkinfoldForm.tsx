"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { createSkinfoldMeasurement } from "@/app/actions/medical";
import { computeSkinfoldSummary, SKINFOLD_SITE_LABELS, type SkinfoldSites } from "@/lib/medical/skinfolds";

const SITE_KEYS = Object.keys(SKINFOLD_SITE_LABELS) as (keyof SkinfoldSites)[];

export function SkinfoldForm({ playerId }: { playerId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sites, setSites] = useState<SkinfoldSites>({});
  const formRef = useRef<HTMLFormElement>(null);

  const summary = useMemo(() => computeSkinfoldSummary(sites), [sites]);

  function handleSubmit(formData: FormData) {
    const measuredAt = String(formData.get("measuredAt") || "");
    if (!measuredAt) {
      setError("Completá la fecha de la medición.");
      return;
    }
    if (Object.values(sites).every((v) => v === undefined)) {
      setError("Cargá al menos un pliegue.");
      return;
    }
    setError(null);

    const weightKg = formData.get("weightKg") ? Number(formData.get("weightKg")) : undefined;
    const heightCm = formData.get("heightCm") ? Number(formData.get("heightCm")) : undefined;

    startTransition(async () => {
      await createSkinfoldMeasurement({
        playerId,
        measuredAt,
        weightKg,
        heightCm,
        notes: String(formData.get("notes") || "") || undefined,
        ...sites,
      });
      formRef.current?.reset();
      setSites({});
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="grid gap-3 rounded-2xl border border-border bg-card p-5">
      <h3 className="text-sm font-bold text-text">Registrar medición de pliegues</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        <NumberField label="Fecha" name="measuredAt" type="date" />
        <NumberField label="Peso (kg)" name="weightKg" step="0.1" />
        <NumberField label="Talla (cm)" name="heightCm" step="0.1" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {SITE_KEYS.map((key) => (
          <div key={key}>
            <label className="text-xs font-medium text-muted">{SKINFOLD_SITE_LABELS[key]} (mm)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={sites[key] ?? ""}
              onChange={(e) =>
                setSites((prev) => ({
                  ...prev,
                  [key]: e.target.value === "" ? undefined : Number(e.target.value),
                }))
              }
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent-2 focus:outline-none"
            />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 rounded-lg border border-border-2 bg-surface px-4 py-3 text-sm">
        <span className="text-muted">
          Sumatoria: <span className="font-semibold text-text">{summary.sumMm} mm</span>
        </span>
        <span className="text-muted">
          % de grasa estimado:{" "}
          <span className="font-semibold text-text">
            {summary.bodyFatPercent !== null ? `${summary.bodyFatPercent}%` : "cargá los 6 pliegues"}
          </span>
        </span>
      </div>
      <p className="text-[11px] text-muted-2">
        El % de grasa es una estimación de campo (fórmula de Yuhasz), no reemplaza un estudio de laboratorio.
      </p>

      <div>
        <label className="text-xs font-medium text-muted">Notas</label>
        <textarea
          name="notes"
          rows={2}
          placeholder="Protocolo usado, evaluador, contexto de la medición…"
          className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent-2 focus:outline-none"
        />
      </div>
      {error && <p className="text-xs text-negative">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="justify-self-start rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Guardando…" : "Guardar medición"}
      </button>
    </form>
  );
}

function NumberField({
  label,
  name,
  type = "number",
  step,
}: {
  label: string;
  name: string;
  type?: string;
  step?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted">{label}</label>
      <input
        type={type}
        name={name}
        step={step}
        className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent-2 focus:outline-none"
      />
    </div>
  );
}
