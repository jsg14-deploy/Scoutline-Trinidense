import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { InjurySeverity, InjuryStatus } from "@/generated/prisma/enums";

export type MedicalUploadMeta = { tenantId: string };

function parseSeverity(val: string | undefined): InjurySeverity {
  const norm = String(val ?? "").toLowerCase().trim();
  if (norm.includes("mild") || norm.includes("leve")) return "mild";
  if (norm.includes("severe") || norm.includes("grave")) return "severe";
  return "moderate";
}

function parseStatus(val: string | undefined): InjuryStatus {
  const norm = String(val ?? "").toLowerCase().trim();
  if (norm.includes("recover") || norm.includes("recupe")) return "recovering";
  if (norm.includes("recovered") || norm.includes("alta") || norm.includes("recuperado")) return "recovered";
  return "active";
}

export async function ingestMedicalReport(rows: Record<string, string>[], meta: MedicalUploadMeta) {
  let matched = 0;
  const unmatched: string[] = [];

  for (const row of rows) {
    const playerName = row.player_name?.trim();
    const diagnosis = row.diagnosis?.trim();
    const bodyPart = row.body_part?.trim();
    const occurredAtStr = row.occurred_at?.trim();

    if (!playerName || !diagnosis || !bodyPart || !occurredAtStr) continue;

    const occurredAt = new Date(occurredAtStr);
    if (isNaN(occurredAt.getTime())) continue;

    const candidates = await prisma.player.findMany({
      where: { name: { equals: playerName, mode: "insensitive" } },
      select: { id: true },
    });

    if (candidates.length === 0) {
      unmatched.push(playerName);
      continue;
    }

    const player = candidates[0];

    const expectedReturnAtStr = row.expected_return_at?.trim();
    const expectedReturnAt = expectedReturnAtStr ? new Date(expectedReturnAtStr) : null;

    const actualReturnAtStr = row.actual_return_at?.trim();
    const actualReturnAt = actualReturnAtStr ? new Date(actualReturnAtStr) : null;

    await prisma.injury.create({
      data: {
        tenantId: meta.tenantId,
        playerId: player.id,
        diagnosis,
        bodyPart,
        severity: parseSeverity(row.severity),
        status: parseStatus(row.status),
        occurredAt,
        expectedReturnAt: expectedReturnAt && !isNaN(expectedReturnAt.getTime()) ? expectedReturnAt : null,
        actualReturnAt: actualReturnAt && !isNaN(actualReturnAt.getTime()) ? actualReturnAt : null,
        notes: row.notes?.trim() || null,
      },
    });

    matched += 1;
  }

  return { matched, unmatched };
}
