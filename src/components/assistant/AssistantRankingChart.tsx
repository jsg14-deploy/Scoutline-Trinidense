"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { RankingEntry } from "@/lib/ai/playerContext";

export function AssistantRankingChart({ entries }: { entries: RankingEntry[] }) {
  if (entries.length === 0) return null;

  const data = entries.map((e) => ({ name: e.name, value: e.avgPercentile, positionGroup: e.positionGroup }));

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
        Ranking por percentil promedio
      </p>
      <ResponsiveContainer width="100%" height={Math.max(180, entries.length * 34)}>
        <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={{ fill: "var(--color-muted)", fontSize: 11 }} />
          <YAxis
            type="category"
            dataKey="name"
            width={140}
            tick={{ fill: "var(--color-text)", fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }}
            labelStyle={{ color: "var(--color-text)" }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={i === 0 ? "#f2c230" : "#60a5fa"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
