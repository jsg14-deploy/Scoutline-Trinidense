import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { Trash2, Wallet } from "lucide-react";
import { deleteLogisticsExpense } from "@/app/actions/logistics";

export default async function GastosPage() {
  const session = await requireSession();

  const [expenses, trips, providers] = await Promise.all([
    prisma.logisticsExpense.findMany({
      where: { tenantId: session.tenantId },
      orderBy: { createdAt: "desc" },
      include: {
        trip: true,
        provider: true
      }
    }),
    prisma.logisticsTrip.findMany({
      where: { tenantId: session.tenantId },
      orderBy: { departureDate: "desc" }
    }),
    prisma.logisticsProvider.findMany({
      where: { tenantId: session.tenantId },
      orderBy: { name: "asc" }
    })
  ]);

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_350px]">
      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface text-left">
              <th className="p-4 font-semibold text-muted">Fecha</th>
              <th className="p-4 font-semibold text-muted">Descripción</th>
              <th className="p-4 font-semibold text-muted">Categoría</th>
              <th className="p-4 font-semibold text-muted text-right">Monto</th>
              <th className="p-4 font-semibold text-muted">Viaje / Prov.</th>
              <th className="p-4 font-semibold text-muted">Estado</th>
              <th className="p-4 font-semibold text-muted"></th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted">
                  <Wallet size={24} className="mx-auto mb-2 opacity-50" />
                  No hay gastos registrados.
                </td>
              </tr>
            ) : (
              expenses.map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0 hover:bg-surface transition-colors tabular-nums">
                  <td className="p-4 text-muted">{e.createdAt.toLocaleDateString("es-PY")}</td>
                  <td className="p-4 font-medium text-text max-w-[200px] truncate">{e.description}</td>
                  <td className="p-4 text-muted">{e.category}</td>
                  <td className="p-4 text-right font-semibold text-text">${e.amount.toNumber().toLocaleString()}</td>
                  <td className="p-4 text-xs text-muted max-w-[150px] truncate">
                    {e.trip?.destination || "—"} <br />
                    {e.provider?.name && <span className="text-accent">{e.provider.name}</span>}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      e.status === "paid" ? "bg-positive/20 text-positive" : 
                      e.status === "approved" ? "bg-accent/20 text-accent" : "bg-surface border border-border text-muted"
                    }`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <form action={deleteLogisticsExpense.bind(null, e.id)}>
                      <button className="text-muted hover:text-negative transition-colors" title="Eliminar gasto">
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
        <ExpenseForm trips={trips} providers={providers} />
      </div>
    </div>
  );
}

import { ExpenseForm } from "./ExpenseForm";
