"use client";

import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { askFinanceAssistant } from "@/app/actions/finance";

// La respuesta viene con **negrita** en markdown — mismo criterio que en
// AiVideoAnalysis: convertimos esa única marca a <strong> sin sumar una
// librería entera de markdown para esto.
function renderWithBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : part,
  );
}

export function FinanceAiAssistant() {
  const [question, setQuestion] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleAsk() {
    setError(null);
    const askedQuestion = question;
    startTransition(async () => {
      const result = await askFinanceAssistant(askedQuestion);
      if ("error" in result) {
        setError(result.error);
      } else {
        setReply(result.reply);
      }
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/20 text-accent">
          <Sparkles size={16} strokeWidth={1.8} />
        </span>
        <div>
          <h2 className="text-sm font-bold text-text">Preguntale a la IA</h2>
          <p className="mt-0.5 text-xs text-muted">
            Analiza el costo salarial cargado y responde preguntas sobre eficiencia, comparaciones o alertas.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !pending) {
              e.preventDefault();
              handleAsk();
            }
          }}
          placeholder='Ej: "¿qué jugador me sale más caro por minuto?" (dejalo vacío para un análisis general)'
          className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text focus:border-accent-2 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleAsk}
          disabled={pending}
          className="flex shrink-0 items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-navy-deep transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Sparkles size={14} />
          {pending ? "Pensando…" : "Preguntar"}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-negative">{error}</p>}

      {reply && (
        <div className="mt-4 whitespace-pre-line rounded-xl bg-surface p-4 text-sm leading-relaxed text-text">
          {renderWithBold(reply)}
        </div>
      )}
    </div>
  );
}
