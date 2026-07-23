import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { Trash2, Plane } from "lucide-react";
import { deleteLogisticsTrip } from "@/app/actions/logistics";

export default async function ViajesPage() {
  const session = await requireSession();

  const trips = await prisma.logisticsTrip.findMany({
    where: { tenantId: session.tenantId },
    orderBy: { departureDate: "desc" },
    include: {
      _count: {
        select: { expenses: true }
      }
    }
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface text-left">
              <th className="p-4 font-semibold text-muted">Destino / Partido</th>
              <th className="p-4 font-semibold text-muted">Fechas</th>
              <th className="p-4 font-semibold text-muted">Estado</th>
              <th className="p-4 font-semibold text-muted">Gastos</th>
              <th className="p-4 font-semibold text-muted"></th>
            </tr>
          </thead>
          <tbody>
            {trips.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted">
                  <Plane size={24} className="mx-auto mb-2 opacity-50" />
                  No hay viajes registrados.
                </td>
              </tr>
            ) : (
              trips.map((t) => (
                <tr key={t.id} className="border-b border-border last:border-0 hover:bg-surface transition-colors tabular-nums">
                  <td className="p-4 font-medium text-text">{t.destination}</td>
                  <td className="p-4 text-muted">
                    {t.departureDate.toLocaleDateString("es-PY")} 
                    {t.returnDate ? ` al ${t.returnDate.toLocaleDateString("es-PY")}` : ""}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                      t.status === "completed" ? "bg-positive/20 text-positive" : 
                      t.status === "active" ? "bg-accent/20 text-accent" : "bg-surface border border-border text-muted"
                    }`}>
                      {t.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-muted">{t._count.expenses} reg.</td>
                  <td className="p-4 text-right">
                    <form action={async () => { await deleteLogisticsTrip(t.id); }}>
                      <button className="text-muted hover:text-negative transition-colors" title="Eliminar viaje">
                        <Trash2 size={16} />
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div>
        <TripForm />
      </div>
    </div>
  );
}

import { TripForm } from "./TripForm";
