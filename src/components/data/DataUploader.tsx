"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  previewUpload,
  commitPhysicalUpload,
  commitMatchEventUpload,
  commitPlayerReportUpload,
  commitSalaryUpload,
  commitNutritionUpload,
  commitMedicalUpload,
  type PreviewResult,
  type CommitUploadState,
} from "@/app/actions/uploads";
import {
  PHYSICAL_STANDARD_VARS,
  MATCH_EVENT_STANDARD_VARS,
  PLAYER_REPORT_STANDARD_VARS,
  PLAYER_REPORT_COLUMN_SYNONYMS,
  SALARY_STANDARD_VARS,
  NUTRITION_STANDARD_VARS,
  MEDICAL_STANDARD_VARS,
} from "@/lib/uploads/standardVars";

type Kind = "physical" | "match_events" | "player_report" | "salary" | "nutrition" | "medical";

const COMMIT_ACTIONS = {
  physical: commitPhysicalUpload,
  match_events: commitMatchEventUpload,
  player_report: commitPlayerReportUpload,
  salary: commitSalaryUpload,
  nutrition: commitNutritionUpload,
  medical: commitMedicalUpload,
};

const STANDARD_VARS = {
  physical: PHYSICAL_STANDARD_VARS,
  match_events: MATCH_EVENT_STANDARD_VARS,
  player_report: PLAYER_REPORT_STANDARD_VARS,
  salary: SALARY_STANDARD_VARS,
  nutrition: NUTRITION_STANDARD_VARS,
  medical: MEDICAL_STANDARD_VARS,
};

interface DataUploaderProps {
  allowedKinds?: Kind[];
  defaultKind?: Kind;
}

export function DataUploader({ allowedKinds, defaultKind }: DataUploaderProps = {}) {
  const [kind, setKind] = useState<Kind>(defaultKind ?? "player_report");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [loadingPreview, setLoadingPreview] = useState(false);

  const commitAction = COMMIT_ACTIONS[kind];
  const [state, formAction, pending] = useActionState(commitAction, undefined);
  const standardVars = STANDARD_VARS[kind];

  // Al confirmarse la carga, volvemos a la pantalla de "elegir archivo" en vez
  // de dejar la tabla de mapeo visible con los selectores ya vaciados.
  const lastHandledSuccess = useRef<CommitUploadState>(undefined);
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
        initialMapping[col] =
          result.savedMappings[col] ?? guessMapping(col, standardVars.map((v) => v.key), kind);
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

  const mappedRequiredKeys = new Set(Object.values(mapping).filter(Boolean));
  const missingRequired = standardVars.filter((v) => v.required && !mappedRequiredKeys.has(v.key));

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap gap-2">
        {(!allowedKinds || allowedKinds.includes("player_report")) && (
          <KindButton active={kind === "player_report"} onClick={() => resetKind(setKind, setFile, setPreview, "player_report")}>
            Reporte de jugadores (SICS)
          </KindButton>
        )}
        {(!allowedKinds || allowedKinds.includes("match_events")) && (
          <KindButton active={kind === "match_events"} onClick={() => resetKind(setKind, setFile, setPreview, "match_events")}>
            Eventos de partido (SICS)
          </KindButton>
        )}
        {(!allowedKinds || allowedKinds.includes("physical")) && (
          <KindButton active={kind === "physical"} onClick={() => resetKind(setKind, setFile, setPreview, "physical")}>
            Datos físicos (GPS)
          </KindButton>
        )}
        {(!allowedKinds || allowedKinds.includes("nutrition")) && (
          <KindButton active={kind === "nutrition"} onClick={() => resetKind(setKind, setFile, setPreview, "nutrition")}>
            Nutrición (Pliegues)
          </KindButton>
        )}
        {(!allowedKinds || allowedKinds.includes("medical")) && (
          <KindButton active={kind === "medical"} onClick={() => resetKind(setKind, setFile, setPreview, "medical")}>
            Médico / Lesiones
          </KindButton>
        )}
        {(!allowedKinds || allowedKinds.includes("salary")) && (
          <KindButton active={kind === "salary"} onClick={() => resetKind(setKind, setFile, setPreview, "salary")}>
            Financiero (Sueldos)
          </KindButton>
        )}
      </div>

      {state?.success && <p className="text-sm text-positive">{state.summary}</p>}

      {!preview && (
        <div className="rounded-2xl border border-dashed border-border-2 bg-card p-10 text-center">
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            id="file-input"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
            }}
          />
          <label htmlFor="file-input" className="cursor-pointer text-sm font-medium text-text hover:underline">
            {loadingPreview ? "Leyendo archivo…" : "Elegir archivo CSV o Excel"}
          </label>
          <p className="mt-2 text-xs text-muted">
            {kind === "player_report"
              ? "Un archivo = una lista de jugadores. Compatible con exports de SICS.tv SmartSearch en CSV/Excel."
              : kind === "match_events"
                ? "Un archivo = un partido. Compatible con exports de SICS en CSV/Excel."
                : kind === "physical"
                  ? "Compatible con Catapult, STATSports, Wimu, GPExe y cualquier CSV/Excel."
                  : kind === "nutrition"
                    ? "Subí pliegues antropométricos de los jugadores. Se autocalculará el % de grasa con Yuhasz."
                    : kind === "medical"
                      ? "Cargá los reportes médicos de lesiones y kinesiológicos de tus jugadores."
                      : "Vinculá los sueldos mensuales actuales de tu plantel."}
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

            {kind === "player_report" ? (
              <PlayerReportMetaFields />
            ) : kind === "match_events" ? (
              <MatchMetaFields />
            ) : kind === "physical" ? (
              <PhysicalMetaFields />
            ) : kind === "salary" ? (
              <SalaryMetaFields />
            ) : null}
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
                        {standardVars.map((v) => (
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
            {pending ? "Procesando…" : "Cargar datos"}
          </button>
        </form>
      )}
    </div>
  );
}

function KindButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
        active ? "bg-navy text-white" : "border border-border bg-card text-muted hover:text-accent"
      }`}
    >
      {children}
    </button>
  );
}

function MatchMetaFields() {
  return (
    <div className="grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-3">
      <MetaInput name="team_name" label="Equipo (dueño del archivo)" placeholder="Sportivo Trinidense" />
      <MetaInput name="opponent_name" label="Rival" placeholder="Cerro Porteño" />
      <MetaInput name="league_name" label="Liga" placeholder="Primera División" />
      <MetaInput name="league_country" label="País de la liga" placeholder="Paraguay" />
      <MetaInput name="season" label="Temporada" placeholder="2026" />
      <MetaInput name="match_date" label="Fecha del partido" type="date" />
    </div>
  );
}

function PlayerReportMetaFields() {
  return (
    <div className="grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-3">
      <MetaInput name="season" label="Temporada" placeholder="2026" />
    </div>
  );
}

function PhysicalMetaFields() {
  return (
    <div className="grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-3">
      <MetaInput name="player_ref" label="Jugador" placeholder="Ríos, Iván" />
      <MetaInput name="session_date" label="Fecha de la sesión" type="date" />
      <MetaInput name="device" label="Dispositivo GPS" placeholder="Catapult" />
    </div>
  );
}

function SalaryMetaFields() {
  return (
    <div className="grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-3">
      <MetaInput name="season" label="Temporada" placeholder="2026" />
    </div>
  );
}

function MetaInput({
  name,
  label,
  placeholder,
  type = "text",
}: {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="grid gap-1">
      <label htmlFor={name} className="text-xs font-medium text-muted">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required
        className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent-2 focus:outline-none"
      />
    </div>
  );
}

function normalizeHeader(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, ""); // saca tildes para comparar sin acentos
}

function guessMapping(column: string, standardKeys: string[], kind: Kind): string {
  const normalized = normalizeHeader(column);
  const bySnakeCase = normalized.replace(/\s+/g, "_");
  const exact = standardKeys.find((k) => k === bySnakeCase);
  if (exact) return exact;

  if (kind === "player_report") {
    for (const [key, synonyms] of Object.entries(PLAYER_REPORT_COLUMN_SYNONYMS)) {
      if (!standardKeys.includes(key)) continue;
      if (synonyms.some((s) => normalizeHeader(s) === normalized)) return key;
    }
  }

  return "";
}

function resetKind(
  setKind: (k: Kind) => void,
  setFile: (f: File | null) => void,
  setPreview: (p: PreviewResult | null) => void,
  kind: Kind,
) {
  setKind(kind);
  setFile(null);
  setPreview(null);
}
