import "server-only";
import { prisma } from "@/lib/db/prisma";

const PHYSICAL_NUMERIC_KEYS = [
  "distance_total_m",
  "distance_hsr_m",
  "sprints_count",
  "max_speed_kmh",
  "player_load",
  "acc_decel_count",
] as const;

type PhysicalKey = (typeof PHYSICAL_NUMERIC_KEYS)[number];

function averageByPlayer(sessions: { playerRef: string; rowsJson: unknown }[]) {
  const sums = new Map<string, Record<PhysicalKey, number>>();
  const counts = new Map<string, number>();

  for (const session of sessions) {
    const rows = Array.isArray(session.rowsJson) ? (session.rowsJson as Record<string, string>[]) : [];
    for (const row of rows) {
      const current = sums.get(session.playerRef) ?? ({} as Record<PhysicalKey, number>);
      for (const key of PHYSICAL_NUMERIC_KEYS) {
        const value = Number(row[key]);
        if (Number.isFinite(value)) current[key] = (current[key] ?? 0) + value;
      }
      sums.set(session.playerRef, current);
      counts.set(session.playerRef, (counts.get(session.playerRef) ?? 0) + 1);
    }
  }

  const averages = new Map<string, Record<PhysicalKey, number>>();
  for (const [playerRef, sum] of sums) {
    const n = counts.get(playerRef) ?? 1;
    const avg = {} as Record<PhysicalKey, number>;
    for (const key of PHYSICAL_NUMERIC_KEYS) avg[key] = (sum[key] ?? 0) / n;
    averages.set(playerRef, avg);
  }
  return averages;
}

// Compara el promedio físico de cada jugador contra el promedio del propio
// cohorte (todas las sesiones físicas cargadas por el tenant), en % de brecha.
export async function computePhysicalGap(tenantId: string) {
  const sessions = await prisma.dataUploadSession.findMany({
    where: { tenantId, kind: "physical" },
    select: { playerRef: true, rowsJson: true },
  });
  if (sessions.length === 0) return [];

  const perPlayer = averageByPlayer(sessions);
  const cohortAvg = {} as Record<PhysicalKey, number>;
  for (const key of PHYSICAL_NUMERIC_KEYS) {
    const values = [...perPlayer.values()].map((v) => v[key]).filter((v) => Number.isFinite(v));
    cohortAvg[key] = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  }

  return [...perPlayer.entries()].map(([playerRef, avg]) => ({
    playerRef,
    gapsPct: Object.fromEntries(
      PHYSICAL_NUMERIC_KEYS.map((key) => [
        key,
        cohortAvg[key] > 0 ? ((avg[key] - cohortAvg[key]) / cohortAvg[key]) * 100 : 0,
      ]),
    ) as Record<PhysicalKey, number>,
  }));
}
