"use client";

import { useCurrentFrame, useVideoConfig, Video } from "remotion";
import { Play } from "lucide-react";

type Annotation = {
  id: string;
  timestampSeconds: number;
  note: string;
};

export type RemotionTacticalVideoProps = {
  sourceUrl: string;
  startSeconds?: number | null;
  endSeconds?: number | null;
  annotations: Annotation[];
};

// Duración de la visualización de cada anotación en segundos
const ANNOTATION_DURATION_SECS = 4;

function formatSeconds(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function RemotionTacticalVideo({
  sourceUrl,
  startSeconds = 0,
  endSeconds,
  annotations,
}: RemotionTacticalVideoProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Tiempo transcurrido actual en segundos (relativo al video completo)
  const videoOffset = startSeconds ?? 0;
  const currentVideoTime = videoOffset + frame / fps;

  // Filtrar las anotaciones activas en este segundo
  const activeAnnotations = annotations.filter((ann) => {
    const start = ann.timestampSeconds;
    const end = ann.timestampSeconds + ANNOTATION_DURATION_SECS;
    return currentVideoTime >= start && currentVideoTime < end;
  });

  return (
    <div className="relative h-full w-full overflow-hidden bg-black select-none">
      {/* Elemento de video principal de Remotion */}
      <Video
        src={sourceUrl}
        startFrom={Math.round((startSeconds ?? 0) * fps)}
        endAt={endSeconds ? Math.round(endSeconds * fps) : undefined}
        className="h-full w-full object-contain"
      />

      {/* Overlay de anotaciones tácticas */}
      <div className="absolute inset-x-0 bottom-12 z-20 flex flex-col items-center gap-3 px-6 pointer-events-none">
        {activeAnnotations.map((ann) => {
          // Calcular animación de fade/slide usando frames
          const timeSinceStart = currentVideoTime - ann.timestampSeconds;
          const isEntering = timeSinceStart < 0.3; // primeros 300ms
          const isLeaving = ANNOTATION_DURATION_SECS - timeSinceStart < 0.3; // últimos 300ms

          let opacity = 1;
          let translateY = 0;

          if (isEntering) {
            const progress = timeSinceStart / 0.3;
            opacity = progress;
            translateY = 10 * (1 - progress);
          } else if (isLeaving) {
            const progress = (ANNOTATION_DURATION_SECS - timeSinceStart) / 0.3;
            opacity = progress;
            translateY = -6 * (1 - progress);
          }

          return (
            <div
              key={ann.id}
              style={{
                opacity,
                transform: `translateY(${translateY}px)`,
                transition: "opacity 0.15s ease-out, transform 0.15s ease-out",
              }}
              className="flex max-w-xl items-center gap-3.5 rounded-2xl border border-[#f2c230]/40 bg-[#0f1330]/90 px-4.5 py-3 shadow-[0_12px_30px_rgba(0,0,0,0.5)] backdrop-blur-md"
            >
              {/* Indicador táctico dorado con icono */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f2c230]/10 text-[#f2c230] border border-[#f2c230]/20 animate-pulse">
                <Play size={14} className="fill-[#f2c230] ml-0.5" />
              </div>

              {/* Texto y marca de tiempo */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-widest text-[#f2c230] font-mono uppercase bg-[#f2c230]/15 px-1.5 py-0.5 rounded">
                    MIN {formatSeconds(ann.timestampSeconds)}
                  </span>
                  <span className="text-[10px] font-semibold tracking-wider text-[#8f9bc7] uppercase">
                    Nota táctica
                  </span>
                </div>
                <p className="mt-1 text-xs font-bold leading-normal text-[#eef1fb] break-words text-pretty">
                  {ann.note}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
