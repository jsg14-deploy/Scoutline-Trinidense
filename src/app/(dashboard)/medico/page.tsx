import Link from "next/link";
import { HeartPulse } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { PageHeader } from "@/components/dashboard/PageHeader";

export default async function MedicoPage() {
  const session = await requireSession();

  const players = await prisma.player.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      positionGroup: true,
      currentTeam: { select: { name: true } },
      injuries: {
        where: { tenantId: session.tenantId, status: { not: "recovered" } },
        select: { id: true },
      },
      skinfoldMeasurements: {
        where: { tenantId: session.tenantId },
        orderBy: { measuredAt: "desc" },
        take: 1,
        select: { measuredAt: true, bodyFatPercent: true },
      },
    },
    take: 300,
  });

  return (
    <div className="grid gap-8">
      <PageHeader
        icon={HeartPulse}
        eyebrow="Departamento médico"
        title="Médico y Nutrición"
        subtitle="Seguimiento de lesiones y control antropométrico (pliegues) por jugador."
      />

      {players.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border-2 bg-card p-16 text-center">
          <HeartPulse size={28} className="text-muted" strokeWidth={1.5} />
          <p className="text-sm font-semibold text-text">Todavía no hay jugadores cargados</p>
          <p className="max-w-sm text-sm text-muted">
            Subí un export desde <span className="text-accent">Datos</span> para poder llevar el seguimiento médico.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface">
                {["Jugador", "Posición", "Equipo", "Lesiones activas", "Última medición", ""].map((h) => (
                  <th key={h} className="p-3 text-left text-xs font-semibold text-muted">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {players.map((p) => {
                const activeInjuries = p.injuries.length;
                const lastMeasurement = p.skinfoldMeasurements[0];
                return (
                  <tr key={p.id} className="border-b border-border last:border-b-0 hover:bg-surface">
                    <td className="p-3 font-medium text-text">{p.name}</td>
                    <td className="p-3 text-xs text-muted">{p.positionGroup}</td>
                    <td className="p-3 text-xs text-muted">{p.currentTeam?.name ?? "—"}</td>
                    <td className="p-3">
                      {activeInjuries > 0 ? (
                        <span className="rounded-full bg-negative/15 px-2.5 py-1 text-xs font-semibold text-negative">
                          {activeInjuries} activa{activeInjuries > 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span className="rounded-full bg-positive/15 px-2.5 py-1 text-xs font-semibold text-positive">
                          Sin lesiones
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-xs text-muted">
                      {lastMeasurement
                        ? `${lastMeasurement.measuredAt.toISOString().slice(0, 10)}${
                            lastMeasurement.bodyFatPercent ? ` · ${lastMeasurement.bodyFatPercent}% grasa` : ""
                          }`
                        : "—"}
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/medico/${p.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text transition-colors hover:border-accent hover:text-accent"
                      >
                        Ver ficha
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
