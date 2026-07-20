import "server-only";
import { prisma } from "@/lib/db/prisma";

export type SalaryUploadMeta = { tenantId: string; season: string };

function toAmount(value: string | undefined): number | null {
  if (value === undefined) return null;
  const trimmed = value.trim();
  if (trimmed === "" || trimmed === "-") return null;
  // Salarios en planillas hispanas suelen venir con puntos de miles
  // ("3.500.000") o coma decimal — sacamos separadores de miles y
  // normalizamos coma a punto antes de parsear.
  const normalized = trimmed.replace(/\./g, "").replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

export async function ingestSalaryReport(rows: Record<string, string>[], meta: SalaryUploadMeta) {
  let matched = 0;
  const unmatched: string[] = [];
  const ambiguous: string[] = [];

  for (const row of rows) {
    const playerName = row.player_name?.trim();
    const monthlySalary = toAmount(row.monthly_salary);
    if (!playerName || monthlySalary === null) continue;

    const currency = row.currency?.trim().toUpperCase() || "USD";

    const candidates = await prisma.player.findMany({
      where: { name: { equals: playerName, mode: "insensitive" } },
      select: { id: true },
    });

    if (candidates.length === 0) {
      unmatched.push(playerName);
      continue;
    }
    if (candidates.length > 1) {
      ambiguous.push(playerName);
      continue;
    }

    const player = candidates[0];
    await prisma.playerSalary.upsert({
      where: { tenantId_playerId_season: { tenantId: meta.tenantId, playerId: player.id, season: meta.season } },
      update: { monthlySalary, currency },
      create: { tenantId: meta.tenantId, playerId: player.id, season: meta.season, monthlySalary, currency },
    });
    matched += 1;
  }

  return { matched, unmatched, ambiguous };
}
