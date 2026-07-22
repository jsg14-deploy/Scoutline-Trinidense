"use client";

import { useActionState, useEffect, useRef } from "react";
import { createPlayerManual } from "@/app/actions/players";

export function PlantelManualForm() {
  const [state, formAction, pending] = useActionState(createPlayerManual, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="grid gap-4 rounded-2xl border border-border bg-card p-5"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="grid gap-1">
          <label htmlFor="name" className="text-xs font-semibold text-muted">
            Nombre del jugador *
          </label>
          <input
            id="name"
            name="name"
            required
            placeholder="Ej: Jonathan Santana"
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent-2 focus:outline-none"
          />
        </div>

        <div className="grid gap-1">
          <label htmlFor="positionGroup" className="text-xs font-semibold text-muted">
            Posición *
          </label>
          <select
            id="positionGroup"
            name="positionGroup"
            required
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent-2 focus:outline-none"
          >
            <option value="GK">Arquero</option>
            <option value="DEF">Defensor</option>
            <option value="MID">Mediocampista</option>
            <option value="FWD">Delantero</option>
          </select>
        </div>

        <div className="grid gap-1">
          <label htmlFor="nationality" className="text-xs font-semibold text-muted">
            Nacionalidad
          </label>
          <input
            id="nationality"
            name="nationality"
            placeholder="Ej: Paraguaya"
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent-2 focus:outline-none"
          />
        </div>

        <div className="grid gap-1">
          <label htmlFor="foot" className="text-xs font-semibold text-muted">
            Pie hábil
          </label>
          <select
            id="foot"
            name="foot"
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent-2 focus:outline-none"
          >
            <option value="">Sin especificar</option>
            <option value="derecho">Derecho</option>
            <option value="izquierdo">Izquierdo</option>
            <option value="ambos">Ambos</option>
          </select>
        </div>

        <div className="grid gap-1">
          <label htmlFor="heightCm" className="text-xs font-semibold text-muted">
            Altura (cm)
          </label>
          <input
            id="heightCm"
            name="heightCm"
            type="number"
            placeholder="Ej: 181"
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent-2 focus:outline-none"
          />
        </div>
      </div>

      {state?.error && <p className="text-sm text-negative">{state.error}</p>}
      {state?.success && <p className="text-sm text-positive">Jugador agregado con éxito al plantel.</p>}

      <button
        type="submit"
        disabled={pending}
        className="justify-self-start rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-navy-deep hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Guardando..." : "Registrar jugador"}
      </button>
    </form>
  );
}
