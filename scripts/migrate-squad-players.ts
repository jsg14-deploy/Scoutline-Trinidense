// Migration script: mark existing Trinidense squad players as isSquadPlayer=true
// Run: npx tsx scripts/migrate-squad-players.ts
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL!, max: 1 });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🔄 Buscando equipos Trinidense...");

  const trinidenseTeams = await prisma.team.findMany({
    where: { name: { contains: "Trinidense", mode: "insensitive" } },
  });

  if (trinidenseTeams.length === 0) {
    console.log("⚠️  No se encontraron equipos de Trinidense.");
    console.log("   Marcando todos los jugadores existentes como plantel...");

    // If no specific team found, mark all players that are not in watchlist as squad players
    const result = await prisma.player.updateMany({
      where: { isSquadPlayer: false, deletedAt: null },
      data: { isSquadPlayer: true },
    });
    console.log(`✅ ${result.count} jugadores marcados como plantel`);
  } else {
    const teamIds = trinidenseTeams.map(t => t.id);
    console.log(`✅ Equipos: ${trinidenseTeams.map(t => t.name).join(", ")}`);

    const result = await prisma.player.updateMany({
      where: {
        currentTeamId: { in: teamIds },
        isSquadPlayer: false,
        deletedAt: null,
      },
      data: { isSquadPlayer: true },
    });
    console.log(`✅ ${result.count} jugadores marcados como isSquadPlayer=true`);
  }

  const total = await prisma.player.count({
    where: { isSquadPlayer: true, deletedAt: null },
  });
  console.log(`📋 Total plantel activo: ${total} jugadores`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
