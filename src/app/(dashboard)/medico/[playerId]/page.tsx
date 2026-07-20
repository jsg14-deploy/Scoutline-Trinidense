import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { InjuryForm } from "@/components/medical/InjuryForm";
import { InjuryList } from "@/components/medical/InjuryList";
import { SkinfoldForm } from "@/components/medical/SkinfoldForm";
import { SkinfoldChart } from "@/components/medical/SkinfoldChart";
import { SkinfoldHistory } from "@/components/medical/SkinfoldHistory";

type Params = Promise<{ playerId: string }>;

export default async function MedicoPlayerPage({ params }: { params: Params }) {
  const { playerId } = await params;
  const session = await requireSession();

  const player = await prisma.player.findUnique({
    where: { id: playerId },
    include: { currentTeam: { include: { league: true } } },
  });
  if (!player) notFound();

  const [injuries, measurements] = await Promise.all([
    prisma.injury.findMany({
      where: { tenantId: session.tenantId, playerId },
      orderBy: { occurredAt: "desc" },
    }),
    prisma.skinfoldMeasurement.findMany({
      where: { tenantId: session.tenantId, playerId },
      orderBy: { measuredAt: "asc" },
    }),
  ]);

  const injuryRows = injuries.map((inj) => ({
    id: inj.id,
    diagnosis: inj.diagnosis,
    bodyPart: inj.bodyPart,
    severity: inj.severity,
    status: inj.status,
    occurredAt: inj.occurredAt.toISOString(),
    expectedReturnAt: inj.expectedReturnAt ? inj.expectedReturnAt.toISOString() : null,
    actualReturnAt: inj.actualReturnAt ? inj.actualReturnAt.toISOString() : null,
    notes: inj.notes,
  }));

  const chartPoints = measurements.map((m) => ({
    date: m.measuredAt.toISOString(),
    sumMm: m.sumMm,
    bodyFatPercent: m.bodyFatPercent,
  }));

  const historyRows = [...measurements]
    .reverse()
    .map((m) => ({
      id: m.id,
      measuredAt: m.measuredAt.toISOString(),
      weightKg: m.weightKg,
      sumMm: m.sumMm,
      bodyFatPercent: m.bodyFatPercent,
    }));

  return (
    <div className="grid gap-8">
      <div>
        <Link href="/medico" className="text-xs text-muted hover:text-accent">
          ← Volver a Médico y Nutrición
        </Link>
        <h1 className="mt-1 font-display text-2xl font-black tracking-tight text-text">{player.name}</h1>
        <p className="text-sm text-muted">
          {player.positionGroup} · {player.currentTeam?.name ?? "Sin equipo"} ({player.currentTeam?.league.name ?? "—"})
        </p>
      </div>

      <section className="grid gap-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted">Lesiones</h2>
        <InjuryForm playerId={playerId} />
        <InjuryList playerId={playerId} injuries={injuryRows} />
      </section>

      <section className="grid gap-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted">Pliegues y composición corporal</h2>
        <SkinfoldForm playerId={playerId} />
        <SkinfoldChart points={chartPoints} />
        <SkinfoldHistory playerId={playerId} rows={historyRows} />
      </section>
    </div>
  );
}
