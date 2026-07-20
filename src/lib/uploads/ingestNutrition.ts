import "server-only";
import { prisma } from "@/lib/db/prisma";

export type NutritionUploadMeta = { tenantId: string };

function toFloat(value: string | undefined): number | null {
  if (value === undefined) return null;
  const trimmed = value.trim();
  if (trimmed === "" || trimmed === "-") return null;
  const n = Number(trimmed.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export async function ingestNutritionReport(rows: Record<string, string>[], meta: NutritionUploadMeta) {
  let matched = 0;
  const unmatched: string[] = [];

  for (const row of rows) {
    const playerName = row.player_name?.trim();
    const measuredAtStr = row.measured_at?.trim();
    if (!playerName || !measuredAtStr) continue;

    const measuredAt = new Date(measuredAtStr);
    if (isNaN(measuredAt.getTime())) continue;

    const candidates = await prisma.player.findMany({
      where: { name: { equals: playerName, mode: "insensitive" } },
      select: { id: true },
    });

    if (candidates.length === 0) {
      unmatched.push(playerName);
      continue;
    }

    const player = candidates[0];

    const weightKg = toFloat(row.weight_kg);
    const heightCm = toFloat(row.height_cm);
    const tricepsMm = toFloat(row.triceps_mm) ?? 0;
    const subscapularMm = toFloat(row.subscapular_mm) ?? 0;
    const suprailiacMm = toFloat(row.suprailiac_mm) ?? 0;
    const abdominalMm = toFloat(row.abdominal_mm) ?? 0;
    const thighMm = toFloat(row.thigh_mm) ?? 0;
    const calfMm = toFloat(row.calf_mm) ?? 0;

    const sumMm = tricepsMm + subscapularMm + suprailiacMm + abdominalMm + thighMm + calfMm;
    // Fórmula de Yuhasz para hombres deportistas: 0.1051 * sumOf6 + 2.585
    const bodyFatPercent = sumMm > 0 ? 0.1051 * sumMm + 2.585 : null;

    await prisma.skinfoldMeasurement.create({
      data: {
        tenantId: meta.tenantId,
        playerId: player.id,
        measuredAt,
        weightKg,
        heightCm,
        tricepsMm: toFloat(row.triceps_mm),
        subscapularMm: toFloat(row.subscapular_mm),
        suprailiacMm: toFloat(row.suprailiac_mm),
        abdominalMm: toFloat(row.abdominal_mm),
        thighMm: toFloat(row.thigh_mm),
        calfMm: toFloat(row.calf_mm),
        sumMm,
        bodyFatPercent,
        notes: row.notes?.trim() || null,
      },
    });

    matched += 1;
  }

  return { matched, unmatched };
}
