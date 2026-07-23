"use server";

import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

export async function createLegalContract(data: {
  title: string;
  type: string;
  startDate: string;
  endDate: string;
  clauses?: string;
  documentUrl?: string;
  playerId?: string;
}) {
  const session = await requireSession();
  
  await prisma.legalContract.create({
    data: {
      tenantId: session.tenantId,
      title: data.title,
      type: data.type,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      clauses: data.clauses,
      documentUrl: data.documentUrl,
      playerId: data.playerId || null,
      createdById: session.userId,
    },
  });

  revalidatePath("/legal");
  return { success: true };
}

export async function deleteLegalContract(id: string) {
  const session = await requireSession();
  
  await prisma.legalContract.delete({
    where: { id, tenantId: session.tenantId },
  });

  revalidatePath("/legal");
  return { success: true };
}
