"use client";

import { Trophy, CalendarDays, ExternalLink, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { FadeIn } from "@/components/ui/FadeIn";

const mockStandings = [
  { pos: 1, team: "Olimpia", pts: 45, p: 22, w: 14, d: 3, l: 5, gf: 41, ga: 22, gd: 19 },
  { pos: 2, team: "Cerro Porteño", pts: 42, p: 22, w: 12, d: 6, l: 4, gf: 38, ga: 19, gd: 19 },
  { pos: 3, team: "Libertad", pts: 39, p: 22, w: 11, d: 6, l: 5, gf: 35, ga: 21, gd: 14 },
  { pos: 4, team: "Sportivo Trinidense", pts: 35, p: 22, w: 10, d: 5, l: 7, gf: 29, ga: 25, gd: 4 },
  { pos: 5, team: "Guaraní", pts: 31, p: 22, w: 8, d: 7, l: 7, gf: 27, ga: 26, gd: 1 },
];

const mockMatches = [
  { date: "24 Jul 2026", home: "Sportivo Trinidense", away: "Olimpia", result: "2 - 1", status: "finished" },
  { date: "30 Jul 2026", home: "Cerro Porteño", away: "Sportivo Trinidense", result: "0 - 0", status: "finished" },
  { date: "05 Ago 2026", home: "Sportivo Trinidense", away: "Libertad", result: "vs", status: "upcoming" },
  { date: "12 Ago 2026", home: "Guaraní", away: "Sportivo Trinidense", result: "vs", status: "upcoming" },
];

export default function CompeticionPage() {
  return (
    <div className="grid gap-8">
      <PageHeader
        icon={Trophy}
        eyebrow="Datos Externos"
        title="Resultados y Posiciones"
        subtitle="Seguimiento en vivo del Torneo Apertura y Clausura. Sincronización de resultados y estadísticas de liga."
      />

      <FadeIn delay={0.1} className="flex justify-between items-center rounded-2xl bg-surface border border-border p-5">
        <div>
          <h3 className="text-sm font-bold text-text">Sincronización con API de Datos Deportivos</h3>
          <p className="text-xs text-muted mt-1">Conecta con SofaScore o Wyscout para automatizar las posiciones y fixtures en tiempo real.</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90">
          <ExternalLink size={14} />
          Sincronizar (Próximamente)
        </button>
      </FadeIn>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tabla de Posiciones */}
        <FadeIn delay={0.2} className="flex flex-col gap-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-accent border-b border-border pb-2 flex items-center gap-2">
            <Trophy size={16} />
            Tabla de Posiciones - Primera División
          </h2>
          
          <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface text-left">
                  <th className="p-3 font-semibold text-muted text-center w-12">#</th>
                  <th className="p-3 font-semibold text-muted">Equipo</th>
                  <th className="p-3 font-semibold text-muted text-center">PTS</th>
                  <th className="p-3 font-semibold text-muted text-center">PJ</th>
                  <th className="p-3 font-semibold text-muted text-center">G</th>
                  <th className="p-3 font-semibold text-muted text-center">DIF</th>
                </tr>
              </thead>
              <tbody>
                {mockStandings.map((row) => (
                  <tr key={row.pos} className={`border-b border-border last:border-0 hover:bg-surface transition-colors tabular-nums ${row.team === "Sportivo Trinidense" ? "bg-accent/5 font-semibold" : ""}`}>
                    <td className="p-3 text-center text-muted font-medium">{row.pos}</td>
                    <td className={`p-3 ${row.team === "Sportivo Trinidense" ? "text-accent" : "text-text"}`}>{row.team}</td>
                    <td className="p-3 text-center font-bold text-text">{row.pts}</td>
                    <td className="p-3 text-center text-muted">{row.p}</td>
                    <td className="p-3 text-center text-muted">{row.w}</td>
                    <td className="p-3 text-center text-muted">{row.gd > 0 ? `+${row.gd}` : row.gd}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeIn>

        {/* Fixture / Resultados */}
        <FadeIn delay={0.3} className="flex flex-col gap-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-accent border-b border-border pb-2 flex items-center gap-2">
            <CalendarDays size={16} />
            Fixture y Resultados
          </h2>
          
          <div className="flex flex-col gap-3">
            {mockMatches.map((match, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 hover:border-accent/50 transition-colors cursor-pointer group">
                <div className="flex flex-col gap-1 w-[40%] text-right">
                  <span className={`text-sm font-medium ${match.home === "Sportivo Trinidense" ? "text-accent" : "text-text"}`}>{match.home}</span>
                </div>
                
                <div className="flex flex-col items-center justify-center gap-1 w-[20%]">
                  <span className="text-[10px] uppercase font-bold text-muted tracking-wider">{match.date}</span>
                  <span className={`px-3 py-1 rounded-md text-xs font-bold tabular-nums ${match.status === "finished" ? "bg-surface text-text border border-border" : "bg-accent/10 text-accent"}`}>
                    {match.result}
                  </span>
                </div>

                <div className="flex flex-col gap-1 w-[40%] text-left">
                  <span className={`text-sm font-medium ${match.away === "Sportivo Trinidense" ? "text-accent" : "text-text"}`}>{match.away}</span>
                </div>

                <ChevronRight size={16} className="text-muted opacity-0 group-hover:opacity-100 transition-opacity absolute right-4" />
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
