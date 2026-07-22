"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { analyzeVideoWithGemini } from "@/lib/ai/videoAnalysis";

export type VideoFormState = { error?: string } | undefined;

export async function createVideoClip(_state: VideoFormState, formData: FormData): Promise<VideoFormState> {
  const session = await requireSession();

  const title = String(formData.get("title") ?? "").trim();
  const sourceUrl = String(formData.get("source_url") ?? "").trim();
  const playerId = String(formData.get("player_id") ?? "").trim() || null;
  const isPublic = formData.get("is_public") === "true";

  if (!title || !sourceUrl) {
    return { error: "Faltan datos: título y link del video son obligatorios." };
  }

  let clipId: string;
  try {
    const clip = await prisma.videoClip.create({
      data: {
        tenantId: session.tenantId,
        title,
        sourceUrl,
        playerId,
        isPublic,
        createdById: session.userId,
      },
    });
    clipId = clip.id;
  } catch {
    return { error: "No se pudo guardar el video. Revisá el link e intentá de nuevo." };
  }

  revalidatePath("/video");
  redirect(`/video/${clipId}`);
}

export type CreateTrimmedClipResult = { success: true; newClipId: string } | { error: string };

// "Editar" en el sentido de recorte (in/out): no se re-codifica el video —
// se crea un nuevo VideoClip que apunta al mismo link con un rango de
// segundos, así se pueden armar jugadas puntuales a partir de un partido
// completo sin necesitar infraestructura de procesamiento de video.
export async function createTrimmedClip(
  parentClipId: string,
  title: string,
  startSeconds: number,
  endSeconds: number,
): Promise<CreateTrimmedClipResult> {
  const session = await requireSession();
  const parent = await prisma.videoClip.findFirst({ where: { id: parentClipId, tenantId: session.tenantId } });
  if (!parent) return { error: "Video original no encontrado." };

  if (!title.trim()) return { error: "Ponele un título al clip recortado." };
  if (endSeconds <= startSeconds) return { error: "El fin tiene que ser mayor al inicio." };

  const newClip = await prisma.videoClip.create({
    data: {
      tenantId: session.tenantId,
      title: title.trim(),
      sourceUrl: parent.sourceUrl,
      startSeconds: Math.max(0, Math.round(startSeconds)),
      endSeconds: Math.round(endSeconds),
      playerId: parent.playerId,
    },
  });

  revalidatePath("/video");
  return { success: true, newClipId: newClip.id };
}

export async function addVideoAnnotation(clipId: string, timestampSeconds: number, note: string) {
  const session = await requireSession();
  const clip = await prisma.videoClip.findFirst({ where: { id: clipId, tenantId: session.tenantId } });
  if (!clip) throw new Error("Video no encontrado.");

  await prisma.videoAnnotation.create({
    data: { clipId, timestampSeconds: Math.max(0, Math.round(timestampSeconds)), note: note.trim() },
  });
  revalidatePath(`/video/${clipId}`);
}

export async function deleteVideoAnnotation(clipId: string, annotationId: string) {
  const session = await requireSession();
  const clip = await prisma.videoClip.findFirst({ where: { id: clipId, tenantId: session.tenantId } });
  if (!clip) throw new Error("Video no encontrado.");

  await prisma.videoAnnotation.delete({ where: { id: annotationId } });
  revalidatePath(`/video/${clipId}`);
}

export type RunVideoAnalysisResult = { success: true } | { error: string };

export async function runVideoAiAnalysis(clipId: string): Promise<RunVideoAnalysisResult> {
  const session = await requireSession();
  const clip = await prisma.videoClip.findFirst({ where: { id: clipId, tenantId: session.tenantId } });
  if (!clip) return { error: "Video no encontrado." };

  try {
    const analysis = await analyzeVideoWithGemini(clip.sourceUrl, {
      startSeconds: clip.startSeconds,
      endSeconds: clip.endSeconds,
    });
    await prisma.videoClip.update({
      where: { id: clipId },
      data: { aiAnalysis: analysis, aiAnalyzedAt: new Date() },
    });
    revalidatePath(`/video/${clipId}`);
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido al analizar el video." };
  }
}

export async function deleteVideoClip(clipId: string) {
  const session = await requireSession();
  const clip = await prisma.videoClip.findFirst({ where: { id: clipId, tenantId: session.tenantId } });
  if (!clip) throw new Error("Video no encontrado.");

  await prisma.videoClip.delete({ where: { id: clipId } });
  revalidatePath("/video");
  redirect("/video");
}
