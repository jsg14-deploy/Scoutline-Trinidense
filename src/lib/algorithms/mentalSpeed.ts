import "server-only";
import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@/generated/prisma/client";
import type { StatKey } from "@/lib/stats/eventTypes";

// Proxy heurístico de "velocidad de decisión": promedio de percentiles de
// presiones recibidas, regates y pases por-90. No es una métrica validada
// científicamente — es un indicador compuesto simple mientras no captemos
// tiempo de posesión del balón por evento.
const MENTAL_SPEED_KEYS: StatKey[] = ["pressures_p90", "dribbles_p90", "passes_p90"];

export async function computeMentalSpeedRanking(season: string, limit = 20) {
  const rows = await prisma.playerSeasonStats.findMany({
    where: { season, percentilesJson: { not: Prisma.DbNull } },
    include: { player: true },
  });

  const ranked = rows
    .map((row) => {
      const percentiles = row.percentilesJson as Partial<Record<StatKey, number>> | null;
      const values = MENTAL_SPEED_KEYS.map((k) => percentiles?.[k] ?? 0);
      const score = values.reduce((a, b) => a + b, 0) / values.length;
      return { playerId: row.playerId, name: row.player.name, positionGroup: row.player.positionGroup, score };
    })
    .sort((a, b) => b.score - a.score);

  return ranked.slice(0, limit);
}

export async function computeMentalSpeedForPlayer(playerId: string, season: string) {
  const ranking = await computeMentalSpeedRanking(season, 10_000);
  return ranking.find((r) => r.playerId === playerId) ?? null;
}
