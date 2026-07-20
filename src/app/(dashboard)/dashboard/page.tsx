import Link from "next/link";
import {
  LayoutDashboard,
  Trophy,
  UploadCloud,
  Users,
  Bookmark,
  Shirt,
  ArrowRight,
  Search,
  Target,
  BarChart3,
  Sparkles,
  Calendar,
} from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { PageHeader } from "@/components/dashboard/PageHeader";

async function getStats(tenantId: string) {
  const [players, matches, leagues, watchlist, uploads] = await Promise.all([
    prisma.player.count(),
    prisma.match.count(),
    prisma.league.count(),
    prisma.watchlistEntry.count({ where: { tenantId } }),
    prisma.dataUploadSession.count({ where: { tenantId } }),
  ]);
  return { players, matches, leagues, watchlist, uploads };
}

export default async function DashboardPage() {
  const session = await requireSession();
  const stats = await getStats(session.tenantId);

  // Fetch watchlist entries for this tenant (max 3)
  const watchlistEntries = await prisma.watchlistEntry.findMany({
    where: { tenantId: session.tenantId },
    include: {
      player: {
        include: {
          currentTeam: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  // Fetch latest upload sessions (max 3)
  const latestUploads = await prisma.dataUploadSession.findMany({
    where: { tenantId: session.tenantId },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  const tiles = [
    { label: "Jugadores en catálogo", value: stats.players, icon: Users, color: "from-blue-500/10 to-indigo-500/10" },
    { label: "Partidos cargados", value: stats.matches, icon: Shirt, color: "from-purple-500/10 to-pink-500/10" },
    { label: "Ligas", value: stats.leagues, icon: Trophy, color: "from-amber-500/10 to-orange-500/10" },
    { label: "En watchlist", value: stats.watchlist, icon: Bookmark, color: "from-teal-500/10 to-emerald-500/10" },
    { label: "Cargas de datos (SICS/GPS)", value: stats.uploads, icon: UploadCloud, color: "from-cyan-500/10 to-sky-500/10" },
  ];

  const quickActions = [
    { href: "/scouting", label: "Buscar Jugadores", desc: "Explorar catálogo y filtros", icon: Search },
    { href: "/similarity", label: "Motor de Similitud", desc: "Buscar perfiles similares", icon: Target },
    { href: "/algorithms", label: "Rankings & Algoritmos", desc: "Velocidad mental y GPS", icon: BarChart3 },
    { href: "/assistant", label: "Copiloto IA", desc: "Asistente táctico inteligente", icon: Sparkles },
  ];

  return (
    <div className="grid gap-8">
      <PageHeader
        icon={LayoutDashboard}
        eyebrow="Panorama general"
        title="Dashboard"
        subtitle="Un vistazo rápido a tu espacio de scouting."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {tiles.map((tile) => (
          <div
            key={tile.label}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-border-2 hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.35)]"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${tile.color} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
            <div className="relative z-10">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface text-accent border border-border transition-colors group-hover:border-accent/40 group-hover:bg-card">
                <tile.icon size={18} strokeWidth={1.8} />
              </div>
              <div className="mt-5 font-display text-4xl font-black tracking-tight text-text tabular-nums">{tile.value}</div>
              <div className="mt-1.5 text-xs font-medium text-muted">{tile.label}</div>
            </div>
          </div>
        ))}
      </div>

      {stats.players === 0 && (
        <div className="rounded-2xl border border-dashed border-border-2 bg-surface p-6 text-sm text-muted">
          Todavía no hay jugadores cargados. Subí un export de SICS o de GPS desde{" "}
          <Link href="/data" className="text-accent hover:underline font-semibold">
            Datos
          </Link>{" "}
          para empezar a ver similitud y percentiles.
        </div>
      )}

      {/* Quick Actions Grid */}
      <div>
        <h2 className="mb-4 text-base font-bold text-text tracking-tight">Accesos Rápidos</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 transition-all duration-300 hover:border-border-2 hover:bg-card"
            >
              <div>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-card text-muted transition-colors group-hover:bg-surface group-hover:text-accent border border-border">
                  <action.icon size={16} strokeWidth={1.8} />
                </div>
                <h3 className="mt-4 text-sm font-bold text-text group-hover:text-accent transition-colors">
                  {action.label}
                </h3>
                <p className="mt-1 text-xs text-muted leading-relaxed">{action.desc}</p>
              </div>
              <div className="mt-4 flex items-center justify-end text-muted group-hover:text-accent transition-colors">
                <ArrowRight size={14} className="transform transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Watchlist Highlights */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-text tracking-tight flex items-center gap-2">
              <Bookmark size={16} className="text-accent" />
              Jugadores en Watchlist
            </h2>
            <Link href="/scouting?watchlist=true" className="text-xs text-accent hover:underline font-semibold flex items-center gap-1">
              Ver todos <ArrowRight size={10} />
            </Link>
          </div>

          {watchlistEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-border rounded-xl bg-surface/50">
              <p className="text-xs text-muted">No tenés jugadores en tu lista de seguimiento.</p>
              <Link href="/scouting" className="mt-2 text-xs text-accent hover:underline font-medium">
                Explorar catálogo
              </Link>
            </div>
          ) : (
            <div className="grid gap-3">
              {watchlistEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-surface hover:border-border-2 transition-colors"
                >
                  <div>
                    <Link href={`/players/${entry.player.id}`} className="text-xs font-bold text-text hover:underline hover:text-accent">
                      {entry.player.name}
                    </Link>
                    <p className="text-[10px] text-muted mt-0.5">
                      {entry.player.positionGroup} · {entry.player.currentTeam?.name ?? "Sin equipo"}
                    </p>
                  </div>
                  {entry.notes && (
                    <span className="max-w-[150px] truncate text-[10px] bg-card border border-border px-2 py-0.5 rounded text-muted font-mono">
                      {entry.notes}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Latest Data Upload Sessions */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-text tracking-tight flex items-center gap-2">
              <UploadCloud size={16} className="text-accent" />
              Historial de Carga
            </h2>
            <Link href="/data" className="text-xs text-accent hover:underline font-semibold flex items-center gap-1">
              Subir más <ArrowRight size={10} />
            </Link>
          </div>

          {latestUploads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-border rounded-xl bg-surface/50">
              <p className="text-xs text-muted">Aún no se han cargado datos tácticos o físicos.</p>
              <Link href="/data" className="mt-2 text-xs text-accent hover:underline font-medium">
                Cargar archivos SICS/GPS
              </Link>
            </div>
          ) : (
            <div className="grid gap-3">
              {latestUploads.map((upload) => (
                <div
                  key={upload.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-surface hover:border-border-2 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-text truncate">
                      {upload.sourceFilename ?? "Archivo sin nombre"}
                    </p>
                    <p className="text-[10px] text-muted mt-0.5 flex items-center gap-1">
                      <span className="uppercase font-semibold text-accent">{upload.kind}</span> · {upload.deviceOrTool ?? "Herramienta genérica"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted font-mono shrink-0 bg-card border border-border px-2 py-0.5 rounded">
                    <Calendar size={10} />
                    {upload.createdAt.toISOString().slice(0, 10)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
