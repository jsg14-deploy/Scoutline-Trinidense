import "server-only";
import { prisma } from "@/lib/db/prisma";
import { percentilesForCohort } from "@/lib/similarity/percentiles";
import { SMARTSEARCH_POSITION_FEATURES, SMARTSEARCH_STAT_KEYS, type SmartSearchStatKey } from "@/lib/stats/smartSearchKeys";
import { classifyPositionGroup } from "@/lib/uploads/classifyPosition";
import type { PositionGroup } from "@/generated/prisma/enums";

export type PlayerReportUploadMeta = { season: string };

function toCount(value: string | undefined): number | null {
  if (value === undefined) return null;
  const trimmed = value.trim();
  if (trimmed === "" || trimmed === "-") return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

// "Valor de mercado" viene como texto con puntos de miles al estilo hispano
// (ej. "2.500.000"), no como decimal — a diferencia de las métricas por-90.
function toMarketValue(value: string | undefined): number | null {
  if (value === undefined) return null;
  const trimmed = value.trim();
  if (trimmed === "" || trimmed === "-") return null;
  const digitsOnly = trimmed.replace(/\./g, "");
  const n = Number(digitsOnly);
  return Number.isFinite(n) ? n : null;
}

// Algunos reportes de SICS.tv pegan el año de nacimiento al país, ej.
// "Argentina ('06)" — lo sacamos para quedarnos solo con el país.
function cleanNationality(value: string | undefined): string | null {
  if (!value) return null;
  const cleaned = value.trim().replace(/\s*\(['’]?\d{2,4}\)\s*$/, "");
  return cleaned || null;
}

function per90(count: number | null, minutes: number): number {
  if (!count || minutes <= 0) return 0;
  return (count / minutes) * 90;
}

// Usa la métrica por-90 si SICS ya la trae calculada; si no, la deriva del
// total crudo + minutos jugados.
function rateOrDerive(direct: number | null, rawCount: number | null, minutes: number): number {
  if (direct !== null) return direct;
  return per90(rawCount, minutes);
}

export async function ingestPlayerReport(rows: Record<string, string>[], meta: PlayerReportUploadMeta) {
  const touchedByPosition = new Map<PositionGroup, Set<string>>();
  let playersProcessed = 0;

  // Muchas filas comparten equipo/país — cachear evita re-consultar la base
  // por cada fila (con archivos de cientos de filas, esto es la diferencia
  // entre unas pocas consultas y cientos de idas y vueltas innecesarias).
  const leagueCache = new Map<string, Awaited<ReturnType<typeof prisma.league.upsert>>>();
  const teamCache = new Map<string, Awaited<ReturnType<typeof prisma.team.upsert>>>();

  for (const row of rows) {
    const playerName = row.player_name?.trim();
    const teamName = row.team_name?.trim();
    if (!playerName || !teamName) continue;

    const minutesPlayed = toCount(row.minutes_played) ?? 0;
    const nationality = cleanNationality(row.nationality);
    const positionGroup = classifyPositionGroup(row.position_raw);

    const leagueCountry = nationality ?? "Sin especificar";
    let league = leagueCache.get(leagueCountry);
    if (!league) {
      league = await prisma.league.upsert({
        where: { name_country: { name: "Liga sin especificar", country: leagueCountry } },
        update: {},
        create: { name: "Liga sin especificar", country: leagueCountry },
      });
      leagueCache.set(leagueCountry, league);
    }

    const teamCacheKey = `${teamName}|${league.id}`;
    let team = teamCache.get(teamCacheKey);
    if (!team) {
      team = await prisma.team.upsert({
        where: { name_leagueId_season: { name: teamName, leagueId: league.id, season: meta.season } },
        update: {},
        create: { name: teamName, leagueId: league.id, season: meta.season },
      });
      teamCache.set(teamCacheKey, team);
    }

    const existingPlayer = await prisma.player.findFirst({ where: { name: playerName, currentTeamId: team.id } });
    const player = existingPlayer
      ? await prisma.player.update({
          where: { id: existingPlayer.id },
          data: {
            nationality: nationality ?? existingPlayer.nationality,
            positionGroup,
            foot: row.foot?.trim() || existingPlayer.foot,
          },
        })
      : await prisma.player.create({
          data: {
            name: playerName,
            nationality,
            positionGroup,
            foot: row.foot?.trim() || null,
            currentTeamId: team.id,
          },
        });

    const marketValueEur = toMarketValue(row.market_value);
    if (marketValueEur !== null) {
      await prisma.marketData.upsert({
        where: { playerId_source: { playerId: player.id, source: "SICS SmartSearch" } },
        update: { marketValueEur },
        create: { playerId: player.id, source: "SICS SmartSearch", marketValueEur },
      });
    }

    const statsJson: Record<SmartSearchStatKey, number> = {
      goals_p90: rateOrDerive(toCount(row.goals_p90), toCount(row.goals), minutesPlayed),
      shots_p90: per90(toCount(row.shots), minutesPlayed),
      shots_on_target_p90: per90(toCount(row.shots_on_target), minutesPlayed),
      key_passes_p90: per90(toCount(row.key_passes), minutesPlayed),
      lateral_passes_p90: per90(toCount(row.lateral_passes), minutesPlayed),
      dribbles_p90: per90(toCount(row.dribbles), minutesPlayed),
      duels_p90: per90(toCount(row.duels), minutesPlayed),
      fouls_p90: per90(toCount(row.fouls), minutesPlayed),
      fouls_won_p90: per90(toCount(row.fouls_won), minutesPlayed),
      negative_actions_p90: rateOrDerive(toCount(row.negative_actions_p90), toCount(row.negative_actions), minutesPlayed),
      positive_actions_p90: rateOrDerive(toCount(row.positive_actions_p90), toCount(row.positive_actions), minutesPlayed),
      recoveries_p90: rateOrDerive(toCount(row.recoveries_p90), toCount(row.recoveries), minutesPlayed),
      attacking_recoveries_p90: rateOrDerive(
        toCount(row.attacking_recoveries_p90),
        toCount(row.attacking_recoveries),
        minutesPlayed,
      ),
    };

    await prisma.playerSeasonStats.upsert({
      where: { playerId_season: { playerId: player.id, season: meta.season } },
      update: { minutesPlayed, statsJson },
      create: { playerId: player.id, season: meta.season, minutesPlayed, statsJson },
    });

    if (!touchedByPosition.has(positionGroup)) touchedByPosition.set(positionGroup, new Set());
    touchedByPosition.get(positionGroup)!.add(player.id);
    playersProcessed += 1;
  }

  for (const positionGroup of touchedByPosition.keys()) {
    await recomputeSmartSearchCohortPercentiles(meta.season, positionGroup);
  }

  return { playersProcessed };
}

// Red de seguridad manual: recalcula percentiles para todos los grupos de
// posición de una temporada, por si alguna carga anterior no llegó a
// terminar el recálculo (ej. por el timeout de $transaction ya corregido).
export async function recomputeAllSmartSearchPercentiles(season: string) {
  const groups = await prisma.player.findMany({
    where: { seasonStats: { some: { season } } },
    distinct: ["positionGroup"],
    select: { positionGroup: true },
  });
  for (const { positionGroup } of groups) {
    await recomputeSmartSearchCohortPercentiles(season, positionGroup);
  }
}

async function recomputeSmartSearchCohortPercentiles(season: string, positionGroup: PositionGroup) {
  const featureKeys = SMARTSEARCH_POSITION_FEATURES[positionGroup] ?? SMARTSEARCH_STAT_KEYS;

  const statRows = await prisma.playerSeasonStats.findMany({
    where: { season, player: { positionGroup } },
    select: { playerId: true, statsJson: true },
  });
  if (statRows.length === 0) return;

  const cohort = statRows.map((r) => ({
    id: r.playerId,
    stats: (r.statsJson as Record<SmartSearchStatKey, number>) ?? ({} as Record<SmartSearchStatKey, number>),
  }));

  const percentiles = percentilesForCohort(cohort, featureKeys);

  // Promise.all en vez de $transaction: son escrituras independientes (no
  // necesitan atomicidad entre sí), y así evitamos el timeout por defecto de
  // 5s de las transacciones interactivas de Prisma cuando el cohorte tiene
  // muchos jugadores — con $transaction, cohortes de 100+ superaban ese
  // límite y la escritura se cancelaba entera sin dejar rastro visible.
  await Promise.all(
    statRows.map((r) =>
      prisma.playerSeasonStats.update({
        where: { playerId_season: { playerId: r.playerId, season } },
        data: { percentilesJson: percentiles.get(r.playerId) },
      }),
    ),
  );
}
