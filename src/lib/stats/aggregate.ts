import "server-only";
import { prisma } from "@/lib/db/prisma";
import { percentilesForCohort } from "@/lib/similarity/percentiles";
import { POSITION_FEATURES, STAT_KEYS, type StatKey } from "@/lib/stats/eventTypes";

function emptyStats(): Record<StatKey, number> {
  return {
    passes_p90: 0,
    shots_p90: 0,
    xg_total_p90: 0,
    carries_p90: 0,
    pressures_p90: 0,
    interceptions_p90: 0,
    dribbles_p90: 0,
    clearances_p90: 0,
    duels_p90: 0,
  };
}

function per90(count: number, minutes: number): number {
  if (minutes <= 0) return 0;
  return (count / minutes) * 90;
}

/**
 * Recalcula PlayerSeasonStats para un jugador/temporada a partir de sus
 * PlayerEvent, y recalcula percentiles contra el cohorte (misma temporada +
 * mismo grupo de posición). Se llama después de cada carga de eventos.
 */
export async function recomputePlayerSeasonStats(playerId: string, season: string) {
  const player = await prisma.player.findUniqueOrThrow({ where: { id: playerId } });

  const events = await prisma.playerEvent.findMany({
    where: { playerId, match: { season } },
    select: { eventType: true, xg: true },
  });

  // Minutos: sumamos lo cargado en DataUploadSession (kind=match_events) para
  // este jugador/temporada; si no hay dato, asumimos 90' por partido cubierto
  // como aproximación (se puede corregir subiendo minutos reales por partido).
  const matchIds = await prisma.playerEvent.findMany({
    where: { playerId, match: { season } },
    select: { matchId: true },
    distinct: ["matchId"],
  });
  const minutesPlayed = Math.max(matchIds.length * 90, 1);

  const counts = emptyStats();
  let xgTotal = 0;
  for (const ev of events) {
    switch (ev.eventType) {
      case "Pass":
        counts.passes_p90 += 1;
        break;
      case "Shot":
        counts.shots_p90 += 1;
        xgTotal += ev.xg ?? 0;
        break;
      case "Carry":
        counts.carries_p90 += 1;
        break;
      case "Pressure":
        counts.pressures_p90 += 1;
        break;
      case "Interception":
        counts.interceptions_p90 += 1;
        break;
      case "Dribble":
        counts.dribbles_p90 += 1;
        break;
      case "Clearance":
        counts.clearances_p90 += 1;
        break;
      case "Duel":
        counts.duels_p90 += 1;
        break;
      default:
        break;
    }
  }

  const statsJson: Record<StatKey, number> = {
    passes_p90: per90(counts.passes_p90, minutesPlayed),
    shots_p90: per90(counts.shots_p90, minutesPlayed),
    xg_total_p90: per90(xgTotal, minutesPlayed),
    carries_p90: per90(counts.carries_p90, minutesPlayed),
    pressures_p90: per90(counts.pressures_p90, minutesPlayed),
    interceptions_p90: per90(counts.interceptions_p90, minutesPlayed),
    dribbles_p90: per90(counts.dribbles_p90, minutesPlayed),
    clearances_p90: per90(counts.clearances_p90, minutesPlayed),
    duels_p90: per90(counts.duels_p90, minutesPlayed),
  };

  await prisma.playerSeasonStats.upsert({
    where: { playerId_season: { playerId, season } },
    update: { minutesPlayed, statsJson },
    create: { playerId, season, minutesPlayed, statsJson },
  });

  await recomputeCohortPercentiles(season, player.positionGroup);
}

/**
 * Recalcula percentilesJson para todos los jugadores de una temporada +
 * grupo de posición (el cohorte cambia cada vez que se agrega un jugador).
 */
export async function recomputeCohortPercentiles(season: string, positionGroup: string) {
  const featureKeys = POSITION_FEATURES[positionGroup] ?? STAT_KEYS;

  const rows = await prisma.playerSeasonStats.findMany({
    where: { season, player: { positionGroup: positionGroup as never } },
    select: { playerId: true, statsJson: true },
  });
  if (rows.length === 0) return;

  const cohort = rows.map((r) => ({
    id: r.playerId,
    stats: (r.statsJson as Record<StatKey, number>) ?? emptyStats(),
  }));

  const percentiles = percentilesForCohort(cohort, featureKeys);

  // Promise.all en vez de $transaction: ver nota en ingestPlayerReport.ts —
  // con cohortes grandes, $transaction supera el timeout de 5s por defecto
  // de las transacciones interactivas de Prisma y la escritura se cancela
  // entera sin error visible para el usuario.
  await Promise.all(
    rows.map((r) =>
      prisma.playerSeasonStats.update({
        where: { playerId_season: { playerId: r.playerId, season } },
        data: { percentilesJson: percentiles.get(r.playerId) },
      }),
    ),
  );
}
