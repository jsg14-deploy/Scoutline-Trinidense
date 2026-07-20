"use server";

import { requireSession } from "@/lib/auth/session";
import { askProvider, type AiProvider, type ChatMessage } from "@/lib/ai/providers";
import {
  resolvePlayersForTurn,
  buildGeneralContext,
  type PlayerChartData,
  type RankingEntry,
} from "@/lib/ai/playerContext";

const BASE_SYSTEM_PROMPT = `Sos el asistente de scouting de "Scoutline Trinidense", una plataforma de análisis de fútbol.
Tu trabajo es ayudar a decidir a qué jugadores comparar, scoutear o fichar, usando los datos reales del catálogo
que se te dan como contexto (percentiles por posición, equipo, minutos jugados). Podés comparar jugadores entre sí,
armar rankings dentro del catálogo y dar una recomendación con tu razonamiento.
Respondé en español, de forma concisa y basándote únicamente en los datos que se te dan como contexto — no
inventes jugadores, cifras ni clubes que no estén en los datos. Si el catálogo de contexto no alcanza para
responder con precisión (por ejemplo, si te preguntan por un jugador que no aparece en la lista), decilo
explícitamente en vez de inventar.

IMPORTANTE sobre gráficos e imágenes: la plataforma (no vos) ya dibuja automáticamente un gráfico de barras
comparando a los jugadores de esta consulta, visible en la pantalla justo debajo de tu respuesta de texto.
NUNCA le digas al usuario que "no podés generar gráficos/imágenes" ni que "solo podés dar texto" — eso es
falso en este contexto, el gráfico ya se muestra solo. En vez de eso, referite al gráfico como algo que ya está
ahí ("mirá el gráfico de abajo") y enfocá tu texto en la interpretación y la recomendación, no en repetir cada
número.`;

export type AskAssistantInput = {
  provider: AiProvider;
  playerId?: string;
  messages: ChatMessage[];
};

export type AskAssistantResult =
  | { reply: string; players: PlayerChartData[]; ranking: RankingEntry[] }
  | { error: string };

export async function askAssistant(input: AskAssistantInput): Promise<AskAssistantResult> {
  await requireSession();

  try {
    let systemPrompt = BASE_SYSTEM_PROMPT;

    const lastUserMessage = [...input.messages].reverse().find((m) => m.role === "user");
    const messageText = lastUserMessage?.content ?? "";

    // Las dos consultas son independientes entre sí — correrlas en paralelo
    // en vez de una atrás de la otra corta la latencia del turno a la mitad.
    const [{ summaries, chartData }, general] = await Promise.all([
      resolvePlayersForTurn(input.playerId, messageText),
      buildGeneralContext(messageText),
    ]);

    // El ranking general solo se usa como respaldo cuando no hay jugadores
    // puntuales que comparar (si no, compiten visualmente con el gráfico
    // de comparación 1 a 1, que es más específico para lo que se pidió).
    const ranking = chartData.length === 0 ? general.ranking : [];

    if (summaries.length > 0) {
      systemPrompt += `\n\nDetalle completo de jugadores relevantes para esta consulta:\n\n${summaries.join("\n\n---\n\n")}`;
    }

    if (ranking.length > 0) {
      systemPrompt += `\n\nRanking ya calculado y mostrado como gráfico en pantalla (no hace falta que lo repitas en texto, solo interpretalo):\n${ranking
        .map((r, i) => `${i + 1}. ${r.name} (${r.positionGroup}) — percentil promedio ${r.avgPercentile}/100`)
        .join("\n")}`;
    }

    if (general.overview) {
      systemPrompt += `\n\n${general.overview}`;
    }

    const reply = await askProvider(input.provider, systemPrompt, input.messages);
    return { reply, players: chartData, ranking };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido al consultar la IA." };
  }
}
