"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function addToWatchlist(playerId: string, notes?: string) {
  const session = await requireSession();
  await prisma.watchlistEntry.upsert({
    where: { tenantId_playerId: { tenantId: session.tenantId, playerId } },
    update: { notes },
    create: { tenantId: session.tenantId, playerId, notes },
  });
  revalidatePath("/dashboard");
  revalidatePath(`/players/${playerId}`);
}

export async function removeFromWatchlist(playerId: string) {
  const session = await requireSession();
  await prisma.watchlistEntry.deleteMany({ where: { tenantId: session.tenantId, playerId } });
  revalidatePath("/dashboard");
  revalidatePath(`/players/${playerId}`);
}
