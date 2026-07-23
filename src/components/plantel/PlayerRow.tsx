"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useTransition } from "react";
import {
  Pencil, Trash2, X, Check, Loader2, ChevronDown, ChevronUp, ShieldAlert, Shield
} from "lucide-react";
import { updateSquadPlayer, deleteSquadPlayer } from "@/app/actions/squad";
import type { PositionGroup } from "@/generated/prisma/enums";

type Player = {
  id: string;
  name: string;
  nationality: string | null;
  positionGroup: PositionGroup;
  foot: string | null;
  heightCm: number | null;
  weightKg: number | null;
  shirtNumber: number | null;
  contractExpiry: Date | null;
  notes: string | null;
  salaries: { monthlySalary: number | string; currency: string }[];
  injuries: { type?: string; diagnosis: string }[];
  skinfoldMeasurements: { bodyFatPercent: number | null }[];
};

const POSITION_LABELS: Record<PositionGroup, string> = {
  GK: "Arquero", DEF: "Defensor", MID: "Mediocampista", FWD: "Delantero",
};

const POSITION_COLORS: Record<PositionGroup, string> = {
  GK: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  DEF: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  MID: "bg-green-500/15 text-green-400 border-green-500/30",
  FWD: "bg-red-500/15 text-red-400 border-red-500/30",
};

export function PlayerRow({ player, index }: { player: Player; index: number }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  const salary = player.salaries[0];
  const injury = player.injuries[0];
  const skinfold = player.skinfoldMeasurements[0];

  const [editData, setEditData] = useState({
    name: player.name,
    nationality: player.nationality ?? "",
    foot: player.foot ?? "",
    heightCm: player.heightCm?.toString() ?? "",
    weightKg: player.weightKg?.toString() ?? "",
    shirtNumber: player.shirtNumber?.toString() ?? "",
    notes: player.notes ?? "",
  });

  function handleSave() {
    startTransition(async () => {
      await updateSquadPlayer(player.id, {
        name: editData.name || player.name,
        nationality: editData.nationality || null,
        foot: editData.foot || null,
        heightCm: editData.heightCm ? parseInt(editData.heightCm) : null,
        weightKg: editData.weightKg ? parseFloat(editData.weightKg) : null,
        shirtNumber: editData.shirtNumber ? parseInt(editData.shirtNumber) : null,
        notes: editData.notes || null,
      });
      setIsEditing(false);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteSquadPlayer(player.id);
      setShowDelete(false);
    });
  }

  return (
    <>
      <motion.tr
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03, duration: 0.3 }}
        className="border-b border-border last:border-0 hover:bg-surface/60 transition-colors group"
      >
        {/* Número */}
        <td className="p-3 text-center">
          <span className="text-sm font-mono font-bold text-muted">
            {player.shirtNumber ?? "—"}
          </span>
        </td>

        {/* Jugador */}
        <td className="p-3">
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-text text-sm">{player.name}</span>
            {player.notes && (
              <span className="text-[10px] text-muted truncate max-w-[180px]">{player.notes}</span>
            )}
          </div>
        </td>

        {/* Posición */}
        <td className="p-3">
          <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${POSITION_COLORS[player.positionGroup]}`}>
            {POSITION_LABELS[player.positionGroup]}
          </span>
        </td>

        {/* Nacionalidad */}
        <td className="p-3 text-sm text-muted">{player.nationality ?? "—"}</td>

        {/* Físico */}
        <td className="p-3 text-sm text-muted text-center tabular-nums">
          {player.heightCm ? `${player.heightCm}cm` : "—"}
          {player.weightKg ? ` · ${player.weightKg}kg` : ""}
        </td>

        {/* Estado Médico */}
        <td className="p-3 text-center">
          {injury ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-negative/10 border border-negative/20 px-2 py-0.5 text-[11px] font-semibold text-negative">
              <ShieldAlert size={10} />
              Lesionado
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-positive/10 border border-positive/20 px-2 py-0.5 text-[11px] font-semibold text-positive">
              <Shield size={10} />
              Apto
            </span>
          )}
        </td>

        {/* % Grasa */}
        <td className="p-3 text-sm text-muted text-center tabular-nums">
          {skinfold?.bodyFatPercent ? `${skinfold.bodyFatPercent}%` : "—"}
        </td>

        {/* Salario */}
        <td className="p-3 text-sm text-center tabular-nums">
          {salary ? (
            <span className="font-mono text-accent font-semibold">
              {salary.currency} {Math.round(Number(salary.monthlySalary)).toLocaleString("es-PY")}
            </span>
          ) : "—"}
        </td>

        {/* Acciones */}
        <td className="p-3">
          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="rounded-md p-1.5 text-muted hover:text-accent hover:bg-accent/10 transition-colors"
              title="Editar"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={() => setShowDelete(true)}
              className="rounded-md p-1.5 text-muted hover:text-negative hover:bg-negative/10 transition-colors"
              title="Eliminar"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </td>
      </motion.tr>

      {/* Inline edit row */}
      <AnimatePresence>
        {isEditing && (
          <motion.tr
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-surface border-b border-border"
          >
            <td colSpan={9} className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-3">
                {[
                  { key: "name", label: "Nombre", type: "text" },
                  { key: "nationality", label: "Nacionalidad", type: "text" },
                  { key: "foot", label: "Pie hábil", type: "text" },
                  { key: "heightCm", label: "Altura (cm)", type: "number" },
                  { key: "weightKg", label: "Peso (kg)", type: "number" },
                  { key: "shirtNumber", label: "Número", type: "number" },
                ].map(({ key, label, type }) => (
                  <div key={key} className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">{label}</label>
                    <input
                      type={type}
                      value={editData[key as keyof typeof editData]}
                      onChange={(e) => setEditData(prev => ({ ...prev, [key]: e.target.value }))}
                      className="rounded-md border border-border bg-card px-2.5 py-1.5 text-sm text-text focus:border-accent focus:outline-none"
                    />
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-1 mb-3">
                <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">Observaciones</label>
                <textarea
                  value={editData.notes}
                  onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                  className="rounded-md border border-border bg-card px-2.5 py-1.5 text-sm text-text focus:border-accent focus:outline-none resize-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  disabled={isPending}
                  className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-bold text-navy-deep hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                  Guardar
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted hover:text-text transition-colors"
                >
                  <X size={12} /> Cancelar
                </button>
              </div>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>

      {/* Delete confirmation dialog */}
      <AnimatePresence>
        {showDelete && (
          <motion.tr
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-negative/5 border-b border-negative/20"
          >
            <td colSpan={9} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-text">
                    ¿Eliminar a <span className="text-negative">{player.name}</span>?
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    El jugador pasará a la papelera y podrá restaurarse desde Gestión de Datos.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={isPending}
                    className="flex items-center gap-1.5 rounded-md bg-negative px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
                  >
                    {isPending ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                    Sí, eliminar
                  </button>
                  <button
                    onClick={() => setShowDelete(false)}
                    className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted hover:text-text"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Sort Header ──────────────────────────────────────────────────────────────

export function SortableHeader({
  label, sortKey, currentSort, currentDir, onSort,
}: {
  label: string;
  sortKey: string;
  currentSort: string;
  currentDir: "asc" | "desc";
  onSort: (key: string) => void;
}) {
  const isActive = currentSort === sortKey;
  return (
    <button
      onClick={() => onSort(sortKey)}
      className="flex items-center gap-1 text-left text-xs font-semibold text-muted hover:text-text transition-colors"
    >
      {label}
      {isActive ? (
        currentDir === "asc" ? <ChevronUp size={11} /> : <ChevronDown size={11} />
      ) : (
        <ChevronDown size={11} className="opacity-30" />
      )}
    </button>
  );
}
