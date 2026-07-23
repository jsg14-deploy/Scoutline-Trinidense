"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, Plus, CalendarDays, Trash2, Check, X,
  ChevronRight, Circle, Flag, Loader2, BarChart3
} from "lucide-react";
import { createCompetition, createMatch, deleteMatch, deleteCompetition } from "@/app/actions/competition";
import { useActionState } from "react";

type Standing = {
  id: string; teamName: string; played: number; wins: number; draws: number;
  losses: number; goalsFor: number; goalsAgainst: number; points: number;
};

type Match = {
  id: string; homeTeam: string; awayTeam: string; homeScore: number | null;
  awayScore: number | null; matchDate: string | null; round: number | null;
  venue: string | null; status: string;
};

type Competition = {
  id: string; name: string; season: string; country: string; isActive: boolean;
  matches: Match[]; standings: Standing[];
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  scheduled: { label: "Programado", color: "text-muted" },
  live: { label: "En vivo", color: "text-positive" },
  finished: { label: "Finalizado", color: "text-muted" },
  postponed: { label: "Postergado", color: "text-warn" },
};

const HOME_TEAM = "Sportivo Trinidense";

export function CompeticionClient({ competitions: initialCompetitions }: { competitions: Competition[] }) {
  const [competitions, setCompetitions] = useState(initialCompetitions);
  const [activeCompId, setActiveCompId] = useState<string | null>(
    initialCompetitions.find(c => c.isActive)?.id ?? initialCompetitions[0]?.id ?? null
  );
  const [showNewComp, setShowNewComp] = useState(false);
  const [showNewMatch, setShowNewMatch] = useState(false);
  const [activeTab, setActiveTab] = useState<"standings" | "matches">("standings");
  const [isPending, startTransition] = useTransition();

  const [compState, compAction, compPending] = useActionState(createCompetition, undefined);
  const [matchState, matchAction, matchPending] = useActionState(createMatch, undefined);

  const activeComp = competitions.find(c => c.id === activeCompId);

  // Close modals on success
  if (compState?.success && showNewComp) setShowNewComp(false);
  if (matchState?.success && showNewMatch) setShowNewMatch(false);

  function handleDeleteMatch(matchId: string) {
    startTransition(async () => {
      await deleteMatch(matchId);
      setCompetitions(prev => prev.map(c => ({
        ...c, matches: c.matches.filter(m => m.id !== matchId),
      })));
    });
  }

  function handleDeleteComp(compId: string) {
    startTransition(async () => {
      await deleteCompetition(compId);
      setCompetitions(prev => prev.filter(c => c.id !== compId));
      if (activeCompId === compId) setActiveCompId(competitions[0]?.id ?? null);
    });
  }

  return (
    <div className="grid gap-6">
      {/* Competition selector + actions */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center gap-3"
      >
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {competitions.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCompId(c.id)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-all ${
                activeCompId === c.id
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-muted hover:text-text hover:border-border-2"
              }`}
            >
              <Trophy size={13} />
              {c.name}
              {c.isActive && <span className="h-1.5 w-1.5 rounded-full bg-positive" />}
            </button>
          ))}
          {competitions.length === 0 && (
            <p className="text-sm text-muted">No hay competiciones registradas.</p>
          )}
        </div>
        <button
          onClick={() => setShowNewComp(true)}
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-bold text-navy-deep hover:opacity-90"
        >
          <Plus size={14} />
          Nueva competición
        </button>
      </motion.div>

      {/* Main content */}
      {activeComp ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
          {/* Left: standings or matches */}
          <div className="flex flex-col gap-4">
            {/* Tabs */}
            <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1 w-fit">
              {[
                { key: "standings", label: "Tabla de Posiciones", icon: BarChart3 },
                { key: "matches", label: "Fixture / Resultados", icon: CalendarDays },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
                    activeTab === tab.key ? "bg-card text-text border border-border shadow-sm" : "text-muted hover:text-text"
                  }`}
                >
                  <tab.icon size={13} />
                  {tab.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "standings" ? (
                <motion.div
                  key="standings"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm"
                >
                  {activeComp.standings.length === 0 ? (
                    <div className="flex flex-col items-center py-16 gap-2 text-center">
                      <Trophy size={28} className="text-muted/40" />
                      <p className="text-sm text-muted font-medium">La tabla se generará automáticamente cuando cargues resultados</p>
                      <p className="text-xs text-muted-2">También podés agregar equipos manualmente desde el formulario de partidos</p>
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-surface text-left">
                          <th className="p-3 w-10 text-center font-semibold text-muted">#</th>
                          <th className="p-3 font-semibold text-muted">Equipo</th>
                          <th className="p-3 text-center font-semibold text-muted">PJ</th>
                          <th className="p-3 text-center font-semibold text-muted">G</th>
                          <th className="p-3 text-center font-semibold text-muted">E</th>
                          <th className="p-3 text-center font-semibold text-muted">P</th>
                          <th className="p-3 text-center font-semibold text-muted">GF</th>
                          <th className="p-3 text-center font-semibold text-muted">GC</th>
                          <th className="p-3 text-center font-semibold text-muted">DIF</th>
                          <th className="p-3 text-center font-bold text-muted">PTS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeComp.standings
                          .slice()
                          .sort((a, b) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst))
                          .map((s, idx) => {
                            const isOurTeam = s.teamName.toLowerCase().includes("trinidense");
                            const gd = s.goalsFor - s.goalsAgainst;
                            return (
                              <motion.tr
                                key={s.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.04 }}
                                className={`border-b border-border last:border-0 transition-colors tabular-nums ${isOurTeam ? "bg-accent/5 hover:bg-accent/8" : "hover:bg-surface"}`}
                              >
                                <td className="p-3 text-center">
                                  <span className={`text-sm font-bold ${idx < 3 ? "text-accent" : "text-muted"}`}>{idx + 1}</span>
                                </td>
                                <td className="p-3">
                                  <span className={`font-semibold ${isOurTeam ? "text-accent" : "text-text"}`}>{s.teamName}</span>
                                </td>
                                <td className="p-3 text-center text-muted">{s.played}</td>
                                <td className="p-3 text-center text-positive font-medium">{s.wins}</td>
                                <td className="p-3 text-center text-muted">{s.draws}</td>
                                <td className="p-3 text-center text-negative font-medium">{s.losses}</td>
                                <td className="p-3 text-center text-muted">{s.goalsFor}</td>
                                <td className="p-3 text-center text-muted">{s.goalsAgainst}</td>
                                <td className="p-3 text-center text-muted">{gd > 0 ? `+${gd}` : gd}</td>
                                <td className="p-3 text-center">
                                  <span className={`text-sm font-black ${isOurTeam ? "text-accent" : "text-text"}`}>{s.points}</span>
                                </td>
                              </motion.tr>
                            );
                          })}
                      </tbody>
                    </table>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="matches"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex flex-col gap-3"
                >
                  {activeComp.matches.length === 0 ? (
                    <div className="flex flex-col items-center py-16 gap-2 text-center rounded-2xl border border-dashed border-border">
                      <CalendarDays size={28} className="text-muted/40" />
                      <p className="text-sm text-muted font-medium">No hay partidos cargados</p>
                      <p className="text-xs text-muted-2">Usá el formulario para agregar el fixture</p>
                    </div>
                  ) : (
                    activeComp.matches.map((match, idx) => {
                      const finished = match.status === "finished";
                      const isHome = match.homeTeam.includes("Trinidense");
                      const isAway = match.awayTeam.includes("Trinidense");
                      const statusConf = STATUS_CONFIG[match.status] ?? STATUS_CONFIG.scheduled;

                      return (
                        <motion.div
                          key={match.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 hover:border-accent/40 transition-all"
                        >
                          {match.round && (
                            <span className="shrink-0 text-xs font-bold text-muted bg-surface border border-border px-2 py-1 rounded-md tabular-nums">
                              J{match.round}
                            </span>
                          )}

                          <div className="flex flex-1 items-center justify-between gap-3 min-w-0">
                            <span className={`text-sm font-semibold truncate ${isHome ? "text-accent" : "text-text"}`}>
                              {match.homeTeam}
                            </span>

                            <div className="flex flex-col items-center gap-0.5 shrink-0">
                              {finished ? (
                                <span className="text-base font-black text-text tabular-nums bg-surface border border-border px-3 py-1 rounded-lg">
                                  {match.homeScore} — {match.awayScore}
                                </span>
                              ) : (
                                <span className="text-xs font-bold text-accent bg-accent/10 border border-accent/20 px-3 py-1.5 rounded-lg">
                                  vs
                                </span>
                              )}
                              {match.matchDate && (
                                <span className="text-[10px] text-muted font-mono">
                                  {new Date(match.matchDate).toLocaleDateString("es-PY", { day: "2-digit", month: "short" })}
                                </span>
                              )}
                            </div>

                            <span className={`text-sm font-semibold truncate text-right ${isAway ? "text-accent" : "text-text"}`}>
                              {match.awayTeam}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-[10px] font-semibold ${statusConf.color}`}>{statusConf.label}</span>
                            <button
                              onClick={() => handleDeleteMatch(match.id)}
                              disabled={isPending}
                              className="rounded-md p-1.5 text-muted opacity-0 group-hover:opacity-100 hover:text-negative hover:bg-negative/10 transition-all"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: add match form + comp management */}
          <div className="flex flex-col gap-4">
            {/* Add match form */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-text flex items-center gap-2">
                  <Plus size={14} className="text-accent" />
                  Cargar resultado / partido
                </h3>
              </div>
              <form action={matchAction} className="grid gap-3">
                <input type="hidden" name="competitionId" value={activeComp.id} />

                <div className="grid gap-1">
                  <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">Equipo local *</label>
                  <input name="homeTeam" defaultValue={HOME_TEAM} required
                    className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none" />
                </div>

                <div className="grid gap-1">
                  <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">Equipo visitante *</label>
                  <input name="awayTeam" required placeholder="Olimpia"
                    className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none" />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="grid gap-1">
                    <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">Goles L</label>
                    <input name="homeScore" type="number" min="0" max="30" placeholder="0"
                      className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none text-center tabular-nums" />
                  </div>
                  <div className="flex items-end justify-center pb-2.5">
                    <span className="text-sm font-bold text-muted">vs</span>
                  </div>
                  <div className="grid gap-1">
                    <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">Goles V</label>
                    <input name="awayScore" type="number" min="0" max="30" placeholder="0"
                      className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none text-center tabular-nums" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-1">
                    <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">Fecha</label>
                    <input name="matchDate" type="date"
                      className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none" />
                  </div>
                  <div className="grid gap-1">
                    <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">Jornada</label>
                    <input name="round" type="number" min="1" max="50" placeholder="1"
                      className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none text-center" />
                  </div>
                </div>

                <div className="grid gap-1">
                  <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">Estado</label>
                  <select name="status"
                    className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none">
                    <option value="scheduled">Programado</option>
                    <option value="finished">Finalizado</option>
                    <option value="live">En vivo</option>
                    <option value="postponed">Postergado</option>
                  </select>
                </div>

                <div className="grid gap-1">
                  <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">Estadio (opcional)</label>
                  <input name="venue" placeholder="Estadio General Pablo Rojas"
                    className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none" />
                </div>

                {matchState?.error && (
                  <p className="text-xs text-negative bg-negative/10 rounded-lg px-3 py-2">{matchState.error}</p>
                )}

                <button type="submit" disabled={matchPending}
                  className="flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-navy-deep hover:opacity-90 disabled:opacity-50 transition-opacity">
                  {matchPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  {matchPending ? "Guardando..." : "Guardar partido"}
                </button>
              </form>
            </div>

            {/* Danger zone */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Gestión del Torneo</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-text">{activeComp.name}</p>
                  <p className="text-xs text-muted">{activeComp.season} · {activeComp.country}</p>
                </div>
                <button
                  onClick={() => handleDeleteComp(activeComp.id)}
                  disabled={isPending}
                  className="flex items-center gap-1.5 rounded-lg border border-negative/30 px-3 py-2 text-xs font-semibold text-negative hover:bg-negative/10 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={12} />
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 gap-4 rounded-2xl border border-dashed border-border"
        >
          <Trophy size={36} className="text-muted/40" />
          <div className="text-center">
            <p className="text-sm font-semibold text-text">No hay competiciones configuradas</p>
            <p className="text-xs text-muted mt-1">Creá tu primer torneo para comenzar a registrar resultados</p>
          </div>
          <button
            onClick={() => setShowNewComp(true)}
            className="flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-navy-deep hover:opacity-90"
          >
            <Plus size={14} />
            Crear competición
          </button>
        </motion.div>
      )}

      {/* New Competition Modal */}
      <AnimatePresence>
        {showNewComp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) setShowNewComp(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-surface">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-accent/10 border border-accent/20">
                    <Trophy size={16} className="text-accent" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-text">Nueva Competición</h2>
                    <p className="text-xs text-muted">Torneo, copa o liga</p>
                  </div>
                </div>
                <button onClick={() => setShowNewComp(false)} className="rounded-lg p-1.5 text-muted hover:text-text hover:bg-card transition-colors">
                  <X size={16} />
                </button>
              </div>

              <form action={compAction} className="p-5 grid gap-4">
                <div className="grid gap-1">
                  <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">Nombre *</label>
                  <input name="name" required placeholder="Apertura 2026, Copa Paraguay..."
                    className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text focus:border-accent focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1">
                    <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">Temporada *</label>
                    <input name="season" required placeholder="2026"
                      className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text focus:border-accent focus:outline-none" />
                  </div>
                  <div className="grid gap-1">
                    <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">País</label>
                    <input name="country" defaultValue="Paraguay"
                      className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text focus:border-accent focus:outline-none" />
                  </div>
                </div>
                {compState?.error && (
                  <p className="text-xs text-negative bg-negative/10 rounded-lg px-3 py-2">{compState.error}</p>
                )}
                <div className="flex gap-3">
                  <button type="submit" disabled={compPending}
                    className="flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-navy-deep hover:opacity-90 disabled:opacity-50">
                    {compPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    Crear competición
                  </button>
                  <button type="button" onClick={() => setShowNewComp(false)}
                    className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted hover:text-text">
                    Cancelar
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
