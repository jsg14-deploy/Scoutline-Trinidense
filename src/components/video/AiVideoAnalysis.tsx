"use client";

import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { runVideoAiAnalysis } from "@/app/actions/video";

// La respuesta de Gemini viene con **negrita** en markdown — convertimos esa
// única marca a <strong> sin sumar una librería entera de markdown para esto.
function renderWithBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : part,
  );
}

export function AiVideoAnalysis({
  clipId,
  initialAnalysis,
}: {
  clipId: string;
  initialAnalysis: string | null;
}) {
  const [analysis, setAnalysis] = useState(initialAnalysis);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleAnalyze() {
    setError(null);
    startTransition(async () => {
      const result = await runVideoAiAnalysis(clipId);
      if ("error" in result) {
        setError(result.error);
      } else {
        window.location.reload();
      }
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-text">Análisis con IA</h2>
          <p className="mt-1 text-xs text-muted">Gemini mira el video completo y arma un informe de scouting.</p>
        </div>
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={pending}
          className="flex shrink-0 items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-navy-deep hover:opacity-90 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-accent-2 outline-none transition-opacity"
        >
          <Sparkles size={14} />
          {pending ? "Analizando…" : analysis ? "Re-analizar" : "Analizar con IA"}
        </button>
      </div>

      {error && (
        <p className="mt-3 text-sm text-negative font-medium" aria-live="polite">
          {error}
        </p>
      )}
      
      {pending && (
        <p className="mt-3 text-xs text-muted font-medium" aria-live="polite">
          Esto puede tardar un minuto para videos largos…
        </p>
      )}

      {analysis && (
        <div className="mt-4 whitespace-pre-line rounded-xl bg-surface p-4 text-sm leading-relaxed text-text">
          {renderWithBold(analysis)}
        </div>
      )}
    </div>
  );
}
