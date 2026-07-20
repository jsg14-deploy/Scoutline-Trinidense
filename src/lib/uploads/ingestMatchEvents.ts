import "server-only";
import { prisma } from "@/lib/db/prisma";
import { recomputePlayerSeasonStats } from "@/lib/stats/aggregate";
import type { PositionGroup } from "@/generated/prisma/enums";

export type MatchEventUploadMeta = {
  teamName: string;
  opponentName: string;
  leagueName: string;
  leagueCountry: string;
  season: string;
  matchDate: Date;
};

const VALID_POSITION_GROUPS = new Set(["GK", "DEF", "MID", "FWD"]);

function toPositionGroup(value: string | undefined): PositionGroup {
  const upper = (value ?? "").trim().toUpperCase();
  return (VALID_POSITION_GROUPS.has(upper) ? upper : "MID") as PositionGroup;
}

function toFloat(value: string | undefined): number | null {
  if (value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

// Asume que el archivo cargado es la planilla de eventos de UN equipo en UN
// partido (el patrón habitual de un export de SICS): todos los player_name
// de las filas pertenecen a meta.teamName, no al rival.
export async function ingestMatchEvents(rows: Record<string, string>[], meta: MatchEventUploadMeta) {
  const league = await prisma.league.upsert({
    where: { name_country: { name: meta.leagueName, country: meta.leagueCountry } },
    update: {},
    create: { name: meta.leagueName, country: meta.leagueCountry },
  });

  const homeTeam = await prisma.team.upsert({
    where: { name_leagueId_season: { name: meta.teamName, leagueId: league.id, season: meta.season } },
    update: {},
    create: { name: meta.teamName, leagueId: league.id, season: meta.season },
  });

  const awayTeam = await prisma.team.upsert({
    where: { name_leagueId_season: { name: meta.opponentName, leagueId: league.id, season: meta.season } },
    update: {},
    create: { name: meta.opponentName, leagueId: league.id, season: meta.season },
  });

  const match = await prisma.match.create({
    data: {
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      season: meta.season,
      playedAt: meta.matchDate,
    },
  });

  const playerIdByName = new Map<string, string>();
  const touchedPlayerIds = new Set<string>();
  const eventRows: {
    matchId: string;
    playerId: string;
    eventType: string;
    x: number | null;
    y: number | null;
    endX: number | null;
    endY: number | null;
    xg: number | null;
  }[] = [];

  for (const row of rows) {
    const playerName = row.player_name?.trim();
    const eventType = row.event_type?.trim();
    if (!playerName || !eventType) continue;

    let playerId = playerIdByName.get(playerName);
    if (!playerId) {
      const existing = await prisma.player.findFirst({
        where: { name: playerName, currentTeamId: homeTeam.id },
      });
      const player =
        existing ??
        (await prisma.player.create({
          data: {
            name: playerName,
            positionGroup: toPositionGroup(row.position_group),
            currentTeamId: homeTeam.id,
          },
        }));
      playerId = player.id;
      playerIdByName.set(playerName, playerId);
    }

    touchedPlayerIds.add(playerId);
    eventRows.push({
      matchId: match.id,
      playerId,
      eventType,
      x: toFloat(row.x),
      y: toFloat(row.y),
      endX: toFloat(row.end_x),
      endY: toFloat(row.end_y),
      xg: toFloat(row.xg),
    });
  }

  if (eventRows.length > 0) {
    await prisma.playerEvent.createMany({ data: eventRows });
  }

  for (const playerId of touchedPlayerIds) {
    await recomputePlayerSeasonStats(playerId, meta.season);
  }

  return { matchId: match.id, playersTouched: touchedPlayerIds.size, eventsCreated: eventRows.length };
}
