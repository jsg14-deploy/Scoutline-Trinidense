"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { parseSpreadsheet, applyColumnMapping } from "@/lib/uploads/parse";
import { ingestSalaryReport } from "@/lib/uploads/ingestSalary";
import { loadSalaryRows } from "@/lib/finance/loadSalaryRows";
import { askProvider } from "@/lib/ai/providers";

export type CommitSalaryState =
  | { error?: string; success?: boolean; summary?: string; unmatched?: string[]; ambiguous?: string[] }
  | undefined;

export async function commitSalaryUpload(
  _state: CommitSalaryState,
  formData: FormData,
): Promise<CommitSalaryState> {
  const session = await requireSession();

  const file = formData.get("file") as File | null;
  const mapping = JSON.parse(String(formData.get("mapping") ?? "{}")) as Record<string, string>;
  const season = String(formData.get("season") ?? "").trim();

  if (!file || !season) {
    return { error: "Faltan datos requeridos (temporada o archivo)." };
  }

  const { rows } = await parseSpreadsheet(file);
  const mappedRows = applyColumnMapping(rows, mapping);

  const result = await ingestSalaryReport(mappedRows, { tenantId: session.tenantId, season });

  const entries = Object.entries(mapping).filter(([, standardKey]) => standardKey);
  for (const [sourceColumn, standardName] of entries) {
    await prisma.columnMapping.upsert({
      where: { tenantId_sourceColumn: { tenantId: session.tenantId, sourceColumn } },
      update: { standardName },
      create: { tenantId: session.tenantId, sourceColumn, standardName },
    });
  }

  revalidatePath("/financiero");

  const parts = [`${result.matched} jugadores actualizados`];
  if (result.unmatched.length > 0) parts.push(`${result.unmatched.length} sin encontrar en el catálogo`);
  if (result.ambiguous.length > 0) parts.push(`${result.ambiguous.length} con nombre ambiguo`);

  return {
    success: true,
    summary: `Planilla de salarios cargada: ${parts.join(", ")}.`,
    unmatched: result.unmatched,
    ambiguous: result.ambiguous,
  };
}

export type CreateSalaryInput = {
  playerId: string;
  season: string;
  monthlySalary: number;
  currency: string;
  notes?: string;
};

export async function createSalaryManual(input: CreateSalaryInput) {
  const session = await requireSession();
  await prisma.playerSalary.upsert({
    where: {
      tenantId_playerId_season: { tenantId: session.tenantId, playerId: input.playerId, season: input.season },
    },
    update: { monthlySalary: input.monthlySalary, currency: input.currency, notes: input.notes || null },
    create: {
      tenantId: session.tenantId,
      playerId: input.playerId,
      season: input.season,
      monthlySalary: input.monthlySalary,
      currency: input.currency,
      notes: input.notes || null,
    },
  });
  revalidatePath("/financiero");
}

export async function deleteSalary(salaryId: string) {
  const session = await requireSession();
  await prisma.playerSalary.deleteMany({ where: { id: salaryId, tenantId: session.tenantId } });
  revalidatePath("/financiero");
}

const FINANCE_SYSTEM_PROMPT = `Sos el asistente financiero de "Scoutline Trinidense", una plataforma de scouting de fútbol.
Tu trabajo es analizar el costo salarial de la plantilla que se te da como contexto (salario mensual, costo de
temporada, minutos jugados y costo por minuto jugado) y responder preguntas o dar recomendaciones basadas
únicamente en esos datos. Respondé en español, de forma concisa y concreta, citando nombres y números reales del
contexto — no inventes jugadores ni cifras que no estén ahí. Si el contexto no alcanza para responder algo con
precisión, decilo explícitamente. El costo de temporada asume salario mensual × 12 (contrato de año completo);
aclarálo si es relevante para la respuesta.

Formato de la respuesta: texto plano en párrafos cortos, sin encabezados markdown ("#", "##") ni tablas
("| col |"). Si necesitás comparar varios jugadores, usá una lista simple con guiones ("- Jugador: dato"). Podés
usar **negrita** para resaltar un nombre o número clave — es lo único que la interfaz renderiza con formato, el
resto se muestra como texto plano tal cual lo escribas.`;

// Sin historial de turnos (a diferencia del asistente de /assistant): cada
// pregunta es independiente, mismo patrón "un botón, una respuesta" que el
// análisis de video con IA — más simple porque acá no hace falta mantener
// una conversación, alcanza con re-consultar los datos actuales cada vez.
export async function askFinanceAssistant(question: string): Promise<{ reply: string } | { error: string }> {
  const session = await requireSession();

  try {
    const rows = await loadSalaryRows(session.tenantId);
    if (rows.length === 0) {
      return { error: "Todavía no hay salarios cargados — subí una planilla o agregá un jugador puntual primero." };
    }

    const sorted = [...rows].sort((a, b) => (b.costPerMinute ?? -1) - (a.costPerMinute ?? -1));
    const lines = sorted.map(
      (r) =>
        `- ${r.playerName} | ${r.teamName ?? "sin equipo"} | temporada ${r.season} | salario mensual ${r.currency} ${Math.round(
          r.monthlySalary,
        ).toLocaleString("es-PY")} | costo de temporada ${r.currency} ${Math.round(r.seasonCost).toLocaleString("es-PY")} | ${
          r.minutesPlayed !== null
            ? `${r.minutesPlayed} minutos jugados | costo por minuto ${r.currency} ${Math.round(r.costPerMinute ?? 0).toLocaleString("es-PY")}`
            : "sin minutos jugados cargados"
        }`,
    );

    const systemPrompt = `${FINANCE_SYSTEM_PROMPT}\n\nDatos financieros cargados (${rows.length} registros, ordenados de mayor a menor costo por minuto):\n${lines.join("\n")}`;

    const userQuestion =
      question.trim() ||
      "Dame un análisis general de la eficiencia de costos de mi plantilla, destacando los casos más llamativos (más caros y más eficientes por minuto) y alguna recomendación.";

    const reply = await askProvider("claude", systemPrompt, [{ role: "user", content: userQuestion }]);
    return { reply };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido al consultar la IA." };
  }
}
