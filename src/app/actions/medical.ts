"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { computeSkinfoldSummary, type SkinfoldSites } from "@/lib/medical/skinfolds";
import type { InjurySeverity } from "@/generated/prisma/enums";

export type CreateInjuryInput = {
  playerId: string;
  diagnosis: string;
  bodyPart: string;
  severity: InjurySeverity;
  occurredAt: string;
  expectedReturnAt?: string;
  notes?: string;
};

export async function createInjury(input: CreateInjuryInput) {
  const session = await requireSession();
  await prisma.injury.create({
    data: {
      tenantId: session.tenantId,
      playerId: input.playerId,
      diagnosis: input.diagnosis,
      bodyPart: input.bodyPart,
      severity: input.severity,
      occurredAt: new Date(input.occurredAt),
      expectedReturnAt: input.expectedReturnAt ? new Date(input.expectedReturnAt) : null,
      notes: input.notes || null,
    },
  });
  revalidatePath(`/medico/${input.playerId}`);
  revalidatePath("/medico");
}

export async function markInjuryRecovered(injuryId: string, playerId: string) {
  const session = await requireSession();
  await prisma.injury.updateMany({
    where: { id: injuryId, tenantId: session.tenantId },
    data: { status: "recovered", actualReturnAt: new Date() },
  });
  revalidatePath(`/medico/${playerId}`);
  revalidatePath("/medico");
}

export async function deleteInjury(injuryId: string, playerId: string) {
  const session = await requireSession();
  await prisma.injury.deleteMany({ where: { id: injuryId, tenantId: session.tenantId } });
  revalidatePath(`/medico/${playerId}`);
  revalidatePath("/medico");
}

export type CreateSkinfoldInput = SkinfoldSites & {
  playerId: string;
  measuredAt: string;
  weightKg?: number;
  heightCm?: number;
  notes?: string;
};

export async function createSkinfoldMeasurement(input: CreateSkinfoldInput) {
  const session = await requireSession();
  const { sumMm, bodyFatPercent } = computeSkinfoldSummary({
    tricepsMm: input.tricepsMm,
    subscapularMm: input.subscapularMm,
    suprailiacMm: input.suprailiacMm,
    abdominalMm: input.abdominalMm,
    thighMm: input.thighMm,
    calfMm: input.calfMm,
  });

  await prisma.skinfoldMeasurement.create({
    data: {
      tenantId: session.tenantId,
      playerId: input.playerId,
      measuredAt: new Date(input.measuredAt),
      weightKg: input.weightKg ?? null,
      heightCm: input.heightCm ?? null,
      tricepsMm: input.tricepsMm ?? null,
      subscapularMm: input.subscapularMm ?? null,
      suprailiacMm: input.suprailiacMm ?? null,
      abdominalMm: input.abdominalMm ?? null,
      thighMm: input.thighMm ?? null,
      calfMm: input.calfMm ?? null,
      sumMm,
      bodyFatPercent,
      notes: input.notes || null,
    },
  });
  revalidatePath(`/medico/${input.playerId}`);
  revalidatePath("/medico");
}

export async function deleteSkinfoldMeasurement(measurementId: string, playerId: string) {
  const session = await requireSession();
  await prisma.skinfoldMeasurement.deleteMany({ where: { id: measurementId, tenantId: session.tenantId } });
  revalidatePath(`/medico/${playerId}`);
  revalidatePath("/medico");
}
