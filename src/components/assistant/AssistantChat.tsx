"use client";

import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { askAssistant } from "@/app/actions/assistant";
import { ProviderIcon, PROVIDER_COLORS } from "@/components/assistant/ProviderIcon";
import { AssistantPlayerChart } from "@/components/assistant/AssistantPlayerChart";
import { AssistantRankingChart } from "@/components/assistant/AssistantRankingChart";
import type { AiProvider, ChatMessage } from "@/lib/ai/providers";
import type { PlayerChartData, RankingEntry } from "@/lib/ai/playerContext";

type ProviderOption = { value: AiProvider; label: string; configured: boolean };
type PlayerOption = { id: string; name: string; positionGroup: string };
type DisplayMessage = ChatMessage & { players?: PlayerChartData[]; ranking?: RankingEntry[] };

export function AssistantChat({ providers, players }: { providers: ProviderOption[]; players: PlayerOption[] }) {
  const firstConfigured = providers.find((p) => p.configured)?.value ?? providers[0]?.value ?? "claude";
  const [provider, setProvider] = useState<AiProvider>(firstConfigured);
  const [playerId, setPlayerId] = useState("");
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedProvider = providers.find((p) => p.value === provider);

  async function handleSend() {
    const text = input.trim();
    if (!text || pending) return;

    setError(null);
    const nextMessages: DisplayMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setPending(true);

    const plainMessages: ChatMessage[] = nextMessages.map(({ role, content }) => ({ role, content }));
    try {
      const result = await askAssistant({ provider, playerId: playerId || undefined, messages: plainMessages });
      if ("error" in result) {
        setError(result.error);
      } else {
        setMessages([
          ...nextMessages,
          { role: "assistant", content: result.reply, players: result.players, ranking: result.ranking },
        ]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de red al consultar la IA. Probá de nuevo.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 rounded-2xl border border-border bg-card p-5">
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">Modelo</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {providers.map((p) => {
              const active = p.value === provider;
              const color = PROVIDER_COLORS[p.value];
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setProvider(p.value)}
                  className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-all ${
                    active
                      ? "border-border-2 bg-surface text-text shadow-[0_10px_25px_-15px_rgba(0,0,0,0.5)]"
                      : "border-border text-muted hover:border-border-2 hover:text-text"
                  }`}
                >
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-lg"
                    style={{ background: color.bg }}
                  >
                    <ProviderIcon provider={p.value} size={14} />
                  </span>
                  {p.label}
                  {!p.configured && <span className="text-[10px] text-muted-2">(sin configurar)</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
            Jugador de contexto (opcional)
          </label>
          <select
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
            className="mt-2 w-full max-w-sm rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent-2 focus:outline-none sm:w-auto"
          >
            <option value="">Sin jugador de contexto</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.positionGroup})
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-muted">
            No hace falta elegir uno — si mencionás un nombre en el chat lo busca solo en tu catálogo.
          </p>
        </div>
      </div>

      {selectedProvider && !selectedProvider.configured && (
        <p className="text-xs text-warn">
          {selectedProvider.label} todavía no tiene la clave de API configurada en el servidor — la respuesta va a
          fallar hasta que se cargue.
        </p>
      )}

      <div className="grid min-h-[360px] content-start gap-4 rounded-2xl border border-border bg-card p-5">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center gap-3 self-center justify-self-center py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20 text-accent">
              <Sparkles size={22} strokeWidth={1.8} />
            </div>
            <p className="max-w-sm text-sm text-muted">
              Escribí una pregunta. Ej: &quot;Comparame a Fulano y Mengano&quot; o &quot;¿Quién es el mejor
              delantero de mi catálogo?&quot;
            </p>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`grid gap-2 ${m.role === "user" ? "justify-items-end" : "justify-items-start"}`}>
              <div className={`flex items-end gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                {m.role === "assistant" && (
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                    style={{ background: PROVIDER_COLORS[provider].bg }}
                  >
                    <ProviderIcon provider={provider} size={14} />
                  </span>
                )}
                <div
                  className={`max-w-[75vw] rounded-xl px-4 py-2.5 text-sm sm:max-w-[420px] ${
                    m.role === "user" ? "bg-navy text-white" : "bg-surface text-text"
                  }`}
                >
                  {m.content}
                </div>
              </div>
              {m.players && m.players.length > 0 && (
                <div className="w-full max-w-[600px]">
                  <AssistantPlayerChart players={m.players} />
                </div>
              )}
              {(!m.players || m.players.length === 0) && m.ranking && m.ranking.length > 0 && (
                <div className="w-full max-w-[600px]">
                  <AssistantRankingChart entries={m.ranking} />
                </div>
              )}
            </div>
          ))
        )}
        {pending && (
          <div className="flex items-center gap-2 justify-self-start">
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
              style={{ background: PROVIDER_COLORS[provider].bg }}
            >
              <ProviderIcon provider={provider} size={14} />
            </span>
            <p className="text-xs text-muted">Pensando…</p>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-negative">{error}</p>}

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handleSend();
            }
          }}
          placeholder="Escribí tu mensaje…"
          className="flex-1 rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text focus:border-accent-2 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => void handleSend()}
          disabled={pending || !input.trim()}
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-navy-deep transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Send size={14} />
          Enviar
        </button>
      </div>
    </div>
  );
}
