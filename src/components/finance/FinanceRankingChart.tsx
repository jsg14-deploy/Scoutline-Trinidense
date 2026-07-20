"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SalaryRow } from "@/components/finance/SalaryTable";

export function FinanceRankingChart({ rows }: { rows: SalaryRow[] }) {
  const withCost = rows.filter((r): r is SalaryRow & { costPerMinute: number } => r.costPerMinute !== null);
  if (withCost.length < 2) return null;

  const data = [...withCost]
    .sort((a, b) => b.costPerMinute - a.costPerMinute)
    .slice(0, 15)
    .map((r) => ({ name: r.playerName, value: Math.round(r.costPerMinute), currency: r.currency }));

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
        Ranking de costo por minuto jugado (de mayor a menor)
      </p>
      <ResponsiveContainer width="100%" height={Math.max(180, data.length * 32)}>
        <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tick={{ fill: "var(--color-muted)", fontSize: 11 }} />
          <YAxis type="category" dataKey="name" width={140} tick={{ fill: "var(--color-text)", fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }}
            labelStyle={{ color: "var(--color-text)" }}
            formatter={(value, _name, item) => [
              `${item.payload.currency} ${Number(value).toLocaleString("es-PY")}`,
              "Costo/min",
            ]}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={i === 0 ? "#f87171" : "#60a5fa"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
