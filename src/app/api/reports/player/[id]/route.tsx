import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { PlayerReportDocument, type PlayerReportData } from "@/lib/reports/PlayerReportDocument";

export const maxDuration = 30;

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  const { id } = await params;

  const [player, tenant] = await Promise.all([
    prisma.player.findUnique({
      where: { id },
      include: {
        currentTeam: { include: { league: true } },
        marketData: true,
        seasonStats: { orderBy: { updatedAt: "desc" }, take: 1 },
      },
    }),
    prisma.tenant.findUnique({ where: { id: session.tenantId } }),
  ]);

  if (!player) {
    return NextResponse.json({ error: "Jugador no encontrado." }, { status: 404 });
  }

  const stats = player.seasonStats[0];
  const market = player.marketData[0];

  const reportData: PlayerReportData = {
    name: player.name,
    positionGroup: player.positionGroup,
    nationality: player.nationality,
    foot: player.foot,
    teamName: player.currentTeam?.name ?? null,
    leagueName: player.currentTeam?.league.name ?? null,
    marketValueEur: market?.marketValueEur ? Number(market.marketValueEur) : null,
    season: stats?.season ?? null,
    minutesPlayed: stats?.minutesPlayed ?? null,
    percentiles: (stats?.percentilesJson as Record<string, number> | null) ?? null,
    tenantName: tenant?.name ?? "Scoutline Trinidense",
  };

  const buffer = await renderToBuffer(<PlayerReportDocument data={reportData} />);

  await prisma.report.create({
    data: {
      tenantId: session.tenantId,
      title: `Informe — ${player.name}`,
      kind: "player_pdf",
      paramsJson: { playerId: player.id },
    },
  });

  const fileName = `${player.name.replace(/[^\w\-]+/g, "_")}_scoutline.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
