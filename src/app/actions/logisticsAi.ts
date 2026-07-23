"use server";

import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { askProvider, isProviderConfigured, AiProvider } from "@/lib/ai/providers";

export async function runLogisticsAiAnalysis() {
  const session = await requireSession();

  let provider: AiProvider = "gemini";
  if (!isProviderConfigured("gemini")) {
    if (isProviderConfigured("claude")) provider = "claude";
    else if (isProviderConfigured("chatgpt")) provider = "chatgpt";
    else {
      return { error: "No hay ningún proveedor de IA configurado (Faltan API Keys en .env)" };
    }
  }

  // Obtenemos los gastos del último mes para el análisis
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const expenses = await prisma.logisticsExpense.findMany({
    where: {
      tenantId: session.tenantId,
      createdAt: { gte: lastMonth }
    },
    include: {
      provider: true,
      trip: true
    }
  });

  if (expenses.length === 0) {
    return { analysis: "No hay suficientes gastos registrados en el último mes para realizar un análisis significativo." };
  }

  const systemPrompt = `
Eres el Director Financiero y Auditor Logístico del Club Sportivo Trinidense (primera división de Paraguay).
Tu objetivo es analizar los gastos operativos, logísticos y de viajes del club.
Debes buscar anomalías, altos costos, e identificar oportunidades de ahorro.
El reporte debe ser escrito en español sudamericano, profesional y directo.
Usa formato Markdown.
Usa negritas para destacar métricas clave.
La estructura sugerida:
1. Resumen Ejecutivo
2. Principales Fugas de Capital o Áreas Costosas
3. Recomendaciones de Ahorro para la Comisión Directiva
`;

  const expenseDataStr = expenses.map(e => 
    `- ${e.createdAt.toISOString().slice(0, 10)} | ${e.category} | ${e.description} | Costo: $${e.amount.toString()} | Proveedor: ${e.provider?.name || 'N/A'} | Viaje: ${e.trip?.destination || 'N/A'} | Estado: ${e.status}`
  ).join("\n");

  const userMessage = `
Aquí están los gastos operativos del último mes:
${expenseDataStr}

Por favor genera el reporte de eficiencia financiera.
`;

  try {
    const response = await askProvider(provider, systemPrompt, [{ role: "user", content: userMessage }]);
    return { analysis: response };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error al generar el reporte con IA." };
  }
}
