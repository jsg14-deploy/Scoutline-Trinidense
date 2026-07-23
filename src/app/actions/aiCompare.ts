"use server";

import { requireSession } from "@/lib/auth/session";
import { askProvider, isProviderConfigured, AiProvider } from "@/lib/ai/providers";

type CompareData = {
  player1: { name: string; position: string; stats: Record<string, unknown>; percentiles: Record<string, number>; info: Record<string, unknown> };
  player2: { name: string; position: string; stats: Record<string, unknown>; percentiles: Record<string, number>; info: Record<string, unknown> };
};

export async function generateComparisonReport(data: CompareData) {
  await requireSession(); // Ensure user is authenticated

  // Determine which provider is configured
  let provider: AiProvider = "gemini";
  if (!isProviderConfigured("gemini")) {
    if (isProviderConfigured("claude")) provider = "claude";
    else if (isProviderConfigured("chatgpt")) provider = "chatgpt";
    else {
      throw new Error("No hay ningún proveedor de IA configurado (Faltan API Keys en .env)");
    }
  }

  const systemPrompt = `
Eres un analista jefe de scouting del Club Sportivo Trinidense (primera división de Paraguay).
Tu objetivo es analizar dos jugadores para una posible contratación o comparación táctica.
El reporte debe ser escrito en español sudamericano, profesional y directo.
Usa formato Markdown.
Mantén la respuesta bajo las 400 palabras.
La estructura sugerida:
1. Veredicto Rápido (Resumen)
2. Fortalezas de ${data.player1.name} vs ${data.player2.name}
3. Debilidades / Puntos a mejorar
4. Conclusión / Encaje en un modelo de juego intenso y de transiciones rápidas.

Usa negritas para destacar métricas clave.
`;

  const userMessage = `
Jugador 1: ${data.player1.name} (${data.player1.position})
Info: ${JSON.stringify(data.player1.info)}
Stats: ${JSON.stringify(data.player1.stats)}
Percentiles: ${JSON.stringify(data.player1.percentiles)}

Jugador 2: ${data.player2.name} (${data.player2.position})
Info: ${JSON.stringify(data.player2.info)}
Stats: ${JSON.stringify(data.player2.stats)}
Percentiles: ${JSON.stringify(data.player2.percentiles)}

Genera el reporte Head-to-Head.
`;

  const response = await askProvider(provider, systemPrompt, [{ role: "user", content: userMessage }]);
  return response;
}
