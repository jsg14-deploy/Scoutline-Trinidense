import "server-only";
import { prisma } from "@/lib/db/prisma";
import { seasonCost, costPerMinute } from "@/lib/finance/cost";

export type SalaryRow = {
  id: string;
  playerId: string;
  playerName: string;
  teamName: string | null;
  season: string;
  monthlySalary: number;
  currency: string;
  seasonCost: number;
  minutesPlayed: number | null;
  costPerMinute: number | null;
};

export async function loadSalaryRows(tenantId: string, userId?: string): Promise<SalaryRow[]> {
  const salaries = await prisma.playerSalary.findMany({
    where: {
      tenantId,
      OR: [
        { isPublic: true },
        userId ? { createdById: userId } : {},
      ],
    },
    orderBy: { createdAt: "desc" },
    include: { player: { include: { currentTeam: true } } },
  });

  const statsRows =
    salaries.length > 0
      ? await prisma.playerSeasonStats.findMany({
          where: { OR: salaries.map((s) => ({ playerId: s.playerId, season: s.season })) },
          select: { playerId: true, season: true, minutesPlayed: true },
        })
      : [];
  const minutesByKey = new Map(statsRows.map((s) => [`${s.playerId}|${s.season}`, s.minutesPlayed]));

  return salaries.map((s) => {
    const monthlySalary = Number(s.monthlySalary);
    const minutesPlayed = minutesByKey.get(`${s.playerId}|${s.season}`) ?? null;
    return {
      id: s.id,
      playerId: s.playerId,
      playerName: s.player.name,
      teamName: s.player.currentTeam?.name ?? null,
      season: s.season,
      monthlySalary,
      currency: s.currency,
      seasonCost: seasonCost(monthlySalary),
      minutesPlayed,
      costPerMinute: minutesPlayed !== null ? costPerMinute(monthlySalary, minutesPlayed) : null,
    };
  });
}
