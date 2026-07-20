import "server-only";
import { prisma } from "@/lib/db/prisma";
import { POSITION_FEATURES, type StatKey } from "@/lib/stats/eventTypes";

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

export type SimilarityFilters = {
  maxMarketValueEur?: number;
  minLeagueTier?: number;
  maxLeagueTier?: number;
  contractExpiryBefore?: Date;
  minMinutesPlayed?: number;
};

export type SimilarPlayerResult = {
  playerId: string;
  name: string;
  positionGroup: string;
  teamName: string | null;
  leagueName: string | null;
  marketValueEur: number | null;
  similarity: number;
};

export async function findSimilarPlayers(
  targetPlayerId: string,
  season: string,
  filters: SimilarityFilters = {},
  limit = 20,
): Promise<SimilarPlayerResult[]> {
  const target = await prisma.playerSeasonStats.findUnique({
    where: { playerId_season: { playerId: targetPlayerId, season } },
    include: { player: true },
  });
  if (!target || !target.percentilesJson) return [];

  const featureKeys = POSITION_FEATURES[target.player.positionGroup] ?? [];
  const targetVector = featureKeys.map((k) => (target.percentilesJson as Record<StatKey, number>)[k] ?? 0);

  const cohort = await prisma.playerSeasonStats.findMany({
    where: {
      season,
      playerId: { not: targetPlayerId },
      player: { positionGroup: target.player.positionGroup },
      minutesPlayed: filters.minMinutesPlayed ? { gte: filters.minMinutesPlayed } : undefined,
    },
    include: {
      player: {
        include: {
          currentTeam: { include: { league: true } },
          marketData: true,
        },
      },
    },
  });

  const results: SimilarPlayerResult[] = [];
  for (const row of cohort) {
    if (!row.percentilesJson) continue;

    const marketValue = row.player.marketData[0]?.marketValueEur
      ? Number(row.player.marketData[0].marketValueEur)
      : null;
    if (filters.maxMarketValueEur && marketValue !== null && marketValue > filters.maxMarketValueEur) continue;

    const contractExpiry = row.player.marketData[0]?.contractExpiry ?? null;
    if (filters.contractExpiryBefore && contractExpiry && contractExpiry > filters.contractExpiryBefore) continue;

    const tier = row.player.currentTeam?.league.tier ?? null;
    if (filters.minLeagueTier && tier !== null && tier < filters.minLeagueTier) continue;
    if (filters.maxLeagueTier && tier !== null && tier > filters.maxLeagueTier) continue;

    const vector = featureKeys.map((k) => (row.percentilesJson as Record<StatKey, number>)[k] ?? 0);

    results.push({
      playerId: row.playerId,
      name: row.player.name,
      positionGroup: row.player.positionGroup,
      teamName: row.player.currentTeam?.name ?? null,
      leagueName: row.player.currentTeam?.league.name ?? null,
      marketValueEur: marketValue,
      similarity: cosineSimilarity(targetVector, vector),
    });
  }

  results.sort((a, b) => b.similarity - a.similarity);
  return results.slice(0, limit);
}
