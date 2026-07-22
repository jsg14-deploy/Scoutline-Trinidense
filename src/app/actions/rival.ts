"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { askProvider } from "@/lib/ai/providers";

export type RivalFormState = { error?: string; success?: boolean } | undefined;

export async function createOpponentAnalysis(
  _state: RivalFormState,
  formData: FormData,
): Promise<RivalFormState> {
  const session = await requireSession();

  const rivalName = String(formData.get("rivalName") ?? "").trim();
  const startingXI = String(formData.get("startingXI") ?? "").trim();
  const squad = String(formData.get("squad") ?? "").trim();
  const substitutions = String(formData.get("substitutions") ?? "").trim();
  const minutesPlayed = String(formData.get("minutesPlayed") ?? "").trim();
  const videoUrl = String(formData.get("videoUrl") ?? "").trim() || null;
  const isPublic = formData.get("is_public") === "true";

  if (!rivalName) {
    return { error: "El nombre del rival es obligatorio." };
  }

  try {
    await prisma.opponentAnalysis.create({
      data: {
        tenantId: session.tenantId,
        rivalName,
        startingXI,
        squad,
        substitutions,
        minutesPlayed,
        videoUrl,
        isPublic,
        createdById: session.userId,
      },
    });

    revalidatePath("/rival");
    return { success: true };
  } catch (err) {
    return { error: "Error al guardar el análisis del rival." };
  }
}

export async function deleteOpponentAnalysis(id: string) {
  const session = await requireSession();
  await prisma.opponentAnalysis.deleteMany({
    where: { id, tenantId: session.tenantId },
  });
  revalidatePath("/rival");
}

export async function runOpponentAiAnalysis(id: string) {
  const session = await requireSession();

  const analysis = await prisma.opponentAnalysis.findFirst({
    where: { id, tenantId: session.tenantId },
  });
  if (!analysis) return { error: "Análisis no encontrado." };

  const systemPrompt = `Sos el analista táctico principal de "Scoutline Trinidense", una plataforma de scouting de fútbol profesional.
Tu trabajo es analizar la información táctica cargada de un equipo rival y proporcionar un reporte táctico con la IA.
El reporte debe incluir:
1. Análisis de la alineación y dibujo táctico probable (Starting XI).
2. Fortalezas y debilidades a partir de los jugadores convocados (Squad) y sus cambios habituales.
3. Observaciones basadas en los minutos jugados y fatiga potencial del rival.
4. Recomendación sobre qué presionar o cómo neutralizar su planteamiento táctico.

Responde de forma concisa, en español, en formato markdown limpio e instructivo para el cuerpo técnico de Trinidense.`;

  const userMessage = `Rival: ${analysis.rivalName}
Formación inicial (XI): ${analysis.startingXI}
Convocados / Plantel: ${analysis.squad}
Cambios: ${analysis.substitutions}
Minutos jugados de jugadores: ${analysis.minutesPlayed}
Video de referencia: ${analysis.videoUrl ?? "No provisto"}`;

  try {
    const aiText = await askProvider("gemini", systemPrompt, [{ role: "user", content: userMessage }]);
    await prisma.opponentAnalysis.update({
      where: { id },
      data: { aiAnalysis: aiText },
    });
    revalidatePath("/rival");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error al procesar el análisis de IA." };
  }
}
