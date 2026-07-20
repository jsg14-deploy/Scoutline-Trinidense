import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type { PositionGroup } from "@/generated/prisma/enums";

const PLAYER_INCLUDE = {
  currentTeam: { include: { league: true } },
  marketData: true,
  seasonStats: { orderBy: { updatedAt: "desc" as const }, take: 1 },
} satisfies Prisma.PlayerInclude;

type PlayerWithContext = Prisma.PlayerGetPayload<{ include: typeof PLAYER_INCLUDE }>;

export type PlayerChartData = {
  id: string;
  name: string;
  positionGroup: string;
  percentiles: Record<string, number>;
};

function summarizePlayer(player: PlayerWithContext): string {
  const stats = player.seasonStats[0];
  const market = player.marketData[0];

  const lines = [
    `Jugador: ${player.name}`,
    `Posición: ${player.positionGroup}`,
    `Nacionalidad: ${player.nationality ?? "no cargada"}`,
    `Pie: ${player.foot ?? "no cargado"}`,
    `Equipo actual: ${player.currentTeam?.name ?? "sin equipo"} (${player.currentTeam?.league.name ?? "liga no cargada"})`,
    `Valor de mercado: ${market?.marketValueEur ? `€${Number(market.marketValueEur).toLocaleString()}` : "no cargado"}`,
  ];

  if (stats) {
    lines.push(`Temporada: ${stats.season}`, `Minutos jugados: ${stats.minutesPlayed}`);
    if (stats.statsJson) lines.push(`Métricas por-90: ${JSON.stringify(stats.statsJson)}`);
    if (stats.percentilesJson) {
      lines.push(`Percentiles vs. su cohorte (misma posición/temporada): ${JSON.stringify(stats.percentilesJson)}`);
    }
  } else {
    lines.push("Todavía no tiene estadísticas de temporada cargadas.");
  }

  return lines.join("\n");
}

function toChartData(player: PlayerWithContext): PlayerChartData | null {
  const percentiles = player.seasonStats[0]?.percentilesJson as Record<string, number> | null | undefined;
  if (!percentiles || Object.keys(percentiles).length === 0) return null;
  return { id: player.id, name: player.name, positionGroup: player.positionGroup, percentiles };
}

// Un solo lugar que resuelve "de qué jugadores estamos hablando en este
// turno del chat": el elegido a mano en el desplegable + los que se
// mencionan por nombre en el mensaje. Devuelve tanto el texto para el
// prompt de la IA como los datos estructurados para dibujar los gráficos
// en la UI (no se puede confiar en que la IA devuelva JSON embebido de
// forma consistente, así que el gráfico se arma del lado del servidor con
// los mismos datos que se le pasan como contexto).
export async function resolvePlayersForTurn(
  playerId: string | undefined,
  message: string,
  limit = 3,
): Promise<{ summaries: string[]; chartData: PlayerChartData[] }> {
  const players: PlayerWithContext[] = [];
  const seenIds = new Set<string>();

  if (playerId) {
    const player = await prisma.player.findUnique({ where: { id: playerId }, include: PLAYER_INCLUDE });
    if (player) {
      players.push(player);
      seenIds.add(player.id);
    }
  }

  const words = Array.from(new Set(message.split(/[^\p{L}]+/u).filter((w) => w.length >= 3)));
  if (words.length > 0) {
    const candidates = await prisma.player.findMany({
      where: { OR: words.map((w) => ({ name: { contains: w, mode: "insensitive" as const } })) },
      include: PLAYER_INCLUDE,
      take: 30,
    });

    // Nombres cortos como "BENJAMIN" o "JEREMIAS" se repiten entre varios
    // jugadores distintos — en vez de quedarnos con las primeras N
    // coincidencias de la búsqueda por OR, puntuamos por cuántas palabras
    // del mensaje aparecen en cada nombre y priorizamos las que matchean
    // más de una (para no mezclar, ej., a alguien que solo comparte el
    // apellido con el jugador que realmente se pidió comparar).
    const scored = candidates
      .filter((c) => !seenIds.has(c.id))
      .map((c) => {
        const nameLower = c.name.toLowerCase();
        const score = words.filter((w) => nameLower.includes(w.toLowerCase())).length;
        return { player: c, score };
      })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score);

    const bestScore = scored[0]?.score ?? 0;
    const strongMatches = bestScore > 1 ? scored.filter((s) => s.score === bestScore) : scored;

    for (const { player: match } of strongMatches) {
      if (seenIds.has(match.id)) continue;
      players.push(match);
      seenIds.add(match.id);
      if (players.length >= limit) break;
    }
  }

  return {
    summaries: players.map(summarizePlayer),
    chartData: players.map(toChartData).filter((d): d is PlayerChartData => d !== null),
  };
}

export type RankingEntry = { id: string; name: string; positionGroup: string; avgPercentile: number };

const POSITION_KEYWORDS: [PositionGroup, string[]][] = [
  ["GK", ["arquero", "portero", "guardameta", "golero"]],
  ["DEF", ["defensa", "defensor", "central", "lateral"]],
  ["MID", ["mediocampista", "mediocampo", "volante", "centrocampista"]],
  ["FWD", ["delantero", "delantera", "extremo", "atacante", "ariete", "punta"]],
];

// Si el mensaje menciona una posición ("delanteros", "el mejor arquero"),
// filtramos el ranking a esa posición en vez de mezclar todas.
function detectPositionFilter(message: string): PositionGroup | null {
  const lower = message.toLowerCase();
  for (const [group, keywords] of POSITION_KEYWORDS) {
    if (keywords.some((k) => lower.includes(k))) return group;
  }
  return null;
}

type CatalogSnapshotEntry = {
  id: string;
  name: string;
  positionGroup: PositionGroup;
  teamName: string | null;
  season: string | null;
  minutesPlayed: number | null;
  avgPercentile: number | null;
};

// Una sola consulta que alimenta tanto el ranking (gráfico) como el
// resumen de catálogo (texto para el prompt) — antes eran dos queries
// separadas casi idénticas corriendo una atrás de la otra, lo que sumaba
// varios segundos de latencia percibida en el chat sin necesidad.
async function loadCatalogSnapshot(limit = 200): Promise<CatalogSnapshotEntry[]> {
  const players = await prisma.player.findMany({
    take: limit,
    orderBy: { name: "asc" },
    include: { currentTeam: true, seasonStats: { orderBy: { updatedAt: "desc" }, take: 1 } },
  });

  return players.map((p) => {
    const stats = p.seasonStats[0];
    const percentiles = stats?.percentilesJson as Record<string, number> | null | undefined;
    const values = percentiles ? Object.values(percentiles) : [];
    const avgPercentile = values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null;
    return {
      id: p.id,
      name: p.name,
      positionGroup: p.positionGroup,
      teamName: p.currentTeam?.name ?? null,
      season: stats?.season ?? null,
      minutesPlayed: stats?.minutesPlayed ?? null,
      avgPercentile,
    };
  });
}

// Cuando la IA no tiene jugadores puntuales para comparar (no se
// mencionaron nombres ni se eligió uno del desplegable), igual queremos
// poder mostrar un gráfico para preguntas generales tipo "¿quién es el
// mejor delantero?" — un ranking de los mejores jugadores por percentil
// promedio, filtrado por posición si el mensaje la menciona.
function rankingFromSnapshot(snapshot: CatalogSnapshotEntry[], message: string, limit = 8): RankingEntry[] {
  const positionGroup = detectPositionFilter(message);
  return snapshot
    .filter((p) => p.avgPercentile !== null && (!positionGroup || p.positionGroup === positionGroup))
    .sort((a, b) => (b.avgPercentile ?? 0) - (a.avgPercentile ?? 0))
    .slice(0, limit)
    .map((p) => ({ id: p.id, name: p.name, positionGroup: p.positionGroup, avgPercentile: p.avgPercentile ?? 0 }));
}

// Vista general de todo el catálogo (una línea por jugador) para que la IA
// pueda comparar/recomendar entre varios jugadores en vez de necesitar que
// se mencione un nombre exacto o se elija uno solo por el desplegable.
function overviewFromSnapshot(snapshot: CatalogSnapshotEntry[]): string | null {
  if (snapshot.length === 0) return null;
  const lines = snapshot.map(
    (p) =>
      `- ${p.name} | ${p.positionGroup} | ${p.teamName ?? "sin equipo"} | ${
        p.avgPercentile !== null
          ? `percentil promedio ${p.avgPercentile}/100 (temporada ${p.season}, ${p.minutesPlayed} min)`
          : "sin percentiles calculados"
      }`,
  );
  return `Catálogo de jugadores cargados, ${snapshot.length} en total:\n${lines.join("\n")}`;
}

// Punto de entrada único para la parte "general" del contexto (ranking +
// overview), pensado para correr en paralelo con resolvePlayersForTurn.
export async function buildGeneralContext(
  message: string,
): Promise<{ ranking: RankingEntry[]; overview: string | null }> {
  const snapshot = await loadCatalogSnapshot();
  return { ranking: rankingFromSnapshot(snapshot, message), overview: overviewFromSnapshot(snapshot) };
}
