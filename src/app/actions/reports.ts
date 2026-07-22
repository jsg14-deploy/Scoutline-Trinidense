"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function uploadPdfReport(
  playerId: string,
  title: string,
  base64Data: string,
  isPublic: boolean,
) {
  const session = await requireSession();

  if (!playerId || !title || !base64Data) {
    throw new Error("Datos de reporte inválidos.");
  }

  await prisma.report.create({
    data: {
      tenantId: session.tenantId,
      title,
      kind: "uploaded_pdf",
      pdfBase64: base64Data,
      paramsJson: { playerId },
      isPublic,
      createdById: session.userId,
    },
  });

  revalidatePath("/reports");
}

export async function deleteReport(reportId: string) {
  const session = await requireSession();
  await prisma.report.deleteMany({
    where: { id: reportId, tenantId: session.tenantId },
  });
  revalidatePath("/reports");
}
