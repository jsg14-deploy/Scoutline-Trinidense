import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { generateScoutVideo, GenerateVideoParams } from "@/lib/video/video-generator";

export async function POST(req: NextRequest) {
  try {
    // 1. Validar la sesión
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    // 2. Parsear el body
    const body = await req.json();
    const { playerName, position, team, photoUrl, statistics, strengths, weaknesses, clips } = body;

    // Validación básica
    if (!playerName || !position || !team || !clips || !Array.isArray(clips) || clips.length === 0) {
      return NextResponse.json(
        { error: "Datos del jugador o clips de video insuficientes." },
        { status: 400 }
      );
    }

    const params: GenerateVideoParams = {
      playerName,
      position,
      team,
      photoUrl: photoUrl || "",
      statistics: statistics || [],
      strengths: strengths || [],
      weaknesses: weaknesses || [],
      clips: clips.map((c: any) => ({
        sourceUrl: c.sourceUrl,
        startSeconds: Number(c.startSeconds),
        endSeconds: Number(c.endSeconds),
        annotation: c.annotation || "",
      })),
    };

    console.log(`[API Video] Iniciando renderizado doble para ${playerName}`);

    // Generar video horizontal 16:9
    const horizontalResult = await generateScoutVideo(params, "16:9");

    // Generar reel vertical 9:16
    const verticalResult = await generateScoutVideo(params, "9:16");

    return NextResponse.json({
      success: true,
      horizontalUrl: horizontalResult.videoUrl,
      verticalUrl: verticalResult.videoUrl,
    });
  } catch (err: any) {
    console.error("[API Video] Error generando los videos:", err);
    return NextResponse.json(
      { error: err.message || "Error interno generando los videos." },
      { status: 500 }
    );
  }
}
