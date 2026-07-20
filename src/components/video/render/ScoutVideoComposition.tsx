"use client";

import {
  AbsoluteFill,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Video,
  interpolate,
} from "remotion";
import { Shield, Play } from "lucide-react";

export type ScoutVideoClip = {
  src: string; // URL o path al clip ya recortado por FFmpeg
  durationInFrames: number; // duración en frames calculada en el servidor
  annotation?: string; // subtítulo/nota para este momento
};

export type ScoutVideoProps = {
  playerName: string;
  position: string;
  team: string;
  photoUrl: string;
  statistics: { label: string; value: string; percent: number }[];
  strengths: string[];
  weaknesses: string[];
  clips: ScoutVideoClip[];
  aspectRatio: "16:9" | "9:16";
};

// Duraciones fijas en frames (a 30 fps)
const INTRO_FRAMES = 90; // 3s
const METRICS_FRAMES = 150; // 5s
const CONCLUSION_FRAMES = 150; // 5s
const OUTRO_FRAMES = 60; // 2s

export function ScoutVideoComposition({
  playerName,
  position,
  team,
  photoUrl,
  statistics,
  strengths,
  weaknesses,
  clips,
  aspectRatio,
}: ScoutVideoProps) {
  const { fps } = useVideoConfig();

  // Calcular la duración de los clips de partido
  const clipsFrames = clips.reduce((acc, c) => acc + c.durationInFrames, 0);

  // Timestamps de inicio de cada secuencia
  const introStart = 0;
  const metricsStart = INTRO_FRAMES;
  const clipsStart = metricsStart + METRICS_FRAMES;
  const conclusionStart = clipsStart + clipsFrames;
  const outroStart = conclusionStart + CONCLUSION_FRAMES;

  const isVertical = aspectRatio === "9:16";

  return (
    <AbsoluteFill className="bg-[#090c1f] text-[#eef1fb] font-sans antialiased overflow-hidden">
      {/* 1. INTRO: Presentación del jugador */}
      <Sequence from={introStart} durationInFrames={INTRO_FRAMES}>
        <IntroSequence
          playerName={playerName}
          position={position}
          team={team}
          photoUrl={photoUrl}
          isVertical={isVertical}
          fps={fps}
        />
      </Sequence>

      {/* 2. METRICS: Estadísticas animadas */}
      <Sequence from={metricsStart} durationInFrames={METRICS_FRAMES}>
        <MetricsSequence
          statistics={statistics}
          isVertical={isVertical}
          fps={fps}
        />
      </Sequence>

      {/* 3. MATCH CLIPS: Los clips de video con subtítulos */}
      <Sequence from={clipsStart} durationInFrames={clipsFrames}>
        <ClipsSequence
          clips={clips}
          isVertical={isVertical}
          fps={fps}
        />
      </Sequence>

      {/* 4. CONCLUSION: Fortalezas y aspectos a mejorar */}
      <Sequence from={conclusionStart} durationInFrames={CONCLUSION_FRAMES}>
        <ConclusionSequence
          strengths={strengths}
          weaknesses={weaknesses}
          isVertical={isVertical}
          fps={fps}
        />
      </Sequence>

      {/* 5. OUTRO: Cierre del club */}
      <Sequence from={outroStart} durationInFrames={OUTRO_FRAMES}>
        <OutroSequence isVertical={isVertical} fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
}

/* ============================================================================
   SUB-COMPONENTES DE LAS SECUENCIAS
   ============================================================================ */

// --- 1. INTRO SEQUENCE ---
function IntroSequence({
  playerName,
  position,
  team,
  photoUrl,
  isVertical,
  fps,
}: {
  playerName: string;
  position: string;
  team: string;
  photoUrl: string;
  isVertical: boolean;
  fps: number;
}) {
  const frame = useCurrentFrame();

  // Animaciones usando resortes (springs)
  const scale = spring({ frame, fps, config: { damping: 12 } });
  const textX = spring({ frame: frame - 15, fps, config: { damping: 15 } });
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  const containerClass = isVertical
    ? "flex flex-col items-center justify-center text-center p-8 gap-8"
    : "flex flex-row items-center justify-center gap-12 p-12";

  return (
    <AbsoluteFill className="flex items-center justify-center bg-gradient-to-br from-[#090c1f] to-[#04060f]">
      <div className={containerClass} style={{ opacity }}>
        {/* Foto del jugador */}
        <div
          style={{ transform: `scale(${scale})` }}
          className="relative h-48 w-48 shrink-0 rounded-full border-4 border-[#f2c230] overflow-hidden bg-black shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
        >
          {photoUrl ? (
            <img src={photoUrl} alt={playerName} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-[#141a3d] flex items-center justify-center">
              <span className="text-[#f2c230] font-black text-6xl">?</span>
            </div>
          )}
        </div>

        {/* Textos */}
        <div
          style={{
            transform: isVertical ? `translateY(${(1 - textX) * 20}px)` : `translateX(${(1 - textX) * 30}px)`,
          }}
          className="flex flex-col max-w-lg"
        >
          <span className="text-xs font-black uppercase tracking-widest text-[#f2c230]">
            INFORME DE SCOUTING
          </span>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl font-black italic text-white uppercase tracking-tight leading-none">
            {playerName}
          </h1>
          <span className="mt-2 text-sm font-semibold uppercase tracking-wider text-[#8f9bc7] bg-[#141a3d] px-3 py-1 rounded-xl self-start mx-auto lg:mx-0">
            {position}
          </span>
          <p className="mt-4 text-xs font-mono tracking-wider text-[#8f9bc7] uppercase">
            {team}
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
}

// --- 2. METRICS SEQUENCE ---
function MetricsSequence({
  statistics,
  isVertical,
  fps,
}: {
  statistics: { label: string; value: string; percent: number }[];
  isVertical: boolean;
  fps: number;
}) {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill className="flex flex-col justify-center p-12 bg-gradient-to-br from-[#090c1f] to-[#04060f]">
      <div className="mx-auto w-full max-w-2xl">
        <h2 className="mb-8 font-display text-2xl font-black italic text-[#f2c230] uppercase border-b border-[#232a54] pb-2">
          RENDIMIENTO Y MÉTRICAS
        </h2>

        <div className="grid gap-6">
          {statistics.map((stat, idx) => {
            // Animación escalonada para cada barra
            const delay = idx * 10;
            const progress = spring({
              frame: frame - delay,
              fps,
              config: { damping: 15, stiffness: 80 },
            });

            // Valor actual a renderizar
            const currentPercent = interpolate(progress, [0, 1], [0, stat.percent], {
              extrapolateRight: "clamp",
            });

            return (
              <div key={stat.label} className="grid grid-cols-[1fr_80px] items-center gap-4">
                <div className="grid gap-1.5">
                  <span className="text-xs font-bold text-[#8f9bc7] uppercase">{stat.label}</span>
                  <div className="w-full h-3 bg-[#141a3d] border border-[#232a54] rounded-lg overflow-hidden">
                    <div
                      style={{ width: `${currentPercent}%` }}
                      className="h-full bg-gradient-to-r from-[#f2c230] to-[#f7d35c] rounded-lg"
                    />
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-lg font-black text-white">{stat.value}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
}

// --- 3. CLIPS SEQUENCE ---
function ClipsSequence({
  clips,
  isVertical,
  fps,
}: {
  clips: ScoutVideoClip[];
  isVertical: boolean;
  fps: number;
}) {
  let accumulatedFrames = 0;

  return (
    <AbsoluteFill className="bg-black">
      {clips.map((clip, idx) => {
        const startFrame = accumulatedFrames;
        const duration = clip.durationInFrames;
        accumulatedFrames += duration;

        return (
          <Sequence key={idx} from={startFrame} durationInFrames={duration}>
            <SingleClipPlayer clip={clip} isVertical={isVertical} fps={fps} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}

function SingleClipPlayer({
  clip,
  isVertical,
  fps,
}: {
  clip: ScoutVideoClip;
  isVertical: boolean;
  fps: number;
}) {
  const frame = useCurrentFrame();

  // Animación del subtítulo (fade-in)
  const opacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill className="flex items-center justify-center bg-black">
      {/* Video de fondo */}
      <Video src={clip.src} className="h-full w-full object-contain" />

      {/* Subtítulos tácticos overlay */}
      {clip.annotation && (
        <div
          style={{ opacity }}
          className="absolute inset-x-0 bottom-16 z-20 flex justify-center px-8 pointer-events-none"
        >
          <div className="max-w-xl rounded-xl border border-[#f2c230]/40 bg-[#0f1330]/90 px-5 py-3 shadow-[0_12px_30px_rgba(0,0,0,0.5)] backdrop-blur-md text-center">
            <span className="block text-[9px] font-bold tracking-widest text-[#f2c230] font-mono uppercase mb-0.5">
              Análisis Táctico
            </span>
            <p className="text-xs font-bold leading-normal text-white break-words text-pretty">
              {clip.annotation}
            </p>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
}

// --- 4. CONCLUSION SEQUENCE ---
function ConclusionSequence({
  strengths,
  weaknesses,
  isVertical,
  fps,
}: {
  strengths: string[];
  weaknesses: string[];
  isVertical: boolean;
  fps: number;
}) {
  const frame = useCurrentFrame();

  const layoutClass = isVertical ? "grid gap-8" : "grid grid-cols-2 gap-10";

  return (
    <AbsoluteFill className="flex flex-col justify-center p-12 bg-gradient-to-br from-[#090c1f] to-[#04060f]">
      <div className="mx-auto w-full max-w-3xl">
        <h2 className="mb-8 font-display text-2xl font-black italic text-[#f2c230] uppercase border-b border-[#232a54] pb-2">
          CONCLUSIÓN DEL SCOUT
        </h2>

        <div className={layoutClass}>
          {/* Fortalezas */}
          <div className="grid content-start gap-3">
            <h3 className="text-sm font-black tracking-widest text-[#34d399] uppercase mb-1">
              • FORTALEZAS
            </h3>
            {strengths.map((str, idx) => {
              const delay = idx * 10;
              const x = spring({ frame: frame - delay, fps, config: { damping: 15 } });

              return (
                <div
                  key={str}
                  style={{
                    transform: `translateX(${(1 - x) * -15}px)`,
                    opacity: x,
                  }}
                  className="rounded-xl border border-[#34d399]/15 bg-[#141a3d]/40 px-3.5 py-2.5 text-xs text-[#eef1fb]"
                >
                  {str}
                </div>
              );
            })}
          </div>

          {/* Aspectos a mejorar */}
          <div className="grid content-start gap-3">
            <h3 className="text-sm font-black tracking-widest text-[#f2c230] uppercase mb-1">
              • ASPECTOS A MEJORAR
            </h3>
            {weaknesses.map((weak, idx) => {
              const delay = (idx + strengths.length) * 10;
              const x = spring({ frame: frame - delay, fps, config: { damping: 15 } });

              return (
                <div
                  key={weak}
                  style={{
                    transform: `translateX(${(1 - x) * 15}px)`,
                    opacity: x,
                  }}
                  className="rounded-xl border border-[#f2c230]/15 bg-[#141a3d]/40 px-3.5 py-2.5 text-xs text-[#eef1fb]"
                >
                  {weak}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

// --- 5. OUTRO SEQUENCE ---
function OutroSequence({ isVertical, fps }: { isVertical: boolean; fps: number }) {
  const frame = useCurrentFrame();

  const scale = spring({ frame, fps, config: { damping: 15, stiffness: 80 } });
  const opacity = interpolate(frame, [40, 59], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill
      style={{ opacity }}
      className="flex flex-col items-center justify-center bg-gradient-to-br from-[#090c1f] to-[#04060f]"
    >
      <div style={{ transform: `scale(${scale})` }} className="flex flex-col items-center gap-3.5">
        {/* Escudo del club (Usamos el logotipo de Trinidense) */}
        <div className="h-16 w-16 rounded-xl border border-[#f2c230]/20 bg-[#0f1330] p-1 flex items-center justify-center shadow-lg">
          <Shield size={40} className="text-[#f2c230] fill-[#f2c230]/5" />
        </div>
        <div className="text-center">
          <span className="font-display text-sm font-black tracking-wider text-[#f2c230] uppercase italic">
            SPORTIVO TRINIDENSE
          </span>
          <p className="text-[9px] font-bold text-[#8f9bc7] tracking-widest uppercase mt-1">
            Scoutline Analytica
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
}
