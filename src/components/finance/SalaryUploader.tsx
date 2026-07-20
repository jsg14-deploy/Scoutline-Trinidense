"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { previewUpload, type PreviewResult } from "@/app/actions/uploads";
import { commitSalaryUpload, type CommitSalaryState } from "@/app/actions/finance";
import { SALARY_STANDARD_VARS, SALARY_COLUMN_SYNONYMS } from "@/lib/uploads/standardVars";

function normalizeHeader(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function guessMapping(column: string): string {
  const normalized = normalizeHeader(column);
  const bySnakeCase = normalized.replace(/\s+/g, "_");
  const exact = SALARY_STANDARD_VARS.find((v) => v.key === bySnakeCase);
  if (exact) return exact.key;

  for (const [key, synonyms] of Object.entries(SALARY_COLUMN_SYNONYMS)) {
    if (synonyms.some((s) => normalizeHeader(s) === normalized)) return key;
  }
  return "";
}

export function SalaryUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [loadingPreview, setLoadingPreview] = useState(false);

  const [state, formAction, pending] = useActionState(commitSalaryUpload, undefined);

  const lastHandledSuccess = useRef<CommitSalaryState>(undefined);
  useEffect(() => {
    if (state?.success && state !== lastHandledSuccess.current) {
      lastHandledSuccess.current = state;
      setFile(null);
      setPreview(null);
      setMapping({});
    }
  }, [state]);

  async function handleFile(selected: File) {
    setFile(selected);
    setPreview(null);
    setLoadingPreview(true);
    try {
      const fd = new FormData();
      fd.set("file", selected);
      const result = await previewUpload(fd);
      setPreview(result);

      const initialMapping: Record<string, string> = {};
      for (const col of result.columns) {
        initialMapping[col] = result.savedMappings[col] ?? guessMapping(col);
      }
      setMapping(initialMapping);
    } finally {
      setLoadingPreview(false);
    }
  }

  function handleSubmit(formData: FormData) {
    if (!file) return;
    formData.set("file", file);
    formData.set("mapping", JSON.stringify(mapping));
    formAction(formData);
  }

  const mappedKeys = new Set(Object.values(mapping).filter(Boolean));
  const missingRequired = SALARY_STANDARD_VARS.filter((v) => v.required && !mappedKeys.has(v.key));

  return (
    <div className="grid gap-6">
      {state?.success && (
        <div className="grid gap-1 rounded-lg border border-positive/30 bg-positive/10 p-3">
          <p className="text-sm text-positive">{state.summary}</p>
          {state.unmatched && state.unmatched.length > 0 && (
            <p className="text-xs text-warn">Sin encontrar en el catálogo: {state.unmatched.join(", ")}</p>
          )}
          {state.ambiguous && state.ambiguous.length > 0 && (
            <p className="text-xs text-warn">Nombre ambiguo (más de un jugador coincide): {state.ambiguous.join(", ")}</p>
          )}
        </div>
      )}

      {!preview && (
        <div className="rounded-2xl border border-dashed border-border-2 bg-card p-10 text-center">
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            id="salary-file-input"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
            }}
          />
          <label htmlFor="salary-file-input" className="cursor-pointer text-sm font-medium text-text hover:underline">
            {loadingPreview ? "Leyendo archivo…" : "Elegir planilla de salarios (CSV o Excel)"}
          </label>
          <p className="mt-2 text-xs text-muted">
            Una fila = un jugador. Columnas esperadas: nombre del jugador y salario mensual (la moneda es opcional,
            USD por defecto). El jugador tiene que existir ya en tu catálogo de Scouting/Datos.
          </p>
        </div>
      )}

      {preview && (
        <form action={handleSubmit} className="grid gap-6">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-text">{preview.filename}</p>
                <p className="text-xs text-muted">
                  {preview.rowCount} filas · {preview.columns.length} columnas
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                }}
                className="text-xs font-medium text-muted hover:text-accent"
              >
                Cambiar archivo
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-3">
              <div className="grid gap-1">
                <label htmlFor="season" className="text-xs font-medium text-muted">
                  Temporada
                </label>
                <input
                  id="season"
                  name="season"
                  placeholder="2026"
                  required
                  className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent-2 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="p-3 text-left text-xs font-semibold text-muted">Columna del archivo</th>
                  <th className="p-3 text-left text-xs font-semibold text-muted">Ejemplo</th>
                  <th className="p-3 text-left text-xs font-semibold text-muted">Variable estándar</th>
                </tr>
              </thead>
              <tbody>
                {preview.columns.map((col) => (
                  <tr key={col} className="border-b border-border last:border-b-0">
                    <td className="p-3 font-mono text-xs text-text">{col}</td>
                    <td className="p-3 text-xs text-muted">{preview.previewRows[0]?.[col] ?? "—"}</td>
                    <td className="p-3">
                      <select
                        value={mapping[col] ?? ""}
                        onChange={(e) => setMapping((m) => ({ ...m, [col]: e.target.value }))}
                        className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-xs text-text focus:border-accent-2 focus:outline-none"
                      >
                        <option value="">(ignorar)</option>
                        {SALARY_STANDARD_VARS.map((v) => (
                          <option key={v.key} value={v.key}>
                            {v.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {missingRequired.length > 0 && (
            <p className="text-xs text-negative">
              Faltan mapear campos requeridos: {missingRequired.map((v) => v.label).join(", ")}.
            </p>
          )}

          {state?.error && <p className="text-sm text-negative">{state.error}</p>}

          <button
            type="submit"
            disabled={pending || missingRequired.length > 0}
            className="justify-self-start rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "Procesando…" : "Cargar planilla"}
          </button>
        </form>
      )}
    </div>
  );
}
