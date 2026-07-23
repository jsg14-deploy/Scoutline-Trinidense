"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Folder, Link as LinkIcon, Check } from "lucide-react";
import { createVideoClip } from "@/app/actions/video";
import { VisibilitySelector } from "@/components/ui/VisibilitySelector";

type PlayerOption = { id: string; name: string; positionGroup: string };

export function VideoClipForm({ players }: { players: PlayerOption[] }) {
  const [videoType, setVideoType] = useState<"remote" | "local">("remote");
  const [isPublic, setIsPublic] = useState(true);
  const [localFiles, setLocalFiles] = useState<File[]>([]);
  const [selectedLocalFile, setSelectedLocalFile] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState(false);

  const [state, formAction, pending] = useActionState(createVideoClip, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state === undefined && !pending) {
      formRef.current?.reset();
      setTimeout(() => {
        setSelectedLocalFile("");
        setIsPublic(true);
      }, 0);
    }
  }, [state, pending]);

  function handleFolderFiles(files: File[]) {
    const videoFiles = files.filter(
      (f) =>
        f.name.endsWith(".mp4") ||
        f.name.endsWith(".mov") ||
        f.name.endsWith(".avi") ||
        f.name.endsWith(".mkv")
    );
    setLocalFiles(videoFiles);
    if (videoFiles.length > 0) {
      setSelectedLocalFile(videoFiles[0].name);
      // Prefill title
      const titleInput = formRef.current?.querySelector("#title") as HTMLInputElement;
      if (titleInput) {
        titleInput.value = videoFiles[0].name.replace(/\.[^/.]+$/, "");
      }
    }
  }

  function handleFolderSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      handleFolderFiles(Array.from(e.target.files));
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      handleFolderFiles(Array.from(e.dataTransfer.files));
    }
  }

  function handleLocalFileChange(name: string) {
    setSelectedLocalFile(name);
    const titleInput = formRef.current?.querySelector("#title") as HTMLInputElement;
    if (titleInput) {
      titleInput.value = name.replace(/\.[^/.]+$/, "");
    }
  }

  return (
    <div className="grid gap-4 rounded-2xl border border-border bg-card p-5">
      {/* Selector de Tipo */}
      <div className="flex border-b border-border pb-3 gap-4">
        <button
          type="button"
          onClick={() => setVideoType("remote")}
          className={`flex items-center gap-1.5 pb-2 text-sm font-semibold border-b-2 transition-all ${
            videoType === "remote"
              ? "border-accent text-accent"
              : "border-transparent text-muted hover:text-text"
          }`}
        >
          <LinkIcon size={16} />
          Enlace Web (YouTube / MP4 Directo)
        </button>
        <button
          type="button"
          onClick={() => setVideoType("local")}
          className={`flex items-center gap-1.5 pb-2 text-sm font-semibold border-b-2 transition-all ${
            videoType === "local"
              ? "border-accent text-accent"
              : "border-transparent text-muted hover:text-text"
          }`}
        >
          <Folder size={16} />
          Video Local (Arrastrar Carpeta)
        </button>
      </div>

      <form ref={formRef} action={formAction} className="grid gap-4">
        {videoType === "local" && (
          <div className="grid gap-4">
            {/* Dropzone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`rounded-xl border-2 border-dashed p-8 text-center transition-all ${
                isDragOver
                  ? "border-accent bg-accent/5"
                  : localFiles.length > 0
                  ? "border-positive/45 bg-positive/5"
                  : "border-border-2 bg-surface hover:border-border"
              }`}
            >
              <input
                type="file"
                id="folder-upload"
                multiple
                className="hidden"
                onChange={handleFolderSelect}
                {...{ webkitdirectory: "", directory: "" }}
              />
              <Folder size={32} className="mx-auto mb-2 text-muted" />
              {localFiles.length > 0 ? (
                <div>
                  <p className="text-sm font-semibold text-positive flex items-center justify-center gap-1.5">
                    <Check size={16} /> ¡Carpeta vinculada con éxito!
                  </p>
                  <p className="text-xs text-muted mt-1">
                    Se detectaron {localFiles.length} videos en tu carpeta local.
                  </p>
                </div>
              ) : (
                <div>
                  <label
                    htmlFor="folder-upload"
                    className="cursor-pointer text-sm font-semibold text-text hover:underline"
                  >
                    Arrastrá una carpeta acá o haz clic para seleccionarla
                  </label>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    Escanea archivos .mp4, .mov, o .avi de tu PC para catalogarlos y reproducirlos localmente.
                  </p>
                </div>
              )}
            </div>

            {localFiles.length > 0 && (
              <div className="grid gap-1">
                <label htmlFor="localFileSelect" className="text-xs font-semibold text-muted">
                  Seleccionar archivo de video *
                </label>
                <select
                  id="localFileSelect"
                  value={selectedLocalFile}
                  onChange={(e) => handleLocalFileChange(e.target.value)}
                  className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text focus:border-accent-2 focus:outline-none"
                >
                  {localFiles.map((f) => (
                    <option key={f.name} value={f.name}>
                      {f.name}
                    </option>
                  ))}
                </select>
                <input type="hidden" name="source_url" value={`local://${selectedLocalFile}`} />
              </div>
            )}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1">
            <label htmlFor="title" className="text-xs font-semibold text-muted">
              Título *
            </label>
            <input
              id="title"
              name="title"
              required
              placeholder="Ej: Trinidense vs Olimpia — Jugada de gol"
              className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text focus:border-accent-2 focus:outline-none"
            />
          </div>

          <div className="grid gap-1">
            <label htmlFor="player_id" className="text-xs font-semibold text-muted">
              Jugador (opcional)
            </label>
            <select
              id="player_id"
              name="player_id"
              className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text focus:border-accent-2 focus:outline-none"
            >
              <option value="">Sin jugador asociado</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.positionGroup})
                </option>
              ))}
            </select>
          </div>
        </div>

        {videoType === "remote" && (
          <div className="grid gap-1">
            <label htmlFor="source_url_remote" className="text-xs font-semibold text-muted">
              Link del video (YouTube o mp4 directo) *
            </label>
            <input
              id="source_url_remote"
              name="source_url"
              type="url"
              required={videoType === "remote"}
              placeholder="https://www.youtube.com/watch?v=…"
              className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text focus:border-accent-2 focus:outline-none"
            />
          </div>
        )}

        <div className="max-w-[300px]">
          <VisibilitySelector isPublic={isPublic} onChange={setIsPublic} />
        </div>

        {state?.error && <p className="text-sm text-negative">{state.error}</p>}

        <button
          type="submit"
          disabled={pending || (videoType === "local" && localFiles.length === 0)}
          className="justify-self-start rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-navy-deep hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Guardando…" : "Agregar video"}
        </button>
      </form>
    </div>
  );
}
