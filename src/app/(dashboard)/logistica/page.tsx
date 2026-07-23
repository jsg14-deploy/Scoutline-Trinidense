import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { Plane, Building, Wallet, TrendingUp, type LucideIcon } from "lucide-react";
import { AiLogisticsAnalyzer } from "@/components/logistics/AiLogisticsAnalyzer";

export default async function LogisticaDashboardPage() {
  const session = await requireSession();

  // Fetch summary data
  const [totalExpenses, trips, providers] = await Promise.all([
    prisma.logisticsExpense.aggregate({
      where: { tenantId: session.tenantId },
      _sum: { amount: true },
    }),
    prisma.logisticsTrip.findMany({
      where: { tenantId: session.tenantId },
      orderBy: { departureDate: "desc" },
      take: 5,
      include: {
        _count: { select: { expenses: true } }
      }
    }),
    prisma.logisticsProvider.count({
      where: { tenantId: session.tenantId },
    })
  ]);

  const totalSpent = totalExpenses._sum.amount?.toNumber() || 0;
  const nextTrip = trips.find(t => t.departureDate >= new Date()) || trips[0];

  return (
    <div className="grid gap-6">
      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard 
          icon={Wallet} 
          label="Gasto Total Acumulado" 
          value={`$${totalSpent.toLocaleString()}`} 
        />
        <KpiCard 
          icon={Plane} 
          label="Viajes Registrados" 
          value={trips.length.toString()} 
        />
        <KpiCard 
          icon={Building} 
          label="Proveedores Activos" 
          value={providers.toString()} 
        />
        <KpiCard 
          icon={TrendingUp} 
          label="Estado Próximo Viaje" 
          value={nextTrip ? (nextTrip.departureDate >= new Date() ? "Planificado" : "Completado") : "Ninguno"} 
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Próximos Viajes */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#f2c230]">Últimos Viajes</h2>
          {trips.length === 0 ? (
            <p className="text-sm text-muted">No hay viajes registrados aún.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm tabular-nums">
                <thead>
                  <tr className="border-b border-border bg-surface text-left">
                    <th className="p-3 font-semibold text-muted">Destino</th>
                    <th className="p-3 font-semibold text-muted">Salida</th>
                    <th className="p-3 font-semibold text-muted">Estado</th>
                    <th className="p-3 font-semibold text-muted text-right">Gastos Asociados</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.map(trip => (
                    <tr key={trip.id} className="border-b border-border last:border-0 hover:bg-surface transition-colors">
                      <td className="p-3 font-medium text-text">{trip.destination}</td>
                      <td className="p-3 text-muted">{trip.departureDate.toLocaleDateString("es-PY")}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          trip.status === "completed" ? "bg-positive/20 text-positive" : 
                          trip.status === "active" ? "bg-accent/20 text-accent" : "bg-surface border border-border text-muted"
                        }`}>
                          {trip.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-right text-muted">{trip._count.expenses}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* AI Analyzer */}
        <div className="lg:col-span-1">
          <AiLogisticsAnalyzer />
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value }: { icon: LucideIcon, label: string, value: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface border border-border">
        <Icon size={24} className="text-accent" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
        <p className="mt-1 font-display text-2xl font-bold text-text tabular-nums">{value}</p>
      </div>
    </div>
  );
}
