"use server";

import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { askProvider, isProviderConfigured, AiProvider } from "@/lib/ai/providers";

export async function runLegalAiAnalysis() {
  const session = await requireSession();

  let provider: AiProvider = "gemini";
  if (!isProviderConfigured("gemini")) {
    if (isProviderConfigured("claude")) provider = "claude";
    else if (isProviderConfigured("chatgpt")) provider = "chatgpt";
    else {
      return { error: "No hay ningún proveedor de IA configurado." };
    }
  }

  // Obtenemos los contratos activos que vencen en los próximos 180 días
  const now = new Date();
  const future = new Date();
  future.setDate(future.getDate() + 180);

  const contracts = await prisma.legalContract.findMany({
    where: {
      tenantId: session.tenantId,
      status: "active",
      endDate: { lte: future }
    },
    include: { player: true },
    orderBy: { endDate: "asc" }
  });

  if (contracts.length === 0) {
    return { analysis: "No hay contratos activos próximos a vencer en los siguientes 6 meses. Riesgo patrimonial nulo." };
  }

  const systemPrompt = `
Eres el Director Legal y Deportivo del Club Sportivo Trinidense (primera división de Paraguay).
Tu objetivo es analizar los contratos que vencen en los próximos meses y alertar sobre el riesgo de perder patrimonio (jugadores que quedan libres).
Debes buscar cláusulas críticas si las hay, priorizar renovaciones e identificar oportunidades.
El reporte debe ser escrito en español, profesional, usando formato Markdown y negritas para resaltar nombres o fechas clave.
`;

  const dataStr = contracts.map(c => 
    `- Contrato: ${c.title} | Tipo: ${c.type} | Titular: ${c.player?.name || 'N/A'} | Vencimiento: ${c.endDate.toISOString().slice(0, 10)} | Cláusulas: ${c.clauses || 'Ninguna'}`
  ).join("\n");

  const userMessage = `
Aquí están los contratos próximos a vencer (menos de 6 meses):
${dataStr}

Por favor genera un reporte de riesgo patrimonial, indicando cuáles son prioritarios para renovar.
`;

  try {
    const response = await askProvider(provider, systemPrompt, [{ role: "user", content: userMessage }]);
    return { analysis: response };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error al generar el reporte con IA." };
  }
}
