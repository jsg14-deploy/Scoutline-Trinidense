import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";

export async function GET(request: Request) {
  try {
    await requireSession(); // Ensure user is authenticated

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    if (!q || q.length < 2) {
      return NextResponse.json({ players: [] });
    }

    const players = await prisma.player.findMany({
      where: {
        name: { contains: q, mode: "insensitive" },
      },
      select: {
        id: true,
        name: true,
        positionGroup: true,
        currentTeam: {
          select: {
            name: true,
          }
        }
      },
      take: 10,
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ players });
  } catch (error) {
    console.error("Error in player search API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
