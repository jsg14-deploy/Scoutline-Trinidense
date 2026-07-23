import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { CompareSelector } from "@/components/players/CompareSelector";
import { CompareRadar } from "@/components/players/CompareRadar";
import { CompareAIReport } from "@/components/players/CompareAIReport";

type SearchParams = Promise<{ p1?: string; p2?: string }>;

export default async function ComparePage({ searchParams }: { searchParams: SearchParams }) {
  await requireSession();
  const { p1, p2 } = await searchParams;

  let player1 = null;
  let player2 = null;

  if (p1) {
    player1 = await prisma.player.findUnique({
      where: { id: p1 },
      include: {
        currentTeam: { include: { league: true } },
        marketData: true,
        seasonStats: { orderBy: { updatedAt: "desc" }, take: 1 },
      },
    });
  }

  if (p2) {
    player2 = await prisma.player.findUnique({
      where: { id: p2 },
      include: {
        currentTeam: { include: { league: true } },
        marketData: true,
        seasonStats: { orderBy: { updatedAt: "desc" }, take: 1 },
      },
    });
  }

  const p1Stats = player1?.seasonStats[0];
  const p2Stats = player2?.seasonStats[0];

  const p1Percentiles = (p1Stats?.percentilesJson as Record<string, number>) || {};
  const p2Percentiles = (p2Stats?.percentilesJson as Record<string, number>) || {};

  const p1Market = player1?.marketData[0];
  const p2Market = player2?.marketData[0];

  return (
    <div className="grid gap-6">
      <div>
        <Link href="/scouting" className="text-xs text-muted hover:text-accent mb-2 inline-block">
          ← Volver a Scouting
        </Link>
        <PageHeader
          icon={Scale}
          eyebrow="Scouting"
          title="Comparación Head-to-Head"
          subtitle="Analizá dos jugadores frente a frente con gráficos de radar superpuestos e Inteligencia Artificial."
        />
      </div>

      <CompareSelector p1={p1} p2={p2} />

      {player1 && player2 && (
        <div className="grid gap-6">
          {/* Header profiles */}
          <div className="grid gap-4 md:grid-cols-2">
            <ProfileCard 
              player={player1} 
              stats={p1Stats} 
              market={p1Market} 
              color="accent" 
              borderColor="border-accent/40" 
            />
            <ProfileCard 
              player={player2} 
              stats={p2Stats} 
              market={p2Market} 
              color="[#34d399]" 
              borderColor="border-[#34d399]/40" 
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Radar Chart */}
            <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-6">Comparativa de Percentiles</h3>
              {Object.keys(p1Percentiles).length > 0 || Object.keys(p2Percentiles).length > 0 ? (
                <CompareRadar 
                  percentiles1={p1Percentiles} 
                  percentiles2={p2Percentiles} 
                  name1={player1.name} 
                  name2={player2.name} 
                />
              ) : (
                <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border bg-surface">
                  <p className="text-sm text-muted">No hay datos de percentiles suficientes para comparar.</p>
                </div>
              )}
            </div>

            {/* Basic Stats Table / Bar chart replacement */}
            <div className="rounded-2xl border border-border bg-card p-6">
               <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-4">Datos Clave (Por 90')</h3>
               <div className="space-y-4">
                  <StatCompare 
                    label="Minutos Jugados" 
                    v1={p1Stats?.minutesPlayed || 0} 
                    v2={p2Stats?.minutesPlayed || 0} 
                  />
                  {/* Extract some common raw stats if available in statsJson, else just show a message */}
                  <p className="text-xs text-muted italic mt-4">
                    La visualización completa de métricas brutas estará disponible próximamente en esta vista. 
                    Revisá el radar para los percentiles de rendimiento.
                  </p>
               </div>
            </div>
          </div>

          {/* AI Report */}
          <CompareAIReport 
            data={{
              player1: {
                name: player1.name,
                position: player1.positionGroup,
                info: { height: player1.heightCm, foot: player1.foot },
                stats: p1Stats?.statsJson || {},
                percentiles: p1Percentiles
              },
              player2: {
                name: player2.name,
                position: player2.positionGroup,
                info: { height: player2.heightCm, foot: player2.foot },
                stats: p2Stats?.statsJson || {},
                percentiles: p2Percentiles
              }
            }} 
          />
        </div>
      )}
    </div>
  );
}

function ProfileCard({ player, stats, market, color, borderColor }: { player: any; stats: any; market: any; color: string; borderColor: string }) {
  return (
    <div className={`rounded-2xl border bg-card p-5 border-l-4 border-l-${color} border-t-border border-r-border border-b-border relative overflow-hidden`}>
      <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none`}></div>
      <h3 className="font-display text-xl font-black text-text mb-1 relative z-10">{player.name}</h3>
      <p className="text-xs font-semibold text-muted mb-4 relative z-10">
        <span className={`text-${color}`}>{player.positionGroup}</span> · {player.currentTeam?.name || "Libre"}
      </p>
      
      <div className="grid grid-cols-2 gap-y-2 text-xs relative z-10">
        <div className="text-muted">Edad / Altura</div>
        <div className="font-semibold text-text tabular-nums">{player.heightCm ? `${player.heightCm} cm` : "—"}</div>
        
        <div className="text-muted">Minutos (Temp)</div>
        <div className="font-semibold text-text tabular-nums">{stats?.minutesPlayed ? `${stats.minutesPlayed}'` : "—"}</div>
        
        <div className="text-muted">Valor / Contrato</div>
        <div className="font-semibold text-text tabular-nums">
          {market?.marketValueEur ? `€${Number(market.marketValueEur).toLocaleString()}` : "—"} 
          {market?.contractExpiry ? ` (Vence ${new Date(market.contractExpiry).getFullYear()})` : ""}
        </div>
      </div>
    </div>
  );
}

function StatCompare({ label, v1, v2 }: { label: string, v1: number, v2: number }) {
  const max = Math.max(v1, v2, 1);
  const p1Width = (v1 / max) * 100;
  const p2Width = (v2 / max) * 100;
  
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-text font-bold">{v1}</span>
        <span className="text-muted font-semibold">{label}</span>
        <span className="text-text font-bold">{v2}</span>
      </div>
      <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-surface">
        <div className="w-1/2 flex justify-end">
          <div className="bg-accent h-full rounded-l-full" style={{ width: `${p1Width}%` }}></div>
        </div>
        <div className="w-1/2 flex justify-start">
          <div className="bg-[#34d399] h-full rounded-r-full" style={{ width: `${p2Width}%` }}></div>
        </div>
      </div>
    </div>
  );
}
