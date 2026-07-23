"use client";

import { useState } from "react";
import { generateComparisonReport } from "@/app/actions/aiCompare";
import { Sparkles, Loader2 } from "lucide-react";

type CompareData = {
  player1: { name: string; position: string; stats: Record<string, unknown>; percentiles: Record<string, number>; info: Record<string, unknown> };
  player2: { name: string; position: string; stats: Record<string, unknown>; percentiles: Record<string, number>; info: Record<string, unknown> };
};

export function CompareAIReport({ data }: { data: CompareData }) {
  const [report, setReport] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateComparisonReport(data);
      setReport(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error al generar el reporte.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-black text-text font-display flex items-center gap-2">
            <Sparkles className="text-accent" size={20} />
            Scout AI H2H Report
          </h2>
          <p className="text-sm text-muted">Análisis comparativo automatizado</p>
        </div>
        {!report && (
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg bg-navy hover:bg-navy-2 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {isLoading ? "Generando..." : "Generar Reporte"}
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 mb-4 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg">
          {error}
        </div>
      )}

      {report && (
        <div className="mt-6 space-y-4 text-sm text-text leading-relaxed prose prose-invert max-w-none">
          {/* Simple markdown render for text - if you have a markdown component use it, otherwise basic render */}
          {report.split('\n').map((paragraph, idx) => {
            if (paragraph.startsWith('###')) {
              return <h4 key={idx} className="text-md font-bold text-text mt-4 mb-2">{paragraph.replace('###', '').trim()}</h4>;
            }
            if (paragraph.startsWith('##')) {
              return <h3 key={idx} className="text-lg font-black text-accent mt-6 mb-2">{paragraph.replace('##', '').trim()}</h3>;
            }
            if (paragraph.startsWith('#')) {
              return <h2 key={idx} className="text-xl font-black text-text mt-6 mb-3">{paragraph.replace('#', '').trim()}</h2>;
            }
            if (paragraph.startsWith('-')) {
              return <li key={idx} className="ml-4">{paragraph.replace('-', '').trim()}</li>;
            }
            // Add basic bolding logic
            const formattedText = paragraph.split('**').map((part, i) => 
              i % 2 === 1 ? <strong key={i} className="text-white font-bold">{part}</strong> : part
            );
            return paragraph.trim() ? <p key={idx} className="mb-2 text-muted">{formattedText}</p> : null;
          })}
        </div>
      )}
    </div>
  );
}
