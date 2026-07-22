"use client";

import { useState, useTransition } from "react";
import { FileText, Upload, Loader2, CheckCircle2 } from "lucide-react";
import { uploadPdfReport } from "@/app/actions/reports";
import { VisibilitySelector } from "@/components/ui/VisibilitySelector";

interface PdfUploaderProps {
  players: { id: string; name: string }[];
}

export function PdfUploader({ players }: PdfUploaderProps) {
  const [isPublic, setIsPublic] = useState(true);
  const [playerId, setPlayerId] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.type !== "application/pdf") {
        setError("El archivo debe ser un PDF.");
        return;
      }
      setFile(selected);
      setError(null);
      if (!title) {
        setTitle(`Reporte PDF — ${selected.name.replace(/\.[^/.]+$/, "")}`);
      }
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
    const selected = e.dataTransfer.files?.[0];
    if (selected) {
      if (selected.type !== "application/pdf") {
        setError("El archivo debe ser un PDF.");
        return;
      }
      setFile(selected);
      setError(null);
      if (!title) {
        setTitle(`Reporte PDF — ${selected.name.replace(/\.[^/.]+$/, "")}`);
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!playerId || !title || !file) {
      setError("Faltan datos obligatorios (jugador, título o archivo PDF).");
      return;
    }

    setError(null);
    setSuccess(null);

    // Convert file to Base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64Str = (reader.result as string).split(",")[1];
      
      startTransition(async () => {
        try {
          await uploadPdfReport(playerId, title, base64Str, isPublic);
          setSuccess("Reporte PDF subido correctamente a la base de datos.");
          setPlayerId("");
          setTitle("");
          setFile(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Error al subir el archivo.");
        }
      });
    };
    reader.onerror = () => {
      setError("Error al leer el archivo PDF local.");
    };
    reader.readAsDataURL(file);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-border bg-card p-5">
      <h3 className="text-sm font-bold text-text uppercase tracking-wider text-[#f2c230] border-b border-border pb-1">
        Cargar Reporte PDF
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1">
          <label htmlFor="pdfPlayer" className="text-xs font-semibold text-muted">
            Jugador Asociado *
          </label>
          <select
            id="pdfPlayer"
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
            required
            className="rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-text focus:border-accent-2 focus:outline-none"
          >
            <option value="">Seleccioná un jugador</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-1">
          <label htmlFor="pdfTitle" className="text-xs font-semibold text-muted">
            Título del Reporte *
          </label>
          <input
            id="pdfTitle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Ej: Reporte Físico Trinidense 2026"
            className="rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-text focus:border-accent-2 focus:outline-none"
          />
        </div>
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`rounded-xl border-2 border-dashed p-8 text-center transition-all ${
          isDragOver
            ? "border-accent bg-accent/5"
            : file
            ? "border-positive/45 bg-positive/5"
            : "border-border-2 bg-surface hover:border-border"
        }`}
      >
        <input
          type="file"
          id="pdf-file-picker"
          accept=".pdf"
          className="hidden"
          onChange={handleFileSelect}
        />
        <FileText size={32} className="mx-auto mb-2 text-muted" />
        {file ? (
          <div>
            <p className="text-sm font-semibold text-positive flex items-center justify-center gap-1.5">
              <CheckCircle2 size={16} /> ¡Archivo seleccionado: {file.name}!
            </p>
            <p className="text-xs text-muted mt-1">
              {(file.size / 1024 / 1024).toFixed(2)} MB · Listo para cargar
            </p>
          </div>
        ) : (
          <div>
            <label
              htmlFor="pdf-file-picker"
              className="cursor-pointer text-sm font-semibold text-text hover:underline"
            >
              Arrastrá el archivo PDF acá o haz clic para buscarlo
            </label>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              El archivo se codificará y se almacenará de forma segura en la base de datos.
            </p>
          </div>
        )}
      </div>

      <div className="max-w-[300px]">
        <VisibilitySelector isPublic={isPublic} onChange={setIsPublic} />
      </div>

      {error && <p className="text-sm text-negative">{error}</p>}
      {success && <p className="text-sm text-positive">{success}</p>}

      <button
        type="submit"
        disabled={isPending || !file || !playerId || !title}
        className="flex items-center gap-1.5 justify-self-start rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? (
          <>
            <Loader2 size={14} className="animate-spin" /> Procesando...
          </>
        ) : (
          <>
            <Upload size={14} /> Subir Reporte PDF
          </>
        )}
      </button>
    </form>
  );
}
