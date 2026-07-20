"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { STAT_LABELS } from "@/lib/stats/statLabels";

export function PercentileRadar({ percentiles }: { percentiles: Record<string, number> }) {
  const data = Object.entries(percentiles).map(([key, value]) => ({
    stat: STAT_LABELS[key] ?? key,
    value: Math.round(value),
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart data={data}>
        <PolarGrid stroke="var(--color-border)" />
        <PolarAngleAxis dataKey="stat" tick={{ fill: "var(--color-muted)", fontSize: 11 }} />
        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
        <Radar dataKey="value" stroke="var(--color-navy)" fill="var(--color-accent)" fillOpacity={0.45} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
