"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteSkinfoldMeasurement } from "@/app/actions/medical";

export type SkinfoldRow = {
  id: string;
  measuredAt: string;
  weightKg: number | null;
  sumMm: number;
  bodyFatPercent: number | null;
};

export function SkinfoldHistory({ playerId, rows }: { playerId: string; rows: SkinfoldRow[] }) {
  const [pending, startTransition] = useTransition();

  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border-2 bg-card p-6 text-center text-sm text-muted">
        Todavía no hay mediciones de pliegues para este jugador.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface">
            {["Fecha", "Peso", "Suma pliegues", "% grasa (est.)", ""].map((h) => (
              <th key={h} className="p-3 text-left text-xs font-semibold text-muted">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-border last:border-b-0 hover:bg-surface">
              <td className="p-3 text-text">{r.measuredAt.slice(0, 10)}</td>
              <td className="p-3 text-muted">{r.weightKg ? `${r.weightKg} kg` : "—"}</td>
              <td className="p-3 text-muted">{r.sumMm} mm</td>
              <td className="p-3 text-muted">{r.bodyFatPercent !== null ? `${r.bodyFatPercent}%` : "—"}</td>
              <td className="p-3 text-right">
                <button
                  type="button"
                  title="Eliminar"
                  disabled={pending}
                  onClick={() => startTransition(() => deleteSkinfoldMeasurement(r.id, playerId))}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted hover:border-negative hover:text-negative disabled:opacity-50 ml-auto"
                >
                  <Trash2 size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
