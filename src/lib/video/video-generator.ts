import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

export type InputClip = {
  sourceUrl: string;
  startSeconds: number;
  endSeconds: number;
  annotation?: string;
};

export type GenerateVideoParams = {
  playerName: string;
  position: string;
  team: string;
  photoUrl: string;
  statistics: { label: string; value: string; percent: number }[];
  strengths: string[];
  weaknesses: string[];
  clips: InputClip[];
};

// Formato de marcas de tiempo hh:mm:ss.ms
function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(ms).padStart(3, "0")}`;
}

export async function generateScoutVideo(
  params: GenerateVideoParams,
  aspectRatio: "16:9" | "9:16"
): Promise<{ videoUrl: string }> {
  // Asegurar directorios
  const tempDir = path.resolve("./public/temp");
  const exportsDir = path.resolve("./public/exports");
  fs.mkdirSync(tempDir, { recursive: true });
  fs.mkdirSync(exportsDir, { recursive: true });

  const isVertical = aspectRatio === "9:16";
  const compositionId = isVertical ? "scout-video-vertical" : "scout-video-horizontal";
  const videoId = `${params.playerName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}-${isVertical ? "vertical" : "horizontal"}`;
  const finalOutputFilename = `${videoId}.mp4`;
  const finalOutputPath = path.join(exportsDir, finalOutputFilename);

  console.log(`[Video Generator] Iniciando procesamiento para ${params.playerName} (${aspectRatio})`);

  // 1. Recortar y comprimir los clips con FFmpeg
  const processedClips: { src: string; durationInFrames: number; annotation?: string }[] = [];
  const tempFilesToDelete: string[] = [];

  for (let idx = 0; idx < params.clips.length; idx++) {
    const clip = params.clips[idx];
    const clipDuration = clip.endSeconds - clip.startSeconds;
    const clipFrames = Math.round(clipDuration * 30); // 30 fps

    const tempFilename = `${videoId}-clip-${idx}.mp4`;
    const tempFilePath = path.join(tempDir, tempFilename);

    console.log(`[FFmpeg] Recortando clip ${idx + 1}/${params.clips.length} desde ${clip.startSeconds}s hasta ${clip.endSeconds}s`);

    const startStr = formatTime(clip.startSeconds);
    
    // Comando FFmpeg usando npx remotion ffmpeg (que tiene los binarios garantizados)
    // -y sobrescribe el archivo si ya existe.
    // -t es la duración del recorte.
    // -c:v libx264 -c:a aac re-codifica el video para que el inicio de cuadro clave esté alineado
    const ffmpegCmd = `npx remotion ffmpeg -y -ss ${startStr} -i "${clip.sourceUrl}" -t ${clipDuration} -c:v libx264 -c:a aac -profile:v high -level 4.1 -pix_fmt yuv420p "${tempFilePath}"`;

    try {
      execSync(ffmpegCmd, { stdio: "ignore" });
      processedClips.push({
        // La URL pública para que Remotion la acceda localmente
        src: `http://localhost:3000/temp/${tempFilename}`,
        durationInFrames: clipFrames,
        annotation: clip.annotation,
      });
      tempFilesToDelete.push(tempFilePath);
    } catch (err) {
      console.error(`[FFmpeg] Error procesando el clip ${idx + 1}:`, err);
      throw new Error(`Error de procesamiento en el clip de partido ${idx + 1}.`);
    }
  }

  // Duración total de la composición en frames: Intro (90) + Metrics (150) + Clips + Conclusion (150) + Outro (60)
  const clipsFrames = processedClips.reduce((acc, c) => acc + c.durationInFrames, 0);
  const totalFrames = 90 + 150 + clipsFrames + 150 + 60;

  // 2. Empaquetar y renderizar con Remotion Renderer
  const entryPoint = path.resolve("./src/components/video/render/ScoutVideoCompositionEntry.tsx");
  console.log(`[Remotion] Empaquetando composición en ${entryPoint}`);
  
  let bundleLocation: string;
  try {
    bundleLocation = await bundle({
      entryPoint,
      // Desactivamos la optimización webpack excesiva para acelerar la compilación del render
      webpackOverride: (config) => config,
    });
  } catch (err) {
    console.error(`[Remotion] Error empaquetando el bundle:`, err);
    throw new Error("Error interno empaquetando las plantillas de video.");
  }

  console.log(`[Remotion] Buscando composición ${compositionId}`);
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: compositionId,
    inputProps: {
      playerName: params.playerName,
      position: params.position,
      team: params.team,
      photoUrl: params.photoUrl,
      statistics: params.statistics,
      strengths: params.strengths,
      weaknesses: params.weaknesses,
      clips: processedClips,
      aspectRatio,
    },
  });

  // Ajustar la duración exacta de la composición
  composition.durationInFrames = totalFrames;

  console.log(`[Remotion] Renderizando video de ${totalFrames} frames (${Math.round(totalFrames/30)} segundos) a 1080p`);

  try {
    await renderMedia({
      composition,
      codec: "h264",
      serveUrl: bundleLocation,
      outputLocation: finalOutputPath,
      inputProps: {
        playerName: params.playerName,
        position: params.position,
        team: params.team,
        photoUrl: params.photoUrl,
        statistics: params.statistics,
        strengths: params.strengths,
        weaknesses: params.weaknesses,
        clips: processedClips,
        aspectRatio,
      },
    });
    console.log(`[Remotion] Renderizado exitoso: ${finalOutputPath}`);
  } catch (err) {
    console.error(`[Remotion] Error durante el renderizado:`, err);
    throw new Error("El motor de Remotion falló al renderizar el video.");
  } finally {
    // 3. Eliminar archivos temporales de clips recortados para ahorrar espacio
    console.log(`[Limpieza] Eliminando ${tempFilesToDelete.length} clips temporales`);
    for (const filePath of tempFilesToDelete) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.warn(`[Limpieza] No se pudo borrar ${filePath}:`, e);
      }
    }
  }

  return {
    videoUrl: `/exports/${finalOutputFilename}`,
  };
}
