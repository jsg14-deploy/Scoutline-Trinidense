import Link from "next/link";
import { Users, ShieldAlert } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { PlantelManualForm } from "@/components/plantel/PlantelManualForm";
import type { PositionGroup } from "@/generated/prisma/enums";

export default async function PlantelPage() {
  const session = await requireSession();

  // Cargamos todos los jugadores con salarios, lesiones y pliegues en esta sesión
  const players = await prisma.player.findMany({
    orderBy: { name: "asc" },
    include: {
      currentTeam: true,
      salaries: {
        where: { tenantId: session.tenantId },
        orderBy: { season: "desc" },
        take: 1,
      },
      injuries: {
        where: { tenantId: session.tenantId, status: { not: "recovered" } },
        orderBy: { occurredAt: "desc" },
        take: 1,
      },
      skinfoldMeasurements: {
        where: { tenantId: session.tenantId },
        orderBy: { measuredAt: "desc" },
        take: 1,
      },
    },
  });

  // Agrupamos por posición
  const grouped: Record<PositionGroup, typeof players> = {
    GK: [],
    DEF: [],
    MID: [],
    FWD: [],
  };

  for (const p of players) {
    if (grouped[p.positionGroup]) {
      grouped[p.positionGroup].push(p);
    }
  }

  const positionLabels: Record<PositionGroup, string> = {
    GK: "Arqueros",
    DEF: "Defensores",
    MID: "Mediocampistas",
    FWD: "Delanteros",
  };

  return (
    <div className="grid gap-8">
      <PageHeader
        icon={Users}
        eyebrow="Plantel principal"
        title="Plantel de Trinidense"
        subtitle="Visualizá toda la información unificada del plantel: datos físicos, médicos y salarios."
      />

      {/* Formulario para agregar jugador manual */}
      <div>
        <h2 className="mb-3 text-sm font-bold text-text uppercase tracking-wider text-[#f2c230]">Registrar nuevo jugador en el plantel</h2>
        <PlantelManualForm />
      </div>

      {/* Listado agrupado */}
      <div className="grid gap-8">
        {(Object.keys(grouped) as PositionGroup[]).map((pos) => {
          const list = grouped[pos];
          if (list.length === 0) return null;

          return (
            <div key={pos} className="grid gap-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#8f9bc7] border-b border-border pb-1">
                {positionLabels[pos]} ({list.length})
              </h2>

              <div className="overflow-x-auto rounded-2xl border border-border bg-card">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface text-xs font-semibold text-muted">
                      <th className="p-3 text-left">Jugador</th>
                      <th className="p-3 text-left">Nacionalidad</th>
                      <th className="p-3 text-left">Pie hábil</th>
                      <th className="p-3 text-left">Altura</th>
                      <th className="p-3 text-left">Estado Médico</th>
                      <th className="p-3 text-left">Último % Grasa</th>
                      <th className="p-3 text-left">Salario Mensual</th>
                      <th className="p-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((p) => {
                      const latestSalary = p.salaries[0];
                      const activeInjury = p.injuries[0];
                      const latestSkinfold = p.skinfoldMeasurements[0];

                      return (
                        <tr key={p.id} className="border-b border-border last:border-b-0 hover:bg-surface text-sm">
                          <td className="p-3 font-semibold text-text">
                            <Link href={`/players/${p.id}`} className="hover:underline hover:text-accent">
                              {p.name}
                            </Link>
                          </td>
                          <td className="p-3 text-muted">{p.nationality ?? "—"}</td>
                          <td className="p-3 text-muted capitalize">{p.foot ?? "—"}</td>
                          <td className="p-3 text-muted">{p.heightCm ? `${p.heightCm} cm` : "—"}</td>
                          <td className="p-3">
                            {activeInjury ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-negative/15 px-2.5 py-0.5 text-xs font-semibold text-negative" title={activeInjury.diagnosis}>
                                <ShieldAlert size={10} />
                                Lesionado
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-positive/15 px-2.5 py-0.5 text-xs font-semibold text-positive">
                                Apto
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-muted">
                            {latestSkinfold?.bodyFatPercent ? `${latestSkinfold.bodyFatPercent}%` : "—"}
                          </td>
                          <td className="p-3 font-mono text-text">
                            {latestSalary ? `${latestSalary.currency} ${Math.round(Number(latestSalary.monthlySalary)).toLocaleString("es-PY")}` : "—"}
                          </td>
                          <td className="p-3 text-right">
                            <Link
                              href={`/medico/${p.id}`}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-text transition-colors hover:border-accent hover:text-accent mr-2"
                            >
                              Médico
                            </Link>
                            <Link
                              href={`/players/${p.id}`}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-text transition-colors hover:border-accent hover:text-accent"
                            >
                              Ficha
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
