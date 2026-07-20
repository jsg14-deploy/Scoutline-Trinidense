"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteSalary } from "@/app/actions/finance";
import type { SalaryRow } from "@/lib/finance/loadSalaryRows";

export type { SalaryRow };

function formatMoney(value: number, currency: string): string {
  return `${currency} ${Math.round(value).toLocaleString("es-PY")}`;
}

export function SalaryTable({ rows }: { rows: SalaryRow[] }) {
  const [pending, startTransition] = useTransition();

  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border-2 bg-card p-6 text-center text-sm text-muted">
        Todavía no cargaste salarios. Subí una planilla o agregá un jugador puntual arriba.
      </p>
    );
  }

  const sorted = [...rows].sort((a, b) => (b.costPerMinute ?? -1) - (a.costPerMinute ?? -1));

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface">
            {["Jugador", "Equipo", "Temporada", "Salario mensual", "Costo temporada", "Minutos jugados", "Costo / minuto", ""].map(
              (h) => (
                <th key={h} className="p-3 text-left text-xs font-semibold text-muted">
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={r.id} className="border-b border-border last:border-b-0 hover:bg-surface">
              <td className="p-3 font-medium text-text">{r.playerName}</td>
              <td className="p-3 text-xs text-muted">{r.teamName ?? "—"}</td>
              <td className="p-3 text-xs text-muted">{r.season}</td>
              <td className="p-3 text-muted">{formatMoney(r.monthlySalary, r.currency)}</td>
              <td className="p-3 text-muted">{formatMoney(r.seasonCost, r.currency)}</td>
              <td className="p-3 text-muted">{r.minutesPlayed ?? "sin datos"}</td>
              <td className="p-3 font-semibold text-text">
                {r.costPerMinute !== null ? formatMoney(r.costPerMinute, r.currency) : "—"}
              </td>
              <td className="p-3 text-right">
                <button
                  type="button"
                  title="Eliminar"
                  disabled={pending}
                  onClick={() => startTransition(() => deleteSalary(r.id))}
                  className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted hover:border-negative hover:text-negative disabled:opacity-50"
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
