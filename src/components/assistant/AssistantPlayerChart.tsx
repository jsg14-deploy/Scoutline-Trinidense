"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { STAT_LABELS } from "@/lib/stats/statLabels";
import type { PlayerChartData } from "@/lib/ai/playerContext";

// Paleta fija (no depende del acento de marca) para poder distinguir hasta 3
// jugadores superpuestos en el mismo gráfico de barras.
const SERIES_COLORS = ["#f2c230", "#60a5fa", "#f87171"];

export function AssistantPlayerChart({ players }: { players: PlayerChartData[] }) {
  if (players.length === 0) return null;

  const statKeys = Array.from(new Set(players.flatMap((p) => Object.keys(p.percentiles))));
  const data = statKeys.map((key) => {
    const row: Record<string, string | number> = { stat: STAT_LABELS[key] ?? key };
    for (const p of players) row[p.name] = Math.round(p.percentiles[key] ?? 0);
    return row;
  });

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
        {players.length > 1 ? "Comparación de percentiles" : `Percentiles — ${players[0].name}`}
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ left: -20 }}>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="stat" tick={{ fill: "var(--color-muted)", fontSize: 11 }} interval={0} angle={-25} textAnchor="end" height={60} />
          <YAxis domain={[0, 100]} tick={{ fill: "var(--color-muted)", fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }}
            labelStyle={{ color: "var(--color-text)" }}
          />
          {players.length > 1 && <Legend wrapperStyle={{ fontSize: 12, color: "var(--color-muted)" }} />}
          {players.map((p, i) => (
            <Bar key={p.id} dataKey={p.name} fill={SERIES_COLORS[i % SERIES_COLORS.length]} radius={[4, 4, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
