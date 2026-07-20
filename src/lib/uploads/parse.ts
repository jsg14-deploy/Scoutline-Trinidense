import "server-only";
import Papa from "papaparse";
import * as XLSX from "xlsx";

export type ParsedSheet = { columns: string[]; rows: Record<string, string>[] };

// Exports reales (ej. SICS.tv) suelen traer una fila de título arriba de los
// encabezados ("SICS.tv-SmartSearch" en la fila 0, encabezados recién en la
// fila 1) — asumir que la fila 0 siempre es el header rompía el mapeo de
// columnas. Buscamos entre las primeras filas cuál tiene más celdas no vacías
// y la tratamos como el encabezado real.
function detectHeaderRowIndex(matrix: unknown[][]): number {
  const searchLimit = Math.min(matrix.length, 10);
  let bestIndex = 0;
  let bestScore = -1;
  for (let i = 0; i < searchLimit; i++) {
    const row = matrix[i] ?? [];
    const nonEmpty = row.filter((cell) => String(cell ?? "").trim() !== "").length;
    if (nonEmpty > bestScore) {
      bestScore = nonEmpty;
      bestIndex = i;
    }
  }
  return bestIndex;
}

function matrixToSheet(matrix: unknown[][]): ParsedSheet {
  const headerIndex = detectHeaderRowIndex(matrix);
  const headerRow = matrix[headerIndex] ?? [];

  const seen = new Map<string, number>();
  const columns = headerRow.map((cell, i) => {
    const label = String(cell ?? "").trim() || `Columna ${i + 1}`;
    const count = seen.get(label) ?? 0;
    seen.set(label, count + 1);
    return count === 0 ? label : `${label} (${count + 1})`;
  });

  const rows: Record<string, string>[] = [];
  for (let r = headerIndex + 1; r < matrix.length; r++) {
    const rawRow = matrix[r] ?? [];
    const isEmpty = rawRow.every((cell) => String(cell ?? "").trim() === "");
    if (isEmpty) continue;
    const row: Record<string, string> = {};
    columns.forEach((col, i) => {
      row[col] = String(rawRow[i] ?? "");
    });
    rows.push(row);
  }

  return { columns, rows };
}

export async function parseSpreadsheet(file: File): Promise<ParsedSheet> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const isCsv = file.name.toLowerCase().endsWith(".csv");

  if (isCsv) {
    const text = buffer.toString("utf-8");
    const result = Papa.parse<string[]>(text, { skipEmptyLines: true });
    return matrixToSheet(result.data);
  }

  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" });
  return matrixToSheet(matrix);
}

export function applyColumnMapping(
  rows: Record<string, string>[],
  mapping: Record<string, string>,
): Record<string, string>[] {
  const sourceColumns = Object.entries(mapping).filter(([, standardKey]) => standardKey);
  return rows.map((row) => {
    const mapped: Record<string, string> = {};
    for (const [sourceColumn, standardKey] of sourceColumns) {
      mapped[standardKey] = row[sourceColumn] ?? "";
    }
    return mapped;
  });
}
