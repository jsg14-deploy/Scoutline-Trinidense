"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { Swords, Eye, EyeOff, Trash2, Cpu, Play, Loader2 } from "lucide-react";
import { createOpponentAnalysis, deleteOpponentAnalysis, runOpponentAiAnalysis } from "@/app/actions/rival";
import { VisibilitySelector } from "@/components/ui/VisibilitySelector";

type OpponentAnalysisItem = {
  id: string;
  rivalName: string;
  startingXI: string;
  squad: string;
  substitutions: string;
  minutesPlayed: string;
  aiAnalysis: string | null;
  videoUrl: string | null;
  isPublic: boolean;
  createdById: string | null;
  createdAt: Date;
};

interface RivalContainerProps {
  analyses: OpponentAnalysisItem[];
}

export function RivalContainer({ analyses }: RivalContainerProps) {
  const [isPublic, setIsPublic] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(analyses[0]?.id ?? null);
  const [showForm, setShowForm] = useState(false);
  const [aiPending, setAiPending] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const [state, formAction, pending] = useActionState(createOpponentAnalysis, undefined);
  const [isDeletePending, startDeleteTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      setTimeout(() => {
        setShowForm(false);
        setIsPublic(true);
        // Select the newly created analysis (which is at the top of the list)
        if (analyses.length > 0) {
          setSelectedId(analyses[0].id);
        }
      }, 0);
    }
  }, [state, analyses]);

  const activeAnalysis = analyses.find((a) => a.id === selectedId);

  async function handleAiAnalysis(id: string) {
    setAiPending(true);
    setAiError(null);
    try {
      const res = await runOpponentAiAnalysis(id);
      if (res && "error" in res) {
        setAiError(res.error ?? "Error al analizar el rival.");
      }
    } catch {
      setAiError("Ocurrió un error inesperado.");
    } finally {
      setAiPending(false);
    }
  }

  function handleDelete(id: string) {
    if (confirm("¿Estás seguro de que querés eliminar este análisis?")) {
      startDeleteTransition(async () => {
        await deleteOpponentAnalysis(id);
        if (selectedId === id) {
          setSelectedId(analyses.find((a) => a.id !== id)?.id ?? null);
        }
      });
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Sidebar: List of rival analyses */}
      <div className="lg:col-span-1 grid gap-4 content-start">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-bold text-text uppercase tracking-wider text-[#8f9bc7]">
            Rivalidades ({analyses.length})
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-navy-deep hover:opacity-90 transition-opacity"
          >
            {showForm ? "Cerrar" : "Nuevo Análisis"}
          </button>
        </div>

        {showForm && (
          <form
            ref={formRef}
            action={formAction}
            className="grid gap-4 rounded-2xl border border-border bg-card p-5"
          >
            <div className="grid gap-1">
              <label htmlFor="rivalName" className="text-xs font-semibold text-muted">
                Nombre del Rival *
              </label>
              <input
                id="rivalName"
                name="rivalName"
                required
                placeholder="Ej: Cerro Porteño"
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent-2 focus:outline-none"
              />
            </div>

            <div className="grid gap-1">
              <label htmlFor="startingXI" className="text-xs font-semibold text-muted">
                Formación / Alineación inicial
              </label>
              <textarea
                id="startingXI"
                name="startingXI"
                rows={3}
                placeholder="Ej: 4-4-2. Portero: Jean; Defensas: Alan Benítez, Báez..."
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent-2 focus:outline-none"
              />
            </div>

            <div className="grid gap-1">
              <label htmlFor="squad" className="text-xs font-semibold text-muted">
                Convocados / Plantilla
              </label>
              <textarea
                id="squad"
                name="squad"
                rows={3}
                placeholder="Ej: Churín, Carrizo, Piris da Motta, Iturbe..."
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent-2 focus:outline-none"
              />
            </div>

            <div className="grid gap-4 grid-cols-2">
              <div className="grid gap-1">
                <label htmlFor="substitutions" className="text-xs font-semibold text-muted">
                  Cambios habituales
                </label>
                <textarea
                  id="substitutions"
                  name="substitutions"
                  rows={2}
                  placeholder="Ej: Ingresa Churín por Da Costa al minuto 60..."
                  className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent-2 focus:outline-none"
                />
              </div>

              <div className="grid gap-1">
                <label htmlFor="minutesPlayed" className="text-xs font-semibold text-muted">
                  Minutos de juego
                </label>
                <textarea
                  id="minutesPlayed"
                  name="minutesPlayed"
                  rows={2}
                  placeholder="Ej: Piris da Motta 90', Jean 90', Carrizo 75'..."
                  className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent-2 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid gap-1">
              <label htmlFor="videoUrl" className="text-xs font-semibold text-muted">
                Video del último partido (URL o referencia local)
              </label>
              <input
                id="videoUrl"
                name="videoUrl"
                placeholder="Ej: https://www.youtube.com/watch?v=... o local://video.mp4"
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent-2 focus:outline-none"
              />
            </div>

            <VisibilitySelector isPublic={isPublic} onChange={setIsPublic} />

            {state?.error && <p className="text-sm text-negative">{state.error}</p>}

            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {pending ? "Guardando..." : "Guardar Análisis"}
            </button>
          </form>
        )}

        <div className="grid gap-2">
          {analyses.length === 0 ? (
            <p className="text-sm text-muted">No hay análisis tácticos registrados.</p>
          ) : (
            analyses.map((a) => {
              const active = a.id === selectedId;
              return (
                <div
                  key={a.id}
                  onClick={() => setSelectedId(a.id)}
                  className={`flex items-center justify-between rounded-xl border p-4 cursor-pointer transition-all duration-200 ${
                    active
                      ? "border-accent bg-accent/10 shadow-[0_4px_12px_rgba(242,194,48,0.15)]"
                      : "border-border bg-card hover:bg-surface"
                  }`}
                >
                  <div className="grid gap-0.5">
                    <p className="font-semibold text-sm text-text">{a.rivalName}</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted">
                      <span>{a.createdAt.toISOString().slice(0, 10)}</span>
                      <span>·</span>
                      {a.isPublic ? (
                        <span className="flex items-center gap-0.5 text-positive/80">
                          <Eye size={10} /> Público
                        </span>
                      ) : (
                        <span className="flex items-center gap-0.5 text-warn/80">
                          <EyeOff size={10} /> Oculto
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(a.id);
                    }}
                    disabled={isDeletePending}
                    className="h-7 w-7 flex items-center justify-center rounded-lg border border-border text-muted hover:border-negative hover:text-negative transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Panel: Details & AI Analysis */}
      <div className="lg:col-span-2 grid gap-6 content-start">
        {activeAnalysis ? (
          <div className="rounded-2xl border border-border bg-card p-6 grid gap-6">
            <div className="flex justify-between items-start border-b border-border pb-4">
              <div>
                <h3 className="font-display text-xl font-bold text-text">{activeAnalysis.rivalName}</h3>
                <p className="text-xs text-muted mt-1">
                  Registrado el {activeAnalysis.createdAt.toLocaleDateString("es-PY")} ·{" "}
                  {activeAnalysis.isPublic ? "Visible para el club" : "Solo visible para vos"}
                </p>
              </div>

              <button
                onClick={() => handleAiAnalysis(activeAnalysis.id)}
                disabled={aiPending}
                className="flex items-center gap-1.5 rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {aiPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Analizando...
                  </>
                ) : (
                  <>
                    <Cpu size={14} /> {activeAnalysis.aiAnalysis ? "Re-analizar con IA" : "Analizar con IA"}
                  </>
                )}
              </button>
            </div>

            {aiError && <p className="text-sm text-negative">{aiError}</p>}

            <div className="grid gap-4 sm:grid-cols-2">
              <DetailBlock label="Alineación inicial / Formación" value={activeAnalysis.startingXI} />
              <DetailBlock label="Plantel / Convocados" value={activeAnalysis.squad} />
              <DetailBlock label="Cambios habituales" value={activeAnalysis.substitutions} />
              <DetailBlock label="Minutos jugados" value={activeAnalysis.minutesPlayed} />
            </div>

            {activeAnalysis.videoUrl && (
              <div className="rounded-xl border border-border bg-surface p-4 grid gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Video del último partido</p>
                <div className="flex items-center gap-2">
                  <Play size={14} className="text-accent" />
                  <a
                    href={activeAnalysis.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-text hover:underline truncate"
                  >
                    {activeAnalysis.videoUrl}
                  </a>
                </div>
              </div>
            )}

            {/* AI Report Box */}
            <div className="rounded-xl border border-border bg-surface p-5 grid gap-3">
              <div className="flex items-center gap-2 text-accent">
                <Cpu size={18} />
                <h4 className="text-sm font-bold uppercase tracking-wider">Reporte Táctico IA (Gemini)</h4>
              </div>
              {activeAnalysis.aiAnalysis ? (
                <div className="text-sm text-text leading-relaxed whitespace-pre-wrap font-sans border-t border-border pt-3">
                  {activeAnalysis.aiAnalysis}
                </div>
              ) : (
                <p className="text-sm text-muted italic border-t border-border pt-3">
                  Aún no has generado el reporte táctico con Inteligencia Artificial. Hacé clic en &quot;Analizar con IA&quot;
                  arriba para obtener recomendaciones estratégicas basadas en este plantel rival.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border-2 p-16 text-center text-muted">
            <Swords size={28} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Seleccioná un análisis de rival o creá uno nuevo.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">{label}</p>
      <p className="text-sm text-text whitespace-pre-wrap">{value || "Sin información cargada."}</p>
    </div>
  );
}
