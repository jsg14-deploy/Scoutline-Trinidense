import Link from "next/link";
import { Target, HelpCircle, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { findSimilarPlayers } from "@/lib/similarity/engine";
import { PageHeader } from "@/components/dashboard/PageHeader";

type SearchParams = Promise<{
  playerId?: string;
  season?: string;
  maxMarketValueEur?: string;
  minMinutesPlayed?: string;
}>;

const POSITION_COLORS: Record<string, string> = {
  GK: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  DEF: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  MID: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  FWD: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

export default async function SimilaritySearchPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;

  const latestStatRow = await prisma.playerSeasonStats.findFirst({ orderBy: { updatedAt: "desc" } });
  const season = params.season ?? latestStatRow?.season;

  const candidates = season
    ? await prisma.playerSeasonStats.findMany({
        where: { season },
        include: { player: true },
        orderBy: { player: { name: "asc" } },
      })
    : [];

  const results =
    params.playerId && season
      ? await findSimilarPlayers(params.playerId, season, {
          maxMarketValueEur: params.maxMarketValueEur ? Number(params.maxMarketValueEur) : undefined,
          minMinutesPlayed: params.minMinutesPlayed ? Number(params.minMinutesPlayed) : undefined,
        })
      : [];

  // Fetch reference player info to display as a target card
  const referencePlayer = params.playerId
    ? await prisma.player.findUnique({
        where: { id: params.playerId },
        include: {
          currentTeam: true,
          seasonStats: {
            where: { season },
          },
        },
      })
    : null;

  return (
    <div className="grid gap-6">
      <PageHeader
        icon={Target}
        eyebrow="Motor de similitud"
        title="Búsqueda de similitud"
        subtitle="Coseno sobre percentiles por posición, con filtros de presupuesto y minutos."
      />

      {/* Query Form */}
      <form className="flex flex-wrap items-end gap-4 rounded-2xl border border-border bg-card p-5">
        <div className="grid gap-1.5 flex-1 min-w-[220px]">
          <label htmlFor="playerId" className="text-xs font-semibold text-muted">Jugador de referencia</label>
          <select
            id="playerId"
            name="playerId"
            defaultValue={params.playerId ?? ""}
            className="w-full rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
          >
            <option value="">Elegí un jugador</option>
            {candidates.map((c) => (
              <option key={c.playerId} value={c.playerId}>
                {c.player.name} ({c.player.positionGroup})
              </option>
            ))}
          </select>
        </div>
        <input type="hidden" name="season" value={season ?? ""} />
        
        <div className="grid gap-1.5">
          <label htmlFor="maxMarketValueEur" className="text-xs font-semibold text-muted">Valor máx. mercado (€)</label>
          <input
            id="maxMarketValueEur"
            type="number"
            name="maxMarketValueEur"
            defaultValue={params.maxMarketValueEur}
            placeholder="Sin límite…"
            className="w-40 rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
          />
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="minMinutesPlayed" className="text-xs font-semibold text-muted">Minutos mínimos</label>
          <input
            id="minMinutesPlayed"
            type="number"
            name="minMinutesPlayed"
            defaultValue={params.minMinutesPlayed}
            placeholder="0"
            className="w-32 rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
          />
        </div>

        <button type="submit" className="rounded-lg bg-navy hover:bg-navy-2 px-5 py-2 text-sm font-semibold text-white transition-colors cursor-pointer">
          Buscar similares
        </button>
      </form>

      {!season && (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border bg-card">
          <HelpCircle size={28} className="text-muted" strokeWidth={1.5} />
          <p className="mt-3 text-sm font-semibold text-text">No hay percentiles calculados</p>
          <p className="text-xs text-muted mt-1 max-w-xs">
            Todavía no hay percentiles calculados para ninguna temporada. Cargá datos primero.
          </p>
        </div>
      )}

      {/* Reference Player Header Card */}
      {referencePlayer && (
        <div className="rounded-2xl border-2 border-accent/30 bg-accent/5 p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase font-bold text-accent tracking-wider">Jugador de referencia</p>
            <h2 className="text-lg font-black text-text mt-1">{referencePlayer.name}</h2>
            <p className="text-xs text-muted mt-0.5">
              Posición: <span className="font-semibold text-text">{referencePlayer.positionGroup}</span> · 
              Equipo: <span className="font-semibold text-text">{referencePlayer.currentTeam?.name ?? "—"}</span> · 
              Minutos: <span className="font-semibold text-text font-mono">{referencePlayer.seasonStats[0]?.minutesPlayed ?? "—"}′</span>
            </p>
          </div>
          <Link
            href={`/players/${referencePlayer.id}`}
            className="rounded-lg bg-card border border-border hover:border-accent text-text px-4 py-2 text-xs font-bold transition-all hover:-translate-y-0.5 flex items-center gap-1.5"
          >
            Ver perfil <ArrowRight size={12} />
          </Link>
        </div>
      )}

      {params.playerId && results.length === 0 && season && (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border bg-card">
          <HelpCircle size={28} className="text-muted" strokeWidth={1.5} />
          <p className="mt-3 text-sm font-semibold text-text">No se encontraron perfiles</p>
          <p className="text-xs text-muted mt-1 max-w-xs">
            No se encontraron jugadores similares con esos filtros (o el jugador de referencia todavía no tiene percentiles calculados).
          </p>
        </div>
      )}

      {/* Similarity Results List */}
      {results.length > 0 && (
        <div>
          <h2 className="mb-4 text-sm font-bold text-text tracking-tight uppercase">Jugadores similares sugeridos</h2>
          <div className="overflow-x-auto rounded-2xl border border-border bg-card custom-scrollbar">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  {["Jugador", "Posición", "Equipo", "Liga", "Valor", "Similitud"].map((h) => (
                    <th key={h} className="p-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.playerId} className="border-b border-border last:border-b-0 hover:bg-surface/50 transition-colors">
                    <td className="p-3.5">
                      <Link href={`/players/${r.playerId}`} className="font-bold text-text hover:underline hover:text-accent">
                        {r.name}
                      </Link>
                    </td>
                    <td className="p-3.5 text-xs">
                      <span className={`inline-block rounded-md border px-2 py-0.5 font-semibold text-[10px] ${POSITION_COLORS[r.positionGroup] || "border-border text-muted"}`}>
                        {r.positionGroup}
                      </span>
                    </td>
                    <td className="p-3.5 text-xs text-muted font-medium">{r.teamName ?? "—"}</td>
                    <td className="p-3.5 text-xs text-muted font-medium">{r.leagueName ?? "—"}</td>
                    <td className="p-3.5 text-xs text-muted font-mono font-semibold tabular-nums">
                      {r.marketValueEur ? `€${r.marketValueEur.toLocaleString()}` : "—"}
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <span className="w-10 text-right font-mono font-bold text-accent">{Math.round(r.similarity * 100)}%</span>
                        <div className="w-24 bg-surface h-2 rounded-full overflow-hidden border border-border flex shrink-0">
                          <div
                            className="bg-gradient-to-r from-accent to-accent-2 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.round(r.similarity * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
