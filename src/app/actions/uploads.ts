"use server";

import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { parseSpreadsheet, applyColumnMapping } from "@/lib/uploads/parse";
import { ingestMatchEvents } from "@/lib/uploads/ingestMatchEvents";
import { ingestPlayerReport } from "@/lib/uploads/ingestPlayerReport";
import { ingestSalaryReport } from "@/lib/uploads/ingestSalary";
import { ingestNutritionReport } from "@/lib/uploads/ingestNutrition";
import { ingestMedicalReport } from "@/lib/uploads/ingestMedical";

export type PreviewResult = {
  filename: string;
  columns: string[];
  previewRows: Record<string, string>[];
  rowCount: number;
  savedMappings: Record<string, string>;
};

export async function previewUpload(formData: FormData): Promise<PreviewResult> {
  const session = await requireSession();
  const file = formData.get("file") as File | null;
  if (!file) throw new Error("No se recibió ningún archivo.");

  const { columns, rows } = await parseSpreadsheet(file);

  const savedMappingRows = await prisma.columnMapping.findMany({ where: { tenantId: session.tenantId } });
  const savedMappings = Object.fromEntries(savedMappingRows.map((m) => [m.sourceColumn, m.standardName]));

  return {
    filename: file.name,
    columns,
    previewRows: rows.slice(0, 8),
    rowCount: rows.length,
    savedMappings,
  };
}

export type CommitUploadState = { error?: string; success?: boolean; summary?: string } | undefined;

export async function commitPhysicalUpload(_state: CommitUploadState, formData: FormData): Promise<CommitUploadState> {
  const session = await requireSession();

  const file = formData.get("file") as File | null;
  const mapping = JSON.parse(String(formData.get("mapping") ?? "{}")) as Record<string, string>;
  const playerRef = String(formData.get("player_ref") ?? "").trim();
  const sessionDate = String(formData.get("session_date") ?? "");
  const deviceOrTool = String(formData.get("device") ?? "") || null;

  if (!file || !playerRef || !sessionDate) {
    return { error: "Faltan datos requeridos (jugador, fecha o archivo)." };
  }

  const { rows } = await parseSpreadsheet(file);
  const mappedRows = applyColumnMapping(rows, mapping);

  await prisma.dataUploadSession.create({
    data: {
      tenantId: session.tenantId,
      kind: "physical",
      playerRef,
      sessionDate: new Date(sessionDate),
      sourceFilename: file.name,
      deviceOrTool,
      rowsJson: mappedRows,
    },
  });

  await saveColumnMappings(session.tenantId, mapping);

  return { success: true, summary: `Sesión física de ${playerRef} cargada (${mappedRows.length} filas).` };
}

export async function commitMatchEventUpload(
  _state: CommitUploadState,
  formData: FormData,
): Promise<CommitUploadState> {
  const session = await requireSession();

  const file = formData.get("file") as File | null;
  const mapping = JSON.parse(String(formData.get("mapping") ?? "{}")) as Record<string, string>;
  const teamName = String(formData.get("team_name") ?? "").trim();
  const opponentName = String(formData.get("opponent_name") ?? "").trim();
  const leagueName = String(formData.get("league_name") ?? "").trim();
  const leagueCountry = String(formData.get("league_country") ?? "").trim();
  const season = String(formData.get("season") ?? "").trim();
  const matchDate = String(formData.get("match_date") ?? "");

  if (!file || !teamName || !opponentName || !leagueName || !leagueCountry || !season || !matchDate) {
    return { error: "Faltan datos requeridos del partido (equipo, rival, liga, temporada o fecha)." };
  }

  const { rows } = await parseSpreadsheet(file);
  const mappedRows = applyColumnMapping(rows, mapping);

  await prisma.dataUploadSession.create({
    data: {
      tenantId: session.tenantId,
      kind: "match_events",
      playerRef: teamName,
      sessionDate: new Date(matchDate),
      sourceFilename: file.name,
      rowsJson: mappedRows,
    },
  });

  const result = await ingestMatchEvents(mappedRows, {
    teamName,
    opponentName,
    leagueName,
    leagueCountry,
    season,
    matchDate: new Date(matchDate),
  });

  await saveColumnMappings(session.tenantId, mapping);

  return {
    success: true,
    summary: `Partido cargado: ${result.eventsCreated} eventos, ${result.playersTouched} jugadores actualizados.`,
  };
}

export async function commitPlayerReportUpload(
  _state: CommitUploadState,
  formData: FormData,
): Promise<CommitUploadState> {
  const session = await requireSession();

  const file = formData.get("file") as File | null;
  const mapping = JSON.parse(String(formData.get("mapping") ?? "{}")) as Record<string, string>;
  const season = String(formData.get("season") ?? "").trim();

  if (!file || !season) {
    return { error: "Faltan datos requeridos (temporada o archivo)." };
  }

  const { rows } = await parseSpreadsheet(file);
  const mappedRows = applyColumnMapping(rows, mapping);

  await prisma.dataUploadSession.create({
    data: {
      tenantId: session.tenantId,
      kind: "player_report",
      playerRef: `Reporte SICS SmartSearch (${mappedRows.length} jugadores)`,
      sessionDate: new Date(),
      sourceFilename: file.name,
      rowsJson: mappedRows,
    },
  });

  const result = await ingestPlayerReport(mappedRows, { season });

  await saveColumnMappings(session.tenantId, mapping);

  return {
    success: true,
    summary: `Reporte cargado: ${result.playersProcessed} jugadores actualizados.`,
  };
}

async function saveColumnMappings(tenantId: string, mapping: Record<string, string>) {
  const entries = Object.entries(mapping).filter(([, standardKey]) => standardKey);
  for (const [sourceColumn, standardName] of entries) {
    await prisma.columnMapping.upsert({
      where: { tenantId_sourceColumn: { tenantId, sourceColumn } },
      update: { standardName },
      create: { tenantId, sourceColumn, standardName },
    });
  }
}

export async function commitSalaryUpload(
  _state: CommitUploadState,
  formData: FormData,
): Promise<CommitUploadState> {
  const session = await requireSession();

  const file = formData.get("file") as File | null;
  const mapping = JSON.parse(String(formData.get("mapping") ?? "{}")) as Record<string, string>;
  const season = String(formData.get("season") ?? "").trim();

  if (!file || !season) {
    return { error: "Faltan datos requeridos (temporada o archivo)." };
  }

  const { rows } = await parseSpreadsheet(file);
  const mappedRows = applyColumnMapping(rows, mapping);

  await prisma.dataUploadSession.create({
    data: {
      tenantId: session.tenantId,
      kind: "player_report", // We'll represent it as player_report kind or physical
      playerRef: `Financiero / Sueldos (${mappedRows.length} filas)`,
      sessionDate: new Date(),
      sourceFilename: file.name,
      rowsJson: mappedRows,
    },
  });

  const result = await ingestSalaryReport(mappedRows, { tenantId: session.tenantId, season });

  await saveColumnMappings(session.tenantId, mapping);

  return {
    success: true,
    summary: `Salarios cargados: ${result.matched} salarios vinculados, ${result.unmatched.length} no encontrados, ${result.ambiguous.length} ambiguos.`,
  };
}

export async function commitNutritionUpload(
  _state: CommitUploadState,
  formData: FormData,
): Promise<CommitUploadState> {
  const session = await requireSession();

  const file = formData.get("file") as File | null;
  const mapping = JSON.parse(String(formData.get("mapping") ?? "{}")) as Record<string, string>;

  if (!file) {
    return { error: "Falta el archivo requerido." };
  }

  const { rows } = await parseSpreadsheet(file);
  const mappedRows = applyColumnMapping(rows, mapping);

  await prisma.dataUploadSession.create({
    data: {
      tenantId: session.tenantId,
      kind: "physical",
      playerRef: `Nutrición / Pliegues (${mappedRows.length} filas)`,
      sessionDate: new Date(),
      sourceFilename: file.name,
      rowsJson: mappedRows,
    },
  });

  const result = await ingestNutritionReport(mappedRows, { tenantId: session.tenantId });

  await saveColumnMappings(session.tenantId, mapping);

  return {
    success: true,
    summary: `Nutrición: ${result.matched} mediciones de pliegues cargadas con éxito.`,
  };
}

export async function commitMedicalUpload(
  _state: CommitUploadState,
  formData: FormData,
): Promise<CommitUploadState> {
  const session = await requireSession();

  const file = formData.get("file") as File | null;
  const mapping = JSON.parse(String(formData.get("mapping") ?? "{}")) as Record<string, string>;

  if (!file) {
    return { error: "Falta el archivo de lesiones." };
  }

  const { rows } = await parseSpreadsheet(file);
  const mappedRows = applyColumnMapping(rows, mapping);

  await prisma.dataUploadSession.create({
    data: {
      tenantId: session.tenantId,
      kind: "physical",
      playerRef: `Médico / Lesiones (${mappedRows.length} filas)`,
      sessionDate: new Date(),
      sourceFilename: file.name,
      rowsJson: mappedRows,
    },
  });

  const result = await ingestMedicalReport(mappedRows, { tenantId: session.tenantId });

  await saveColumnMappings(session.tenantId, mapping);

  return {
    success: true,
    summary: `Médico: ${result.matched} reportes de lesiones/kinesiología cargados.`,
  };
}
