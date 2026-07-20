"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Play, Plus, Scissors, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import { addVideoAnnotation, deleteVideoAnnotation, createTrimmedClip } from "@/app/actions/video";
import { parseVideoUrl } from "@/lib/video/parseVideoUrl";
import { RemotionTacticalVideoProps } from "./RemotionTacticalVideo";

// Cargar el reproductor de Remotion de forma dinámica (solo en el cliente)
// para evitar problemas con la renderización del lado del servidor (SSR) de Next.js.
const Player = dynamic(
  () => import("@remotion/player").then((mod) => mod.Player),
  { ssr: false }
);

type Annotation = { id: string; timestampSeconds: number; note: string };

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function parseTimeInput(value: string): number | null {
  const trimmed = value.trim();
  if (/^\d+$/.test(trimmed)) return Number(trimmed);
  const match = trimmed.match(/^(\d+):(\d{1,2})$/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

const FPS = 30;

export function VideoPlayerPanel({
  clipId,
  sourceUrl,
  startSeconds,
  endSeconds,
  annotations,
}: {
  clipId: string;
  sourceUrl: string;
  startSeconds?: number | null;
  endSeconds?: number | null;
  annotations: Annotation[];
 }) {
  const router = useRouter();
  const [playbackStart, setPlaybackStart] = useState(startSeconds ?? 0);
  const source = parseVideoUrl(sourceUrl, { startSeconds: playbackStart, endSeconds });
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Referencia tipada para el reproductor de Remotion
  const playerRef = useRef<any>(null);

  const [timeInput, setTimeInput] = useState("");
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [trimStart, setTrimStart] = useState("");
  const [trimEnd, setTrimEnd] = useState("");
  const [trimTitle, setTrimTitle] = useState("");
  const [trimError, setTrimError] = useState<string | null>(null);
  const [trimPending, startTrimTransition] = useTransition();

  function handleMarkCurrentMoment() {
    if (source.kind === "direct" && playerRef.current) {
      const currentFrame = playerRef.current.getCurrentFrame();
      const currentSeconds = (startSeconds ?? 0) + currentFrame / FPS;
      setTimeInput(formatTime(Math.floor(currentSeconds)));
    } else if (videoRef.current) {
      setTimeInput(formatTime(Math.floor(videoRef.current.currentTime)));
    }
  }

  function handleAddAnnotation() {
    setError(null);
    const seconds = parseTimeInput(timeInput || "0");
    if (seconds === null) {
      setError("Minuto inválido — usá el formato mm:ss (ej. 12:34) o solo segundos.");
      return;
    }
    if (!note.trim()) {
      setError("Escribí una nota para este momento.");
      return;
    }
    startTransition(async () => {
      await addVideoAnnotation(clipId, seconds, note.trim());
      setNote("");
      setTimeInput("");
    });
  }

  function seekTo(seconds: number) {
    if (source.kind === "direct" && playerRef.current) {
      const targetFrame = Math.max(0, Math.round((seconds - (startSeconds ?? 0)) * FPS));
      playerRef.current.seekTo(targetFrame);
      playerRef.current.play();
    } else if (source.kind === "direct" && videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
    } else {
      setPlaybackStart(seconds);
    }
  }

  function handleSaveTrim() {
    setTrimError(null);
    const start = parseTimeInput(trimStart);
    const end = parseTimeInput(trimEnd);
    if (start === null || end === null) {
      setTrimError("Inicio/fin inválidos — usá el formato mm:ss.");
      return;
    }
    if (!trimTitle.trim()) {
      setTrimError("Ponele un título al clip recortado.");
      return;
    }
    startTrimTransition(async () => {
      const result = await createTrimmedClip(clipId, trimTitle, start, end);
      if ("error" in result) {
        setTrimError(result.error);
      } else {
        router.push(`/video/${result.newClipId}`);
      }
    });
  }

  const sortedAnnotations = [...annotations].sort((a, b) => a.timestampSeconds - b.timestampSeconds);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="grid gap-3">
        <div className="aspect-video overflow-hidden rounded-2xl border border-border bg-black">
          {source.kind === "youtube" ? (
            <iframe
              key={source.embedUrl}
              src={source.embedUrl}
              title="Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full border-0"
            />
          ) : (
            <Player
              ref={playerRef}
              component={require("./RemotionTacticalVideo").RemotionTacticalVideo}
              inputProps={{
                sourceUrl: sourceUrl,
                startSeconds: startSeconds ?? 0,
                endSeconds: endSeconds ?? null,
                annotations: annotations,
              } as RemotionTacticalVideoProps}
              durationInFrames={108000} // 1 hora de límite por defecto a 30 fps
              fps={FPS}
              compositionWidth={1920}
              compositionHeight={1080}
              className="h-full w-full"
              controls
              style={{ width: "100%", height: "100%" }}
            />
          )}
        </div>

        <div className="grid gap-3 rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Agregar nota</p>
          <div className="flex flex-wrap items-end gap-2">
            <div className="grid gap-1">
              <label htmlFor="annotation-time" className="text-xs text-muted">Minuto (mm:ss)</label>
              <div className="flex gap-2">
                <input
                  id="annotation-time"
                  value={timeInput}
                  onChange={(e) => setTimeInput(e.target.value)}
                  placeholder="12:34…"
                  className="w-24 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:ring-2 focus-visible:ring-accent-2 focus:border-accent-2 outline-none transition-colors"
                />
                {source.kind === "direct" && (
                  <button
                    type="button"
                    onClick={handleMarkCurrentMoment}
                    className="whitespace-nowrap rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted hover:text-text focus-visible:ring-2 focus-visible:ring-accent-2 outline-none transition-colors"
                  >
                    Usar momento actual
                  </button>
                )}
              </div>
            </div>
            <div className="grid flex-1 gap-1">
              <label htmlFor="annotation-note" className="text-xs text-muted">Nota</label>
              <input
                id="annotation-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ej: buen desmarque al espacio…"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:ring-2 focus-visible:ring-accent-2 focus:border-accent-2 outline-none transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={handleAddAnnotation}
              disabled={pending}
              className="flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-accent-2 outline-none transition-opacity"
            >
              <Plus size={14} />
              Agregar
            </button>
          </div>
          {error && <p className="text-xs text-negative" aria-live="polite">{error}</p>}
        </div>

        <div className="grid gap-3 rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
            Recortar un tramo como clip nuevo
          </p>
          <p className="text-xs text-muted">
            No se edita el archivo — se guarda una referencia al mismo video con el rango que elijas, para armar
            jugadas puntuales (ej. &ldquo;Gol minuto 34&rdquo;) a partir de un partido completo.
          </p>
          <div className="flex flex-wrap items-end gap-2">
            <div className="grid gap-1">
              <label htmlFor="trim-start" className="text-xs text-muted">Inicio (mm:ss)</label>
              <div className="flex gap-2">
                <input
                  id="trim-start"
                  value={trimStart}
                  onChange={(e) => setTrimStart(e.target.value)}
                  placeholder="34:00…"
                  className="w-24 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:ring-2 focus-visible:ring-accent-2 focus:border-accent-2 outline-none transition-colors"
                />
                {source.kind === "direct" && (
                  <button
                    type="button"
                    onClick={() => {
                      if (playerRef.current) {
                        const currentFrame = playerRef.current.getCurrentFrame();
                        setTrimStart(formatTime(Math.floor((startSeconds ?? 0) + currentFrame / FPS)));
                      }
                    }}
                    className="whitespace-nowrap rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted hover:text-text focus-visible:ring-2 focus-visible:ring-accent-2 outline-none transition-colors"
                  >
                    Usar actual
                  </button>
                )}
              </div>
            </div>
            <div className="grid gap-1">
              <label htmlFor="trim-end" className="text-xs text-muted">Fin (mm:ss)</label>
              <div className="flex gap-2">
                <input
                  id="trim-end"
                  value={trimEnd}
                  onChange={(e) => setTrimEnd(e.target.value)}
                  placeholder="35:30…"
                  className="w-24 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:ring-2 focus-visible:ring-accent-2 focus:border-accent-2 outline-none transition-colors"
                />
                {source.kind === "direct" && (
                  <button
                    type="button"
                    onClick={() => {
                      if (playerRef.current) {
                        const currentFrame = playerRef.current.getCurrentFrame();
                        setTrimEnd(formatTime(Math.floor((startSeconds ?? 0) + currentFrame / FPS)));
                      }
                    }}
                    className="whitespace-nowrap rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted hover:text-text focus-visible:ring-2 focus-visible:ring-accent-2 outline-none transition-colors"
                  >
                    Usar actual
                  </button>
                )}
              </div>
            </div>
            <div className="grid flex-1 gap-1">
              <label htmlFor="trim-title" className="text-xs text-muted">Título del clip nuevo</label>
              <input
                id="trim-title"
                value={trimTitle}
                onChange={(e) => setTrimTitle(e.target.value)}
                placeholder="Ej: Gol minuto 34…"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:ring-2 focus-visible:ring-accent-2 focus:border-accent-2 outline-none transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={handleSaveTrim}
              disabled={trimPending}
              className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-navy-deep hover:opacity-90 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-accent-2 outline-none transition-all"
            >
              <Scissors size={14} />
              {trimPending ? "Guardando…" : "Guardar clip"}
            </button>
          </div>
          {trimError && <p className="text-xs text-negative" aria-live="polite">{trimError}</p>}
        </div>
      </div>

      <div className="grid content-start gap-2 rounded-2xl border border-border bg-card p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
          Momentos marcados ({sortedAnnotations.length})
        </p>
        {sortedAnnotations.length === 0 ? (
          <p className="text-sm text-muted">Todavía no hay notas en este video.</p>
        ) : (
          <ul className="grid gap-2">
            {sortedAnnotations.map((a) => (
              <li key={a.id} className="flex items-start justify-between gap-2 border-b border-border pb-2 text-sm">
                <button
                  type="button"
                  onClick={() => seekTo(a.timestampSeconds)}
                  className="flex flex-1 items-start gap-2 text-left hover:text-accent focus-visible:ring-2 focus-visible:ring-accent-2 outline-none rounded p-0.5 transition-colors"
                >
                  <span className="flex items-center gap-1 rounded bg-accent/20 px-1.5 py-0.5 text-xs font-semibold text-accent">
                    <Play size={10} /> {formatTime(a.timestampSeconds)}
                  </span>
                  <span className="text-text font-medium">{a.note}</span>
                </button>
                <form action={deleteVideoAnnotation.bind(null, clipId, a.id)}>
                  <button
                    type="submit"
                    className="text-muted hover:text-negative focus-visible:ring-2 focus-visible:ring-accent-2 outline-none rounded p-0.5 transition-colors"
                    aria-label={`Eliminar nota del minuto ${formatTime(a.timestampSeconds)}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
