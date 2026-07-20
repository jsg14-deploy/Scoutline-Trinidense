"use client";

import { useActionState } from "react";
import { createVideoClip } from "@/app/actions/video";

type PlayerOption = { id: string; name: string; positionGroup: string };

export function VideoClipForm({ players }: { players: PlayerOption[] }) {
  const [state, formAction, pending] = useActionState(createVideoClip, undefined);

  return (
    <form action={formAction} className="grid gap-4 rounded-2xl border border-border bg-card p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1">
          <label htmlFor="title" className="text-xs font-semibold text-muted">
            Título
          </label>
          <input
            id="title"
            name="title"
            required
            placeholder="Ej: Trinidense vs Olimpia — 2do tiempo"
            className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text focus-visible:ring-2 focus-visible:ring-accent-2 focus:border-accent-2 outline-none transition-colors"
          />
        </div>
        <div className="grid gap-1">
          <label htmlFor="player_id" className="text-xs font-semibold text-muted">
            Jugador (opcional)
          </label>
          <select
            id="player_id"
            name="player_id"
            className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text focus-visible:ring-2 focus-visible:ring-accent-2 focus:border-accent-2 outline-none transition-colors"
          >
            <option value="">Sin jugador asociado</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.positionGroup})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-1">
        <label htmlFor="source_url" className="text-xs font-semibold text-muted">
          Link del video (YouTube o mp4 directo)
        </label>
        <input
          id="source_url"
          name="source_url"
          type="url"
          required
          placeholder="https://www.youtube.com/watch?v=…"
          className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text focus-visible:ring-2 focus-visible:ring-accent-2 focus:border-accent-2 outline-none transition-colors"
        />
        <p className="text-xs text-muted leading-relaxed">
          No se sube el archivo — se referencia por link (YouTube o mp4 directo), así que no hay
          límite de tamaño de tu lado.
        </p>
      </div>

      {state?.error && (
        <p className="text-sm text-negative" aria-live="polite">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="justify-self-start rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-navy-deep hover:opacity-90 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-accent-2 outline-none transition-opacity"
      >
        {pending ? "Guardando…" : "Agregar video"}
      </button>
    </form>
  );
}
