"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import type { PositionGroup } from "@/generated/prisma/enums";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ActionState = { error?: string; success?: boolean; id?: string } | undefined;

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createSquadPlayer(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession();

  const name = String(formData.get("name") ?? "").trim();
  const positionGroup = String(formData.get("positionGroup") ?? "") as PositionGroup;
  const nationality = String(formData.get("nationality") ?? "").trim() || null;
  const foot = String(formData.get("foot") ?? "").trim() || null;
  const heightCmStr = String(formData.get("heightCm") ?? "").trim();
  const weightKgStr = String(formData.get("weightKg") ?? "").trim();
  const shirtNumberStr = String(formData.get("shirtNumber") ?? "").trim();
  const marketValueStr = String(formData.get("marketValueEur") ?? "").trim();
  const contractExpiryStr = String(formData.get("contractExpiry") ?? "").trim();
  const dateOfBirthStr = String(formData.get("dateOfBirth") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!name || !positionGroup) {
    return { error: "Nombre y posición son obligatorios." };
  }

  const heightCm = heightCmStr ? parseInt(heightCmStr, 10) : null;
  const weightKg = weightKgStr ? parseFloat(weightKgStr) : null;
  const shirtNumber = shirtNumberStr ? parseInt(shirtNumberStr, 10) : null;
  const marketValueEur = marketValueStr ? parseFloat(marketValueStr) : null;
  const contractExpiry = contractExpiryStr ? new Date(contractExpiryStr) : null;
  const dateOfBirth = dateOfBirthStr ? new Date(dateOfBirthStr) : null;

  try {
    // Find or create Trinidense team
    let currentTeamId: string | null = null;
    const trinidenseTeam = await prisma.team.findFirst({
      where: { name: { contains: "Trinidense", mode: "insensitive" } },
    });
    if (trinidenseTeam) {
      currentTeamId = trinidenseTeam.id;
    } else {
      const firstLeague = await prisma.league.findFirst();
      if (firstLeague) {
        const team = await prisma.team.create({
          data: { name: "Sportivo Trinidense", leagueId: firstLeague.id, season: "2026" },
        });
        currentTeamId = team.id;
      }
    }

    // Check for duplicate (same name + positionGroup, not deleted)
    const existing = await prisma.player.findFirst({
      where: { name, positionGroup, deletedAt: null, isSquadPlayer: true },
    });
    if (existing) {
      return { error: `Ya existe un jugador llamado "${name}" en esa posición.` };
    }

    const player = await prisma.player.create({
      data: {
        name,
        nationality,
        positionGroup,
        foot,
        heightCm,
        weightKg,
        shirtNumber,
        marketValueEur: marketValueEur ? marketValueEur : undefined,
        contractExpiry,
        dateOfBirth,
        notes,
        currentTeamId,
        isSquadPlayer: true,
      },
    });

    revalidatePath("/plantel");
    return { success: true, id: player.id };
  } catch {
    return { error: "Error al registrar el jugador en la base de datos." };
  }
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateSquadPlayer(
  id: string,
  data: {
    name?: string;
    positionGroup?: PositionGroup;
    nationality?: string | null;
    foot?: string | null;
    heightCm?: number | null;
    weightKg?: number | null;
    shirtNumber?: number | null;
    marketValueEur?: number | null;
    contractExpiry?: Date | null;
    dateOfBirth?: Date | null;
    notes?: string | null;
  },
): Promise<ActionState> {
  await requireSession();

  if (!id) return { error: "ID de jugador requerido." };

  try {
    await prisma.player.update({
      where: { id },
      data,
    });
    revalidatePath("/plantel");
    return { success: true };
  } catch {
    return { error: "No se pudo actualizar el jugador." };
  }
}

// ─── Soft Delete ──────────────────────────────────────────────────────────────

export async function deleteSquadPlayer(id: string): Promise<ActionState> {
  await requireSession();
  if (!id) return { error: "ID requerido." };

  try {
    await prisma.player.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    revalidatePath("/plantel");
    return { success: true };
  } catch {
    return { error: "No se pudo eliminar el jugador." };
  }
}

// ─── Bulk Delete ──────────────────────────────────────────────────────────────

export async function bulkDeleteSquadPlayers(ids: string[]): Promise<ActionState> {
  await requireSession();
  if (!ids.length) return { error: "Seleccioná al menos un jugador." };

  try {
    await prisma.player.updateMany({
      where: { id: { in: ids } },
      data: { deletedAt: new Date() },
    });
    revalidatePath("/plantel");
    return { success: true };
  } catch {
    return { error: "Error al eliminar jugadores." };
  }
}

// ─── Restore ──────────────────────────────────────────────────────────────────

export async function restoreSquadPlayer(id: string): Promise<ActionState> {
  await requireSession();
  if (!id) return { error: "ID requerido." };

  try {
    await prisma.player.update({
      where: { id },
      data: { deletedAt: null },
    });
    revalidatePath("/plantel");
    return { success: true };
  } catch {
    return { error: "No se pudo restaurar el jugador." };
  }
}

// ─── Bulk Import ─────────────────────────────────────────────────────────────

export type ImportRow = {
  name: string;
  positionGroup: PositionGroup;
  nationality?: string;
  foot?: string;
  heightCm?: number;
  weightKg?: number;
  shirtNumber?: number;
  dateOfBirth?: string;
  contractExpiry?: string;
  marketValueEur?: number;
  notes?: string;
};

export async function bulkImportSquadPlayers(rows: ImportRow[]): Promise<ActionState & { imported?: number; skipped?: number }> {
  await requireSession();

  if (!rows.length) return { error: "No hay datos para importar." };

  let currentTeamId: string | null = null;
  const trinidenseTeam = await prisma.team.findFirst({
    where: { name: { contains: "Trinidense", mode: "insensitive" } },
  });
  if (trinidenseTeam) {
    currentTeamId = trinidenseTeam.id;
  } else {
    const firstLeague = await prisma.league.findFirst();
    if (firstLeague) {
      const team = await prisma.team.create({
        data: { name: "Sportivo Trinidense", leagueId: firstLeague.id, season: "2026" },
      });
      currentTeamId = team.id;
    }
  }

  let imported = 0;
  let skipped = 0;

  for (const row of rows) {
    if (!row.name || !row.positionGroup) { skipped++; continue; }

    const existing = await prisma.player.findFirst({
      where: { name: row.name, positionGroup: row.positionGroup, deletedAt: null },
    });
    if (existing) { skipped++; continue; }

    try {
      await prisma.player.create({
        data: {
          name: row.name,
          positionGroup: row.positionGroup,
          nationality: row.nationality || null,
          foot: row.foot || null,
          heightCm: row.heightCm || null,
          weightKg: row.weightKg || null,
          shirtNumber: row.shirtNumber || null,
          dateOfBirth: row.dateOfBirth ? new Date(row.dateOfBirth) : null,
          contractExpiry: row.contractExpiry ? new Date(row.contractExpiry) : null,
          marketValueEur: row.marketValueEur || null,
          notes: row.notes || null,
          currentTeamId,
          isSquadPlayer: true,
        },
      });
      imported++;
    } catch {
      skipped++;
    }
  }

  revalidatePath("/plantel");
  return { success: true, imported, skipped };
}
