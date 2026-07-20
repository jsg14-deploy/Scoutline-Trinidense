"use client";

import { useRef, useState, useTransition } from "react";
import { createSalaryManual } from "@/app/actions/finance";

type PlayerOption = { id: string; name: string };

export function SalaryManualForm({ players }: { players: PlayerOption[] }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    const playerId = String(formData.get("playerId") || "");
    const season = String(formData.get("season") || "").trim();
    const monthlySalary = Number(formData.get("monthlySalary") || 0);

    if (!playerId || !season || !monthlySalary) {
      setError("Elegí un jugador, temporada y salario mensual.");
      return;
    }
    setError(null);

    startTransition(async () => {
      await createSalaryManual({
        playerId,
        season,
        monthlySalary,
        currency: String(formData.get("currency") || "USD").toUpperCase(),
        notes: String(formData.get("notes") || "") || undefined,
      });
      formRef.current?.reset();
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="grid gap-3 rounded-2xl border border-border bg-card p-5">
      <h3 className="text-sm font-bold text-text">Cargar un jugador puntual</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-muted">Jugador</label>
          <select
            name="playerId"
            defaultValue=""
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent-2 focus:outline-none"
          >
            <option value="" disabled>
              Elegí un jugador…
            </option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted">Temporada</label>
          <input
            name="season"
            placeholder="2026"
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent-2 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted">Salario mensual</label>
          <input
            type="number"
            name="monthlySalary"
            step="0.01"
            min="0"
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent-2 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted">Moneda</label>
          <input
            name="currency"
            defaultValue="USD"
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent-2 focus:outline-none"
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-muted">Notas</label>
        <textarea
          name="notes"
          rows={2}
          placeholder="Bonos, cláusulas, duración del contrato…"
          className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent-2 focus:outline-none"
        />
      </div>
      {error && <p className="text-xs text-negative">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="justify-self-start rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Guardando…" : "Guardar salario"}
      </button>
    </form>
  );
}
