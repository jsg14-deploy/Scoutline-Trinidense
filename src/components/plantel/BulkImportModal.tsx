"use client";

import { useState, useRef, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileSpreadsheet, X, Check, AlertTriangle, Loader2, Download } from "lucide-react";
import { bulkImportSquadPlayers, type ImportRow } from "@/app/actions/squad";
import type { PositionGroup } from "@/generated/prisma/enums";

const POSITION_MAP: Record<string, PositionGroup> = {
  arquero: "GK", portero: "GK", goleiro: "GK", gk: "GK", goalkeeper: "GK",
  defensor: "DEF", defensa: "DEF", defender: "DEF", def: "DEF",
  mediocampista: "MID", medio: "MID", centrocampista: "MID", midfielder: "MID", mid: "MID",
  delantero: "FWD", forward: "FWD", atacante: "FWD", fwd: "FWD", striker: "FWD",
};

function parsePositionGroup(raw: string): PositionGroup {
  const normalized = raw.trim().toLowerCase();
  return POSITION_MAP[normalized] ?? "MID";
}

function parseCSV(text: string): ImportRow[] {
  const lines = text.split("\n").filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/\s+/g, "_"));
  const rows: ImportRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",");
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => { obj[h] = (values[idx] ?? "").trim(); });

    const name = obj.nombre || obj.name || obj.apellido || "";
    const posRaw = obj.posicion || obj.position || obj.pos || "MID";
    if (!name) continue;

    rows.push({
      name,
      positionGroup: parsePositionGroup(posRaw),
      nationality: obj.nacionalidad || obj.nationality || undefined,
      foot: obj.pie || obj.pie_habil || obj.foot || undefined,
      heightCm: obj.altura ? parseInt(obj.altura) : undefined,
      weightKg: obj.peso ? parseFloat(obj.peso) : undefined,
      shirtNumber: obj.numero || obj.shirt_number ? parseInt(obj.numero || obj.shirt_number) : undefined,
      contractExpiry: obj.contrato || obj.contract_expiry || undefined,
      marketValueEur: obj.valor_mercado || obj.market_value ? parseFloat(obj.valor_mercado || obj.market_value) : undefined,
      notes: obj.observaciones || obj.notes || undefined,
    });
  }

  return rows;
}

export function BulkImportModal({ onClose }: { onClose: () => void }) {
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [result, setResult] = useState<{ imported?: number; skipped?: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  async function processFile(file: File) {
    setError(null);
    setFileName(file.name);

    if (file.name.endsWith(".csv")) {
      const text = await file.text();
      const parsed = parseCSV(text);
      setRows(parsed);
    } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      try {
        const { read, utils } = await import("xlsx");
        const buffer = await file.arrayBuffer();
        const wb = read(buffer);
        const ws = wb.Sheets[wb.SheetNames[0]];
        const jsonData = utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });

        const parsed: ImportRow[] = jsonData.map(row => {
          const get = (...keys: string[]) => keys.map(k => String(row[k] ?? "")).find(v => v) ?? "";
          const name = get("Nombre", "nombre", "Name", "NOMBRE");
          const posRaw = get("Posicion", "Posición", "Position", "pos", "Pos");
          return {
            name,
            positionGroup: parsePositionGroup(posRaw || "MID"),
            nationality: get("Nacionalidad", "nationality") || undefined,
            foot: get("Pie", "Pie hábil", "foot") || undefined,
            heightCm: parseFloat(get("Altura", "height")) || undefined,
            weightKg: parseFloat(get("Peso", "weight")) || undefined,
            shirtNumber: parseInt(get("Numero", "Número", "shirt")) || undefined,
            contractExpiry: get("Contrato", "contract_expiry") || undefined,
            marketValueEur: parseFloat(get("Valor", "market_value")) || undefined,
            notes: get("Observaciones", "notes") || undefined,
          };
        }).filter(r => r.name);

        setRows(parsed);
      } catch {
        setError("No se pudo leer el archivo Excel. Asegurate de que sea un .xlsx válido.");
      }
    } else {
      setError("Formato no soportado. Usá .csv o .xlsx");
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function handleImport() {
    startTransition(async () => {
      const res = await bulkImportSquadPlayers(rows);
      if (res?.success) {
        setResult({ imported: res.imported, skipped: res.skipped });
        setRows([]);
      } else {
        setError(res?.error ?? "Error desconocido.");
      }
    });
  }

  function downloadTemplate() {
    const csv = [
      "Nombre,Posicion,Nacionalidad,Pie,Altura,Peso,Numero,Contrato,Valor_Mercado,Observaciones",
      "Jonathan Santana,Arquero,Paraguay,Derecho,188,80,1,2027-12-31,500000,Capitán del equipo",
      "Carlos López,Defensor,Argentina,Derecho,182,76,5,2026-06-30,,",
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "plantilla_jugadores.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-5 bg-surface">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 border border-accent/20">
              <FileSpreadsheet size={18} className="text-accent" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text">Importar Jugadores</h2>
              <p className="text-xs text-muted">CSV o Excel (.xlsx)</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted hover:text-text hover:bg-surface transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 grid gap-5">
          {/* Success state */}
          {result ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-8 gap-4 text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-positive/10 border border-positive/20">
                <Check size={24} className="text-positive" />
              </div>
              <div>
                <p className="font-bold text-text text-base">Importación completada</p>
                <p className="text-sm text-muted mt-1">
                  <span className="text-positive font-semibold">{result.imported} jugadores</span> importados ·{" "}
                  <span className="text-warn font-semibold">{result.skipped} omitidos</span> (duplicados o datos incompletos)
                </p>
              </div>
              <button onClick={onClose} className="rounded-lg bg-accent px-5 py-2 text-sm font-bold text-navy-deep hover:opacity-90">
                Cerrar
              </button>
            </motion.div>
          ) : (
            <>
              {/* Drop zone */}
              {!rows.length && (
                <div>
                  <div
                    onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center cursor-pointer transition-colors ${isDragging ? "border-accent bg-accent/5" : "border-border hover:border-border-2 hover:bg-surface"}`}
                  >
                    <input
                      ref={inputRef}
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); }}
                    />
                    <Upload size={28} className={isDragging ? "text-accent" : "text-muted"} />
                    <div>
                      <p className="text-sm font-semibold text-text">Arrastrá tu archivo aquí</p>
                      <p className="text-xs text-muted mt-1">o hacé click para seleccionar · CSV o Excel (.xlsx)</p>
                    </div>
                  </div>
                  <button
                    onClick={downloadTemplate}
                    className="mt-3 flex items-center gap-2 text-xs text-muted hover:text-accent transition-colors"
                  >
                    <Download size={12} />
                    Descargar plantilla CSV
                  </button>
                </div>
              )}

              {/* Preview */}
              {rows.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-text">
                      {rows.length} jugadores detectados en <span className="text-accent">{fileName}</span>
                    </p>
                    <button onClick={() => { setRows([]); setFileName(null); }} className="text-xs text-muted hover:text-text flex items-center gap-1">
                      <X size={11} /> Limpiar
                    </button>
                  </div>
                  <div className="overflow-auto rounded-xl border border-border bg-surface max-h-48">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border bg-card sticky top-0">
                          {["Nombre", "Posición", "Nac.", "Pie", "Altura", "Peso"].map(h => (
                            <th key={h} className="p-2.5 text-left font-semibold text-muted">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.slice(0, 20).map((row, i) => (
                          <tr key={i} className="border-b border-border last:border-0">
                            <td className="p-2.5 font-medium text-text">{row.name}</td>
                            <td className="p-2.5 text-muted">{row.positionGroup}</td>
                            <td className="p-2.5 text-muted">{row.nationality ?? "—"}</td>
                            <td className="p-2.5 text-muted">{row.foot ?? "—"}</td>
                            <td className="p-2.5 text-muted">{row.heightCm ?? "—"}</td>
                            <td className="p-2.5 text-muted">{row.weightKg ?? "—"}</td>
                          </tr>
                        ))}
                        {rows.length > 20 && (
                          <tr><td colSpan={6} className="p-2.5 text-center text-muted">+{rows.length - 20} más...</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-negative/10 border border-negative/20 px-4 py-3 text-sm text-negative">
                  <AlertTriangle size={14} />
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-1">
                {rows.length > 0 && (
                  <button
                    onClick={handleImport}
                    disabled={isPending}
                    className="flex items-center gap-2 rounded-lg bg-accent px-5 py-2 text-sm font-bold text-navy-deep hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    {isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    {isPending ? "Importando..." : `Importar ${rows.length} jugadores`}
                  </button>
                )}
                <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:text-text transition-colors">
                  Cancelar
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
