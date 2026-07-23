// Migration script: mark existing Trinidense squad players as isSquadPlayer=true
// Run: node scripts/migrate-squad-players.mjs
import { PrismaClient } from "../src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Buscando jugadores del equipo Trinidense...");

  // Find all teams that belong to Trinidense
  const trinidenseTeams = await prisma.team.findMany({
    where: { name: { contains: "Trinidense", mode: "insensitive" } },
  });

  if (trinidenseTeams.length === 0) {
    console.log("⚠️  No se encontraron equipos de Trinidense. Verificá la base de datos.");
    process.exit(0);
  }

  const teamIds = trinidenseTeams.map(t => t.id);
  console.log(`✅ Equipos encontrados: ${trinidenseTeams.map(t => t.name).join(", ")}`);

  // Mark all players in those teams as squad players
  const result = await prisma.player.updateMany({
    where: {
      currentTeamId: { in: teamIds },
      isSquadPlayer: false,
      deletedAt: null,
    },
    data: {
      isSquadPlayer: true,
    },
  });

  console.log(`✅ ${result.count} jugadores marcados como isSquadPlayer=true`);

  // Count total squad players now
  const total = await prisma.player.count({
    where: { isSquadPlayer: true, deletedAt: null },
  });
  console.log(`📋 Total plantel activo: ${total} jugadores`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
