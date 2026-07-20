import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { computeMentalSpeedForPlayer } from "@/lib/algorithms/mentalSpeed";
import { PercentileRadar } from "@/components/players/PercentileRadar";
import { WatchlistButton } from "@/components/players/WatchlistButton";

type Params = Promise<{ id: string }>;

export default async function PlayerProfilePage({ params }: { params: Params }) {
  const { id } = await params;
  const session = await requireSession();

  const player = await prisma.player.findUnique({
    where: { id },
    include: {
      currentTeam: { include: { league: true } },
      marketData: true,
      seasonStats: { orderBy: { updatedAt: "desc" }, take: 1 },
    },
  });
  if (!player) notFound();

  const watchlistEntry = await prisma.watchlistEntry.findUnique({
    where: { tenantId_playerId: { tenantId: session.tenantId, playerId: id } },
  });

  const latestStats = player.seasonStats[0];
  const mentalSpeed = latestStats ? await computeMentalSpeedForPlayer(id, latestStats.season) : null;
  const market = player.marketData[0];

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/scouting" className="text-xs text-muted hover:text-accent">
            ← Volver a Scouting
          </Link>
          <h1 className="mt-1 font-display text-2xl font-black tracking-tight text-text">{player.name}</h1>
          <p className="text-sm text-muted">
            {player.positionGroup} · {player.nationality ?? "Nacionalidad no cargada"} ·{" "}
            {player.currentTeam?.name ?? "Sin equipo"} ({player.currentTeam?.league.name ?? "—"})
          </p>
        </div>
        <WatchlistButton playerId={id} inWatchlist={Boolean(watchlistEntry)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">Datos básicos</h2>
          <dl className="mt-3 grid gap-2 text-sm">
            <Row label="Pie" value={player.foot ?? "—"} />
            <Row label="Altura" value={player.heightCm ? `${player.heightCm} cm` : "—"} />
            <Row
              label="Valor de mercado"
              value={market?.marketValueEur ? `€${Number(market.marketValueEur).toLocaleString()}` : "—"}
            />
            <Row
              label="Vence contrato"
              value={market?.contractExpiry ? market.contractExpiry.toISOString().slice(0, 10) : "—"}
            />
            <Row label="Minutos (temp. actual)" value={latestStats?.minutesPlayed ?? "—"} />
            <Row
              label="Velocidad de decisión (proxy)"
              value={mentalSpeed ? `${Math.round(mentalSpeed.score)}/100` : "—"}
            />
          </dl>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
            Percentiles vs. cohorte ({latestStats?.season ?? "sin temporada"})
          </h2>
          {latestStats?.percentilesJson ? (
            <PercentileRadar percentiles={latestStats.percentilesJson as Record<string, number>} />
          ) : (
            <p className="mt-6 text-sm text-muted">
              Todavía no hay suficientes datos de eventos para calcular percentiles de este jugador.
            </p>
          )}
        </div>
      </div>

      {latestStats && (
        <Link
          href={`/similarity?playerId=${id}&season=${latestStats.season}`}
          className="justify-self-start rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Buscar jugadores similares →
        </Link>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-2 last:border-b-0">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium text-text">{value}</dd>
    </div>
  );
}
