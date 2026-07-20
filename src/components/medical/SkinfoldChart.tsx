"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type SkinfoldPoint = { date: string; sumMm: number; bodyFatPercent: number | null };

export function SkinfoldChart({ points }: { points: SkinfoldPoint[] }) {
  if (points.length < 2) {
    return (
      <p className="rounded-2xl border border-dashed border-border-2 bg-card p-6 text-center text-sm text-muted">
        Necesitás al menos 2 mediciones para ver el progreso en un gráfico.
      </p>
    );
  }

  const data = points.map((p) => ({ date: p.date.slice(5, 10), sumMm: p.sumMm, bodyFat: p.bodyFatPercent }));
  const hasBodyFat = data.some((d) => d.bodyFat !== null);

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
        Progreso de pliegues {hasBodyFat && "y % de grasa estimado"}
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ left: -10, right: 10 }}>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fill: "var(--color-muted)", fontSize: 11 }} />
          <YAxis tick={{ fill: "var(--color-muted)", fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }}
            labelStyle={{ color: "var(--color-text)" }}
          />
          <Line type="monotone" dataKey="sumMm" name="Suma pliegues (mm)" stroke="#60a5fa" strokeWidth={2} dot={{ r: 3 }} />
          {hasBodyFat && (
            <Line
              type="monotone"
              dataKey="bodyFat"
              name="% grasa estimado"
              stroke="#f2c230"
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
