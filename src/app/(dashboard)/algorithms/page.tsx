import Link from "next/link";
import { BarChart3, HelpCircle } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { computeMentalSpeedRanking } from "@/lib/algorithms/mentalSpeed";
import { computePhysicalGap } from "@/lib/algorithms/physicalGap";
import { RunClusteringButton } from "@/components/algorithms/RunClusteringButton";
import { RecomputePercentilesButton } from "@/components/algorithms/RecomputePercentilesButton";
import { PageHeader } from "@/components/dashboard/PageHeader";

const STYLE_COLORS: Record<string, string> = {
  possession: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  direct: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  high_press: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  low_block: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  unclassified: "bg-surface text-muted border-border",
};

const STYLE_LABELS: Record<string, string> = {
  possession: "Posesión / Control",
  direct: "Ataque Directo",
  high_press: "Presión Alta",
  low_block: "Bloque Bajo",
  unclassified: "Sin clasificar",
};

export default async function AlgorithmsPage() {
  const session = await requireSession();

  const latestStatRow = await prisma.playerSeasonStats.findFirst({ orderBy: { updatedAt: "desc" } });
  const season = latestStatRow?.season;

  const [mentalSpeedRanking, physicalGap, teams] = await Promise.all([
    season ? computeMentalSpeedRanking(season, 10) : Promise.resolve([]),
    computePhysicalGap(session.tenantId),
    season ? prisma.team.findMany({ where: { season }, orderBy: { name: "asc" } }) : Promise.resolve([]),
  ]);

  return (
    <div className="grid gap-8">
      <PageHeader
        icon={BarChart3}
        eyebrow="Indicadores"
        title="Algoritmos"
        subtitle="Rankings e indicadores derivados de tus propios datos cargados."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Decision Speed Leaderboard */}
        <section className="lg:col-span-1 rounded-2xl border border-border bg-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-3 mb-4">
              <div>
                <h2 className="text-sm font-bold text-text">Velocidad de decisión</h2>
                <p className="mt-1 text-[10px] text-muted leading-relaxed">
                  Promedio de percentiles de presiones, regates y pases por-90 (Proxy compuesto de velocidad de decisión).
                </p>
              </div>
              {season && <RecomputePercentilesButton season={season} />}
            </div>

            {mentalSpeedRanking.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <HelpCircle size={24} className="text-muted" strokeWidth={1.5} />
                <p className="mt-2 text-xs font-semibold text-text">Sin datos</p>
                <p className="text-[10px] text-muted mt-0.5">Calculá los percentiles en la sección de datos.</p>
              </div>
            ) : (
              <div className="grid gap-2.5">
                {mentalSpeedRanking.map((r, i) => {
                  const isTop3 = i < 3;
                  const rankStyles =
                    i === 0
                      ? "bg-accent/20 text-accent border-accent/40 font-black scale-105"
                      : i === 1
                      ? "bg-slate-400/20 text-slate-300 border-slate-400/30 font-bold"
                      : i === 2
                      ? "bg-amber-700/20 text-amber-600 border-amber-700/30 font-bold"
                      : "bg-surface border-border text-muted font-semibold";
                  return (
                    <div
                      key={r.playerId}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-surface hover:border-border-2 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] ${rankStyles}`}>
                          {i + 1}
                        </span>
                        <div className="min-w-0">
                          <Link href={`/players/${r.playerId}`} className="text-xs font-bold text-text hover:underline hover:text-accent truncate block">
                            {r.name}
                          </Link>
                          <p className="text-[9px] text-muted uppercase tracking-wider">{r.positionGroup}</p>
                        </div>
                      </div>
                      <span className={`font-mono text-xs font-black ${isTop3 ? "text-accent" : "text-text"}`}>
                        {Math.round(r.score)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Physical Gap deviation */}
        <section className="lg:col-span-2 rounded-2xl border border-border bg-card p-5">
          <div className="border-b border-border/60 pb-3 mb-4">
            <h2 className="text-sm font-bold text-text">Brecha física (vs. cohorte propio)</h2>
            <p className="mt-1 text-[10px] text-muted leading-relaxed">
              Compara el promedio físico de las sesiones del jugador contra el promedio del plantel completo cargado en el sistema GPS.
            </p>
          </div>

          {physicalGap.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <HelpCircle size={24} className="text-muted" strokeWidth={1.5} />
              <p className="mt-2 text-xs font-semibold text-text">Sin datos físicos</p>
              <p className="text-[10px] text-muted mt-0.5">Subí datos de GPS en la sección de carga.</p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-surface text-muted text-[10px] uppercase font-bold tracking-wider">
                    <th className="p-3 text-left">Jugador</th>
                    <th className="p-3 text-left">Distancia total</th>
                    <th className="p-3 text-left">Sprint (HSR)</th>
                    <th className="p-3 text-left">Velocidad Máx.</th>
                  </tr>
                </thead>
                <tbody>
                  {physicalGap.map((g) => (
                    <tr key={g.playerRef} className="border-b border-border last:border-b-0 hover:bg-surface/30 transition-colors">
                      <td className="p-3 font-bold text-text">{g.playerRef}</td>
                      <td className="p-3"><DeviationBar value={g.gapsPct.distance_total_m} /></td>
                      <td className="p-3"><DeviationBar value={g.gapsPct.distance_hsr_m} /></td>
                      <td className="p-3"><DeviationBar value={g.gapsPct.max_speed_kmh} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Team clustering styling */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-text">Clustering de estilo de equipo</h2>
            <p className="mt-1 text-[10px] text-muted leading-relaxed">
              Agrupamiento K-Means (k=4) sobre eventos por partido para clasificar la idea táctica general.
            </p>
          </div>
          {season && <RunClusteringButton season={season} />}
        </div>

        {teams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border rounded-xl bg-surface/50">
            <HelpCircle size={24} className="text-muted" strokeWidth={1.5} />
            <p className="mt-2 text-xs font-semibold text-text">Sin equipos con eventos</p>
            <p className="text-[10px] text-muted mt-0.5">Se requiere cargar eventos de partidos primero.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 hover:border-border-2 transition-colors"
              >
                <span className="font-bold text-xs text-text">{t.name}</span>
                <span className={`rounded-md border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${STYLE_COLORS[t.styleCluster] || "border-border text-muted"}`}>
                  {STYLE_LABELS[t.styleCluster] || t.styleCluster}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function DeviationBar({ value }: { value: number }) {
  const clamped = Math.max(-100, Math.min(100, value)); // clamp between -100% and +100%
  const positive = clamped >= 0;
  const widthPct = Math.abs(clamped) / 2; // scale so 100% deviance is 50% of the bar width
  const offset = positive ? 50 : 50 - widthPct;

  return (
    <div className="flex items-center gap-2">
      <span className={`w-12 text-right font-mono text-[10px] font-bold ${positive ? "text-positive" : "text-negative"}`}>
        {positive ? "+" : ""}{value.toFixed(1)}%
      </span>
      <div className="relative w-24 h-2 bg-surface rounded-full border border-border/80 overflow-hidden flex shrink-0">
        {/* Center line (0% mark) */}
        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-border/60 z-10" />
        {/* Fill bar */}
        <div
          className={`absolute top-0 bottom-0 rounded-full transition-all duration-500 ${
            positive ? "bg-gradient-to-r from-emerald-500 to-teal-400" : "bg-gradient-to-r from-rose-500 to-red-400"
          }`}
          style={{
            left: `${offset}%`,
            width: `${widthPct}%`,
          }}
        />
      </div>
    </div>
  );
}
