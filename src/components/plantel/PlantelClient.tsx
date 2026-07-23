"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Users, Upload } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { PlayerRow, SortableHeader } from "@/components/plantel/PlayerRow";
import { AddPlayerModal } from "@/components/plantel/AddPlayerModal";
import { BulkImportModal } from "@/components/plantel/BulkImportModal";
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
  GK: "Arqueros", DEF: "Defensores", MID: "Mediocampistas", FWD: "Delanteros",
};

export function PlantelClient({ players: initialPlayers }: { players: Player[] }) {
  const [search, setSearch] = useState("");
  const [filterPosition, setFilterPosition] = useState<PositionGroup | "ALL">("ALL");
  const [filterStatus, setFilterStatus] = useState<"all" | "healthy" | "injured">("all");
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [showImport, setShowImport] = useState(false);

  const players = useMemo(() => {
    let filtered = initialPlayers;

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.nationality ?? "").toLowerCase().includes(q) ||
        (p.notes ?? "").toLowerCase().includes(q)
      );
    }

    if (filterPosition !== "ALL") {
      filtered = filtered.filter(p => p.positionGroup === filterPosition);
    }

    if (filterStatus === "healthy") {
      filtered = filtered.filter(p => p.injuries.length === 0);
    } else if (filterStatus === "injured") {
      filtered = filtered.filter(p => p.injuries.length > 0);
    }

    filtered = [...filtered].sort((a, b) => {
      let valA: string | number = "";
      let valB: string | number = "";

      switch (sortKey) {
        case "name": valA = a.name; valB = b.name; break;
        case "positionGroup": valA = a.positionGroup; valB = b.positionGroup; break;
        case "nationality": valA = a.nationality ?? ""; valB = b.nationality ?? ""; break;
        case "heightCm": valA = a.heightCm ?? 0; valB = b.heightCm ?? 0; break;
        case "salary": valA = Number(a.salaries[0]?.monthlySalary ?? 0); valB = Number(b.salaries[0]?.monthlySalary ?? 0); break;
        case "shirtNumber": valA = a.shirtNumber ?? 99; valB = b.shirtNumber ?? 99; break;
      }

      if (typeof valA === "string") {
        return sortDir === "asc" ? valA.localeCompare(valB as string) : (valB as string).localeCompare(valA);
      }
      return sortDir === "asc" ? valA - (valB as number) : (valB as number) - valA;
    });

    return filtered;
  }, [initialPlayers, search, filterPosition, filterStatus, sortKey, sortDir]);

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  // Group by position for display
  const grouped = useMemo(() => {
    const groups: Record<PositionGroup, Player[]> = { GK: [], DEF: [], MID: [], FWD: [] };
    players.forEach(p => { groups[p.positionGroup].push(p); });
    return groups;
  }, [players]);

  const injuredCount = initialPlayers.filter(p => p.injuries.length > 0).length;

  return (
    <>
      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap items-center gap-4"
      >
        {[
          { label: "Total jugadores", value: initialPlayers.length, color: "text-accent" },
          { label: "Aptos", value: initialPlayers.length - injuredCount, color: "text-positive" },
          { label: "Lesionados", value: injuredCount, color: "text-negative" },
        ].map(stat => (
          <div key={stat.label} className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5">
            <span className={`font-display text-2xl font-black tabular-nums ${stat.color}`}>{stat.value}</span>
            <span className="text-xs text-muted font-medium">{stat.label}</span>
          </div>
        ))}
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-wrap items-center gap-3"
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, nacionalidad..."
            className="w-full rounded-lg border border-border bg-surface pl-8 pr-3 py-2.5 text-sm text-text placeholder:text-muted-2 focus:border-accent focus:outline-none transition-colors"
          />
        </div>

        {/* Position filter */}
        <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1">
          {(["ALL", "GK", "DEF", "MID", "FWD"] as const).map(pos => (
            <button
              key={pos}
              onClick={() => setFilterPosition(pos)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${filterPosition === pos ? "bg-accent text-navy-deep" : "text-muted hover:text-text"}`}
            >
              {pos === "ALL" ? "Todos" : pos}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1">
          {[
            { key: "all", label: "Todos" },
            { key: "healthy", label: "Aptos" },
            { key: "injured", label: "Lesionados" },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilterStatus(f.key as typeof filterStatus)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${filterStatus === f.key ? "bg-card text-text border border-border" : "text-muted hover:text-text"}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted hover:text-text hover:border-border-2 transition-colors"
          >
            <Upload size={13} />
            Importar CSV/Excel
          </button>
          <AddPlayerModal />
        </div>
      </motion.div>

      {/* Results summary */}
      {search && (
        <p className="text-xs text-muted">
          {players.length} resultado{players.length !== 1 ? "s" : ""} para &quot;{search}&quot;
        </p>
      )}

      {/* Table by position group */}
      {players.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 gap-3 rounded-2xl border border-dashed border-border"
        >
          <Users size={32} className="text-muted" />
          <p className="text-sm font-semibold text-text">No se encontraron jugadores</p>
          <p className="text-xs text-muted">Probá cambiando los filtros o agregá jugadores al plantel.</p>
        </motion.div>
      ) : (
        <div className="grid gap-8">
          {(Object.keys(POSITION_LABELS) as PositionGroup[]).map((pos, groupIdx) => {
            const list = grouped[pos];
            if (!list.length) return null;

            return (
              <motion.div
                key={pos}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + groupIdx * 0.08, duration: 0.4 }}
                className="grid gap-3"
              >
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-muted">
                    {POSITION_LABELS[pos]}
                  </h2>
                  <span className="text-[11px] font-bold text-accent bg-accent/10 border border-accent/20 rounded-full px-2 py-0.5">
                    {list.length}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-surface">
                        <th className="p-3 text-center w-12">
                          <span className="text-xs font-semibold text-muted">#</span>
                        </th>
                        <th className="p-3 text-left">
                          <SortableHeader label="Jugador" sortKey="name" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
                        </th>
                        <th className="p-3 text-left">
                          <SortableHeader label="Posición" sortKey="positionGroup" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
                        </th>
                        <th className="p-3 text-left">
                          <SortableHeader label="Nac." sortKey="nationality" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
                        </th>
                        <th className="p-3 text-center">
                          <SortableHeader label="Físico" sortKey="heightCm" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
                        </th>
                        <th className="p-3 text-center">
                          <span className="text-xs font-semibold text-muted">Estado Médico</span>
                        </th>
                        <th className="p-3 text-center">
                          <span className="text-xs font-semibold text-muted">% Grasa</span>
                        </th>
                        <th className="p-3 text-center">
                          <SortableHeader label="Salario/mes" sortKey="salary" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
                        </th>
                        <th className="p-3 w-20" />
                      </tr>
                    </thead>
                    <tbody>
                      {list.map((player, rowIdx) => (
                        <PlayerRow key={player.id} player={player} index={rowIdx} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Import modal */}
      <AnimatePresence>
        {showImport && <BulkImportModal onClose={() => setShowImport(false)} />}
      </AnimatePresence>
    </>
  );
}
