"use client";

import { useState, useTransition } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { runLegalAiAnalysis } from "@/app/actions/legalAi";

export function AiLegalAnalyzer() {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleAnalyze() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await runLegalAiAnalysis();
        if (result.error) {
          setError(result.error);
        } else {
          setAnalysis(result.analysis ?? null);
        }
      } catch {
        setError("Ocurrió un error inesperado al contactar con Gemini.");
      }
    });
  }

  function renderWithBold(text: string) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) =>
      part.startsWith("**") && part.endsWith("**") ? <strong key={i} className="text-accent">{part.slice(2, -2)}</strong> : part,
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 h-[400px] flex flex-col">
      <div className="flex items-start gap-4 border-b border-border pb-4 mb-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 border border-accent/20">
          <Sparkles size={20} className="text-accent" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-text">Auditor Legal IA</h2>
          <p className="mt-1 text-xs text-muted">Gemini evalúa el riesgo patrimonial de los contratos próximos a vencer.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar mb-4 pr-2">
        {error && <p className="text-sm text-negative font-medium bg-negative/10 p-3 rounded-lg">{error}</p>}
        
        {analysis ? (
          <div className="text-sm leading-relaxed text-text whitespace-pre-wrap">
            {renderWithBold(analysis)}
          </div>
        ) : pending ? (
          <div className="flex flex-col items-center justify-center h-full text-muted gap-2">
            <Loader2 size={24} className="animate-spin text-accent" />
            <span className="text-xs font-medium">Gemini está evaluando los riesgos...</span>
          </div>
        ) : (
          <div className="flex flex-col justify-center h-full text-center p-4">
            <p className="text-sm text-muted italic">
              Haz clic abajo para que la IA lea los contratos vigentes y alerte sobre renovaciones prioritarias o riesgos.
            </p>
          </div>
        )}
      </div>

      <button
        onClick={handleAnalyze}
        disabled={pending}
        className="mt-auto flex w-full items-center justify-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Evaluando Riesgos..." : "Generar Reporte de Riesgos"}
      </button>
    </div>
  );
}
