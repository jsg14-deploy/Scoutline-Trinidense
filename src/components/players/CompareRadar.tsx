"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { STAT_LABELS } from "@/lib/stats/statLabels";

type CompareRadarProps = {
  percentiles1: Record<string, number>;
  percentiles2: Record<string, number>;
  name1: string;
  name2: string;
};

export function CompareRadar({ percentiles1, percentiles2, name1, name2 }: CompareRadarProps) {
  // Get all unique keys from both records
  const allKeys = Array.from(new Set([...Object.keys(percentiles1), ...Object.keys(percentiles2)]));

  const data = allKeys.map((key) => ({
    stat: STAT_LABELS[key] ?? key,
    [name1]: Math.round(percentiles1[key] || 0),
    [name2]: Math.round(percentiles2[key] || 0),
  }));

  return (
    <ResponsiveContainer width="100%" height={380}>
      <RadarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
        <PolarGrid stroke="var(--color-border)" />
        <PolarAngleAxis dataKey="stat" tick={{ fill: "var(--color-muted)", fontSize: 11 }} />
        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: "var(--color-card)", 
            borderColor: "var(--color-border)",
            borderRadius: "0.5rem",
            color: "var(--color-text)" 
          }}
          itemStyle={{ color: "var(--color-text)", fontWeight: 600 }}
        />
        <Legend wrapperStyle={{ paddingTop: "20px", fontSize: "12px", color: "var(--color-text)" }} />
        <Radar 
          name={name1}
          dataKey={name1} 
          stroke="var(--color-accent)" 
          fill="var(--color-accent)" 
          fillOpacity={0.5} 
        />
        <Radar 
          name={name2}
          dataKey={name2} 
          stroke="#34d399" // using a contrasting emerald green 
          fill="#34d399" 
          fillOpacity={0.4} 
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
