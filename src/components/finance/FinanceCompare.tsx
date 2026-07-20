"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SalaryRow } from "@/components/finance/SalaryTable";

const MAX_SELECTED = 5;

function MiniChart({
  title,
  data,
  unitPrefix,
}: {
  title: string;
  data: { name: string; value: number }[];
  unitPrefix?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">{title}</p>
      <ResponsiveContainer width="100%" height={Math.max(120, data.length * 34)}>
        <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tick={{ fill: "var(--color-muted)", fontSize: 10 }} />
          <YAxis type="category" dataKey="name" width={120} tick={{ fill: "var(--color-text)", fontSize: 10 }} />
          <Tooltip
            contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }}
            labelStyle={{ color: "var(--color-text)" }}
            formatter={(value) => [`${unitPrefix ?? ""}${Number(value).toLocaleString("es-PY")}`, title]}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} fill="#f2c230" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function FinanceCompare({ rows }: { rows: SalaryRow[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  if (rows.length < 2) return null;

  function toggle(id: string) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_SELECTED) return prev;
      return [...prev, id];
    });
  }

  const selected = rows.filter((r) => selectedIds.includes(r.id));

  return (
    <div className="grid gap-4 rounded-2xl border border-border bg-card p-5">
      <div>
        <h3 className="text-sm font-bold text-text">Comparar jugador x jugador</h3>
        <p className="mt-1 text-xs text-muted">
          Elegí hasta {MAX_SELECTED} jugadores para comparar salario, minutos y costo por minuto lado a lado.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {rows.map((r) => {
          const active = selectedIds.includes(r.id);
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => toggle(r.id)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "border-accent bg-accent/15 text-text"
                  : "border-border text-muted hover:border-border-2 hover:text-text"
              }`}
            >
              {r.playerName} ({r.season})
            </button>
          );
        })}
      </div>

      {selected.length < 2 ? (
        <p className="rounded-lg border border-dashed border-border-2 p-4 text-center text-xs text-muted">
          Elegí al menos 2 jugadores para ver la comparativa.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <MiniChart
            title="Salario mensual"
            unitPrefix={`${selected[0].currency} `}
            data={selected.map((r) => ({ name: r.playerName, value: Math.round(r.monthlySalary) }))}
          />
          <MiniChart
            title="Minutos jugados"
            data={selected.map((r) => ({ name: r.playerName, value: r.minutesPlayed ?? 0 }))}
          />
          <MiniChart
            title="Costo por minuto"
            unitPrefix={`${selected[0].currency} `}
            data={selected.map((r) => ({ name: r.playerName, value: Math.round(r.costPerMinute ?? 0) }))}
          />
        </div>
      )}
    </div>
  );
}
