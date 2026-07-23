"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export type ActionState = { error?: string; success?: boolean; id?: string } | undefined;

// ─── Competitions ─────────────────────────────────────────────────────────────

export async function createCompetition(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession();

  const name = String(formData.get("name") ?? "").trim();
  const season = String(formData.get("season") ?? "").trim();
  const country = String(formData.get("country") ?? "Paraguay").trim();

  if (!name || !season) return { error: "Nombre y temporada son obligatorios." };

  try {
    const comp = await prisma.competition.create({
      data: { tenantId: session.tenantId, name, season, country },
    });
    revalidatePath("/competicion");
    return { success: true, id: comp.id };
  } catch {
    return { error: "No se pudo crear la competición." };
  }
}

export async function deleteCompetition(id: string): Promise<ActionState> {
  await requireSession();
  try {
    await prisma.competition.delete({ where: { id } });
    revalidatePath("/competicion");
    return { success: true };
  } catch {
    return { error: "No se pudo eliminar la competición." };
  }
}

// ─── Matches ──────────────────────────────────────────────────────────────────

export async function createMatch(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSession();

  const competitionId = String(formData.get("competitionId") ?? "").trim();
  const homeTeam = String(formData.get("homeTeam") ?? "").trim();
  const awayTeam = String(formData.get("awayTeam") ?? "").trim();
  const homeScoreStr = String(formData.get("homeScore") ?? "").trim();
  const awayScoreStr = String(formData.get("awayScore") ?? "").trim();
  const matchDateStr = String(formData.get("matchDate") ?? "").trim();
  const roundStr = String(formData.get("round") ?? "").trim();
  const venue = String(formData.get("venue") ?? "").trim() || null;
  const status = String(formData.get("status") ?? "scheduled").trim();

  if (!competitionId || !homeTeam || !awayTeam) {
    return { error: "Competición, equipo local y visitante son obligatorios." };
  }

  const homeScore = homeScoreStr !== "" ? parseInt(homeScoreStr, 10) : null;
  const awayScore = awayScoreStr !== "" ? parseInt(awayScoreStr, 10) : null;
  const matchDate = matchDateStr ? new Date(matchDateStr) : null;
  const round = roundStr ? parseInt(roundStr, 10) : null;

  try {
    await prisma.competitionMatch.create({
      data: { competitionId, homeTeam, awayTeam, homeScore, awayScore, matchDate, round, venue, status },
    });

    // If finished, auto-update standings
    if (status === "finished" && homeScore !== null && awayScore !== null) {
      await updateStandings(competitionId, homeTeam, awayTeam, homeScore, awayScore);
    }

    revalidatePath("/competicion");
    return { success: true };
  } catch {
    return { error: "No se pudo registrar el partido." };
  }
}

export async function updateMatchResult(
  matchId: string,
  homeScore: number,
  awayScore: number,
): Promise<ActionState> {
  await requireSession();

  try {
    const match = await prisma.competitionMatch.findUnique({ where: { id: matchId } });
    if (!match) return { error: "Partido no encontrado." };

    await prisma.competitionMatch.update({
      where: { id: matchId },
      data: { homeScore, awayScore, status: "finished" },
    });

    await updateStandings(match.competitionId, match.homeTeam, match.awayTeam, homeScore, awayScore);

    revalidatePath("/competicion");
    return { success: true };
  } catch {
    return { error: "No se pudo actualizar el resultado." };
  }
}

export async function deleteMatch(id: string): Promise<ActionState> {
  await requireSession();
  try {
    await prisma.competitionMatch.delete({ where: { id } });
    revalidatePath("/competicion");
    return { success: true };
  } catch {
    return { error: "No se pudo eliminar el partido." };
  }
}

// ─── Standings (internal) ─────────────────────────────────────────────────────

async function updateStandings(
  competitionId: string,
  homeTeam: string,
  awayTeam: string,
  homeScore: number,
  awayScore: number,
) {
  const homeWin = homeScore > awayScore;
  const awayWin = awayScore > homeScore;
  const draw = homeScore === awayScore;

  // Upsert home team
  await prisma.competitionStanding.upsert({
    where: { competitionId_teamName: { competitionId, teamName: homeTeam } },
    create: {
      competitionId,
      teamName: homeTeam,
      played: 1,
      wins: homeWin ? 1 : 0,
      draws: draw ? 1 : 0,
      losses: awayWin ? 1 : 0,
      goalsFor: homeScore,
      goalsAgainst: awayScore,
      points: homeWin ? 3 : draw ? 1 : 0,
    },
    update: {
      played: { increment: 1 },
      wins: homeWin ? { increment: 1 } : undefined,
      draws: draw ? { increment: 1 } : undefined,
      losses: awayWin ? { increment: 1 } : undefined,
      goalsFor: { increment: homeScore },
      goalsAgainst: { increment: awayScore },
      points: { increment: homeWin ? 3 : draw ? 1 : 0 },
    },
  });

  // Upsert away team
  await prisma.competitionStanding.upsert({
    where: { competitionId_teamName: { competitionId, teamName: awayTeam } },
    create: {
      competitionId,
      teamName: awayTeam,
      played: 1,
      wins: awayWin ? 1 : 0,
      draws: draw ? 1 : 0,
      losses: homeWin ? 1 : 0,
      goalsFor: awayScore,
      goalsAgainst: homeScore,
      points: awayWin ? 3 : draw ? 1 : 0,
    },
    update: {
      played: { increment: 1 },
      wins: awayWin ? { increment: 1 } : undefined,
      draws: draw ? { increment: 1 } : undefined,
      losses: homeWin ? { increment: 1 } : undefined,
      goalsFor: { increment: awayScore },
      goalsAgainst: { increment: homeScore },
      points: { increment: awayWin ? 3 : draw ? 1 : 0 },
    },
  });
}

// ─── Standings: manual upsert ─────────────────────────────────────────────────

export async function upsertStanding(
  competitionId: string,
  teamName: string,
  data: { played: number; wins: number; draws: number; losses: number; goalsFor: number; goalsAgainst: number },
): Promise<ActionState> {
  await requireSession();
  const points = data.wins * 3 + data.draws;
  try {
    await prisma.competitionStanding.upsert({
      where: { competitionId_teamName: { competitionId, teamName } },
      create: { competitionId, teamName, points, ...data },
      update: { points, ...data },
    });
    revalidatePath("/competicion");
    return { success: true };
  } catch {
    return { error: "Error al actualizar la posición." };
  }
}
