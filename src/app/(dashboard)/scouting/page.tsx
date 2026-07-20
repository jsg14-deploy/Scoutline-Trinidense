import Link from "next/link";
import { Search, Grid, List, Bookmark, HelpCircle } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { PageHeader } from "@/components/dashboard/PageHeader";

type SearchParams = Promise<{ q?: string; position?: string; season?: string; watchlist?: string; view?: string }>;

const POSITION_COLORS: Record<string, string> = {
  GK: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  DEF: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  MID: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  FWD: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

const POSITION_LABELS: Record<string, string> = {
  GK: "Arquero",
  DEF: "Defensor",
  MID: "Mediocampista",
  FWD: "Delantero",
};

export default async function ScoutingPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await requireSession();
  const { q, position, season, watchlist, view } = await searchParams;

  const isWatchlistOnly = watchlist === "true";
  const activeView = view === "table" ? "table" : "grid";

  const players = await prisma.player.findMany({
    where: {
      name: q ? { contains: q, mode: "insensitive" } : undefined,
      positionGroup: position ? (position as never) : undefined,
      seasonStats: season ? { some: { season } } : undefined,
      watchlistEntries: isWatchlistOnly ? { some: { tenantId: session.tenantId } } : undefined,
    },
    include: {
      currentTeam: { include: { league: true } },
      seasonStats: { orderBy: { updatedAt: "desc" }, take: 1 },
      watchlistEntries: {
        where: { tenantId: session.tenantId },
      },
    },
    take: 50,
    orderBy: { name: "asc" },
  });

  // Built query string helpers for the toggles
  const getQueryString = (overrides: Record<string, string | null>) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (position) params.set("position", position);
    if (season) params.set("season", season);
    if (watchlist) params.set("watchlist", watchlist);
    if (view) params.set("view", view);

    Object.entries(overrides).forEach(([key, val]) => {
      if (val === null) {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });

    const str = params.toString();
    return str ? `?${str}` : "";
  };

  return (
    <div className="grid gap-6">
      <PageHeader
        icon={Search}
        eyebrow="Catálogo"
        title="Scouting"
        subtitle={isWatchlistOnly ? "Tu lista de seguimiento personalizada de jugadores." : "Buscá y filtrá jugadores en tu catálogo."}
      />

      {/* Filters Form */}
      <form className="flex flex-wrap items-end gap-4 rounded-2xl border border-border bg-card p-5">
        <div className="flex-1 min-w-[240px] grid gap-1.5">
          <label htmlFor="q" className="text-xs font-semibold text-muted">Nombre del jugador</label>
          <input
            id="q"
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Buscar por nombre…"
            className="w-full rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
          />
        </div>
        
        <div className="grid gap-1.5">
          <label htmlFor="position" className="text-xs font-semibold text-muted">Posición</label>
          <select
            id="position"
            name="position"
            defaultValue={position ?? ""}
            className="w-44 rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
          >
            <option value="">Todas</option>
            <option value="GK">Arquero</option>
            <option value="DEF">Defensor</option>
            <option value="MID">Mediocampista</option>
            <option value="FWD">Delantero</option>
          </select>
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="season" className="text-xs font-semibold text-muted">Temporada</label>
          <input
            id="season"
            type="text"
            name="season"
            defaultValue={season}
            placeholder="Ej: 2026…"
            className="w-32 rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
          />
        </div>

        {/* Hidden inputs to preserve watchlist & view states */}
        {watchlist && <input type="hidden" name="watchlist" value={watchlist} />}
        {view && <input type="hidden" name="view" value={view} />}

        <div className="flex gap-2">
          <button type="submit" className="rounded-lg bg-navy hover:bg-navy-2 px-5 py-2 text-sm font-semibold text-white transition-colors cursor-pointer">
            Buscar
          </button>
          
          {(q || position || season) && (
            <Link
              href={isWatchlistOnly ? "?watchlist=true" : "/scouting"}
              className="rounded-lg border border-border bg-surface hover:bg-card px-3 py-2 text-sm text-muted hover:text-text transition-colors"
            >
              Limpiar
            </Link>
          )}
        </div>
      </form>

      {/* Control Bar (View Toggles + Watchlist Toggle) */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex gap-2">
          <Link
            href={getQueryString({ watchlist: isWatchlistOnly ? null : "true" })}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
              isWatchlistOnly
                ? "border-accent/40 bg-accent/10 text-accent"
                : "border-border bg-card text-muted hover:text-text hover:border-border-2"
            }`}
          >
            <Bookmark size={12} />
            Watchlist
          </Link>
        </div>

        <div className="flex items-center gap-1 bg-surface border border-border p-1 rounded-lg">
          <Link
            href={getQueryString({ view: "grid" })}
            aria-label="Vista cuadrícula"
            className={`p-1.5 rounded-md transition-colors ${
              activeView === "grid" ? "bg-card text-accent border border-border" : "text-muted hover:text-text"
            }`}
          >
            <Grid size={14} />
          </Link>
          <Link
            href={getQueryString({ view: "table" })}
            aria-label="Vista tabla"
            className={`p-1.5 rounded-md transition-colors ${
              activeView === "table" ? "bg-card text-accent border border-border" : "text-muted hover:text-text"
            }`}
          >
            <List size={14} />
          </Link>
        </div>
      </div>

      {/* Results */}
      {players.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border bg-card">
          <HelpCircle size={28} className="text-muted" strokeWidth={1.5} />
          <p className="mt-3 text-sm font-semibold text-text">No se encontraron jugadores</p>
          <p className="text-xs text-muted mt-1 max-w-xs">
            Intentá cambiar los filtros o asegurate de haber cargado datos en la sección correspondiente.
          </p>
        </div>
      ) : activeView === "grid" ? (
        /* GRID VIEW */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((p) => {
            const hasWatchlist = p.watchlistEntries.length > 0;
            return (
              <div
                key={p.id}
                className="group relative rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-border-2 hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.35)]"
              >
                <div className="flex items-start justify-between">
                  <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${POSITION_COLORS[p.positionGroup] || "border-border text-muted"}`}>
                    {POSITION_LABELS[p.positionGroup] || p.positionGroup}
                  </span>
                  
                  {hasWatchlist && (
                    <Bookmark size={14} className="text-accent fill-accent" />
                  )}
                </div>

                <h3 className="mt-4 text-sm font-black text-text group-hover:text-accent transition-colors leading-tight">
                  <Link href={`/players/${p.id}`} className="hover:underline">
                    {p.name}
                  </Link>
                </h3>

                <div className="mt-4 space-y-2 border-t border-border/60 pt-3 text-xs text-muted">
                  <div className="flex justify-between">
                    <span>Equipo</span>
                    <span className="font-semibold text-text">{p.currentTeam?.name ?? "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Liga</span>
                    <span className="font-semibold text-text truncate max-w-[150px]">{p.currentTeam?.league.name ?? "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Minutos</span>
                    <span className="font-mono font-semibold text-text">{p.seasonStats[0]?.minutesPlayed ?? "—"}&nbsp;min</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="overflow-x-auto rounded-2xl border border-border bg-card custom-scrollbar">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface">
                {["Jugador", "Posición", "Equipo", "Liga", "Minutos"].map((h) => (
                  <th key={h} className="p-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {players.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-b-0 hover:bg-surface/50 transition-colors">
                  <td className="p-3.5">
                    <div className="flex items-center gap-2">
                      <Link href={`/players/${p.id}`} className="font-bold text-text hover:underline hover:text-accent">
                        {p.name}
                      </Link>
                      {p.watchlistEntries.length > 0 && (
                        <Bookmark size={10} className="text-accent fill-accent" />
                      )}
                    </div>
                  </td>
                  <td className="p-3.5 text-xs">
                    <span className={`inline-block rounded-md border px-2 py-0.5 font-semibold text-[10px] ${POSITION_COLORS[p.positionGroup] || "border-border text-muted"}`}>
                      {p.positionGroup}
                    </span>
                  </td>
                  <td className="p-3.5 text-xs text-muted font-medium">{p.currentTeam?.name ?? "—"}</td>
                  <td className="p-3.5 text-xs text-muted font-medium">{p.currentTeam?.league.name ?? "—"}</td>
                  <td className="p-3.5 text-xs text-muted font-mono font-semibold tabular-nums">
                    {p.seasonStats[0]?.minutesPlayed ? `${p.seasonStats[0].minutesPlayed.toLocaleString()}′` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
