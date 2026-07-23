import { Trophy } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { CompeticionClient } from "@/components/competicion/CompeticionClient";

export default async function CompeticionPage() {
  const session = await requireSession();

  const competitions = await prisma.competition.findMany({
    where: { tenantId: session.tenantId },
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    include: {
      matches: {
        orderBy: [{ round: "asc" }, { matchDate: "asc" }],
      },
      standings: {
        orderBy: { points: "desc" },
      },
    },
  });

  // Serialize for client
  const serialized = competitions.map((c: any) => ({
    id: c.id,
    name: c.name,
    season: c.season,
    country: c.country,
    isActive: c.isActive,
    matches: c.matches.map((m: any) => ({
      id: m.id,
      homeTeam: m.homeTeam,
      awayTeam: m.awayTeam,
      homeScore: m.homeScore,
      awayScore: m.awayScore,
      matchDate: m.matchDate?.toISOString() ?? null,
      round: m.round,
      venue: m.venue,
      status: m.status,
    })),
    standings: c.standings.map((s: any) => ({
      id: s.id,
      teamName: s.teamName,
      played: s.played,
      wins: s.wins,
      draws: s.draws,
      losses: s.losses,
      goalsFor: s.goalsFor,
      goalsAgainst: s.goalsAgainst,
      points: s.points,
    })),
  }));

  return (
    <div className="grid gap-6">
      <PageHeader
        icon={Trophy}
        eyebrow="Competiciones"
        title="Torneos y Resultados"
        subtitle="Gestión de torneos, resultados, tabla de posiciones y fixture del club."
      />
      <CompeticionClient competitions={serialized} />
    </div>
  );
}
