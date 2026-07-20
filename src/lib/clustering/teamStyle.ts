import "server-only";
import { kmeans } from "ml-kmeans";
import { prisma } from "@/lib/db/prisma";

const TEAM_STYLE_FEATURE_KEYS = [
  "passesPerMatch",
  "pressuresPerMatch",
  "progressiveCarriesPerMatch",
  "shotsPerMatch",
  "defensiveActionsPerMatch",
] as const;

type TeamStyleFeatures = Record<(typeof TEAM_STYLE_FEATURE_KEYS)[number], number>;

const CLUSTER_COUNT = 4;
const STYLE_LABELS = ["possession", "high_press", "direct", "low_block"] as const;

function standardize(matrix: number[][]): number[][] {
  const cols = matrix[0]?.length ?? 0;
  const means = new Array(cols).fill(0);
  const stds = new Array(cols).fill(0);

  for (let c = 0; c < cols; c++) {
    const values = matrix.map((row) => row[c]);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
    means[c] = mean;
    stds[c] = Math.sqrt(variance) || 1;
  }

  return matrix.map((row) => row.map((v, c) => (v - means[c]) / stds[c]));
}

async function computeTeamFeatures(teamId: string, season: string): Promise<TeamStyleFeatures> {
  const matches = await prisma.match.findMany({
    where: { season, OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }] },
    select: { id: true },
  });
  const matchIds = matches.map((m) => m.id);
  if (matchIds.length === 0) {
    return {
      passesPerMatch: 0,
      pressuresPerMatch: 0,
      progressiveCarriesPerMatch: 0,
      shotsPerMatch: 0,
      defensiveActionsPerMatch: 0,
    };
  }

  const events = await prisma.playerEvent.findMany({
    where: { matchId: { in: matchIds }, player: { currentTeamId: teamId } },
    select: { eventType: true, x: true, endX: true },
  });

  const n = matchIds.length;
  let passes = 0;
  let pressures = 0;
  let progressiveCarries = 0;
  let shots = 0;
  let defensiveActions = 0;

  for (const ev of events) {
    switch (ev.eventType) {
      case "Pass":
        passes++;
        break;
      case "Pressure":
        pressures++;
        break;
      case "Carry":
        if (ev.x !== null && ev.endX !== null && ev.endX - ev.x >= 10) progressiveCarries++;
        break;
      case "Shot":
        shots++;
        break;
      case "Interception":
      case "Clearance":
      case "Duel":
        defensiveActions++;
        break;
      default:
        break;
    }
  }

  return {
    passesPerMatch: passes / n,
    pressuresPerMatch: pressures / n,
    progressiveCarriesPerMatch: progressiveCarries / n,
    shotsPerMatch: shots / n,
    defensiveActionsPerMatch: defensiveActions / n,
  };
}

function labelCluster(centroid: number[]): (typeof STYLE_LABELS)[number] {
  const [passes, pressures, progressiveCarries, shots] = centroid;
  if (passes > 0.5 && progressiveCarries > 0) return "possession";
  if (pressures > 0.5) return "high_press";
  if (shots > 0.5 && passes < 0) return "direct";
  return "low_block";
}

/**
 * Reclusteriza el estilo de todos los equipos de una temporada (K-Means, k=4)
 * y persiste styleCluster + styleFeaturesJson en cada Team.
 */
export async function recomputeTeamStyleClusters(season: string) {
  const teams = await prisma.team.findMany({ where: { season }, select: { id: true } });
  if (teams.length < CLUSTER_COUNT) return;

  const rawFeatures = await Promise.all(teams.map((t) => computeTeamFeatures(t.id, season)));
  const matrix = rawFeatures.map((f) => TEAM_STYLE_FEATURE_KEYS.map((k) => f[k]));
  const standardized = standardize(matrix);

  const result = kmeans(standardized, CLUSTER_COUNT, { seed: 42 });
  const labels = result.centroids.map((centroid) => labelCluster(centroid));

  await prisma.$transaction(
    teams.map((team, i) =>
      prisma.team.update({
        where: { id: team.id },
        data: {
          styleCluster: labels[result.clusters[i]],
          styleFeaturesJson: rawFeatures[i],
        },
      }),
    ),
  );
}
