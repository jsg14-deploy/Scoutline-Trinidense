import { Users } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { PlantelClient } from "@/components/plantel/PlantelClient";

export default async function PlantelPage() {
  const session = await requireSession();

  const players = await prisma.player.findMany({
    where: {
      isSquadPlayer: true,
      deletedAt: null,
    },
    orderBy: [{ shirtNumber: "asc" }, { name: "asc" }],
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

  // Serialize Decimal and Date for client component
  const serialized = players.map(p => ({
    id: p.id,
    name: p.name,
    nationality: p.nationality,
    positionGroup: p.positionGroup,
    foot: p.foot,
    heightCm: p.heightCm,
    weightKg: p.weightKg,
    shirtNumber: p.shirtNumber,
    contractExpiry: p.contractExpiry ? p.contractExpiry.toISOString() : null,
    notes: p.notes,
    salaries: p.salaries.map(s => ({
      monthlySalary: Number(s.monthlySalary),
      currency: s.currency,
    })),
    injuries: p.injuries.map(i => ({
      diagnosis: i.diagnosis,
    })),
    skinfoldMeasurements: p.skinfoldMeasurements.map(s => ({
      bodyFatPercent: s.bodyFatPercent,
    })),
  }));

  return (
    <div className="grid gap-6">
      <PageHeader
        icon={Users}
        eyebrow="Plantel principal"
        title="Plantel de Trinidense"
        subtitle="Gestión completa del primer equipo: datos físicos, médicos y contractuales."
      />

      <PlantelClient players={serialized as Parameters<typeof PlantelClient>[0]["players"]} />
    </div>
  );
}
