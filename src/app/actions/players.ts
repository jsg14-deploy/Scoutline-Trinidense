"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import type { PositionGroup } from "@/generated/prisma/enums";

export type CreatePlayerState = { error?: string; success?: boolean } | undefined;

export async function createPlayerManual(
  _state: CreatePlayerState,
  formData: FormData,
): Promise<CreatePlayerState> {
  const session = await requireSession();

  const name = String(formData.get("name") ?? "").trim();
  const nationality = String(formData.get("nationality") ?? "").trim() || null;
  const positionGroup = String(formData.get("positionGroup") ?? "") as PositionGroup;
  const foot = String(formData.get("foot") ?? "").trim() || null;
  const heightCmStr = String(formData.get("heightCm") ?? "").trim();

  if (!name || !positionGroup) {
    return { error: "Nombre y posición son obligatorios." };
  }

  const heightCm = heightCmStr ? parseInt(heightCmStr, 10) : null;

  try {
    // Intentamos buscar un equipo de Trinidense
    const trinidenseTeam = await prisma.team.findFirst({
      where: { name: { contains: "Trinidense", mode: "insensitive" } },
    });

    let currentTeamId: string | null = trinidenseTeam?.id ?? null;

    // Si no hay equipo, pero hay alguna liga en la DB, creamos un equipo para Trinidense
    if (!currentTeamId) {
      const firstLeague = await prisma.league.findFirst();
      if (firstLeague) {
        const team = await prisma.team.create({
          data: {
            name: "Sportivo Trinidense",
            leagueId: firstLeague.id,
            season: "2026",
          },
        });
        currentTeamId = team.id;
      }
    }

    await prisma.player.create({
      data: {
        name,
        nationality,
        positionGroup,
        foot,
        heightCm,
        currentTeamId,
      },
    });

    revalidatePath("/plantel");
    return { success: true };
  } catch (err) {
    return { error: "Error al registrar el jugador en la base de datos." };
  }
}
