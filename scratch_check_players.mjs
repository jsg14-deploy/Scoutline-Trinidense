import { PrismaClient } from './src/generated/prisma/client.js';
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
dotenv.config();

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:localdev@localhost:5433/scoutline";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function run() {
  try {
    const tenants = await prisma.tenant.findMany();
    for (const t of tenants) {
      console.log(`\n===================`);
      console.log(`Tenant: ${t.name} (${t.id})`);

      // Count salaries
      const salariesCount = await prisma.playerSalary.count({ where: { tenantId: t.id } });
      // Count injuries
      const injuriesCount = await prisma.injury.count({ where: { tenantId: t.id } });
      // Count skinfolds
      const skinfoldsCount = await prisma.skinfoldMeasurement.count({ where: { tenantId: t.id } });

      console.log(`- Salaries: ${salariesCount}`);
      console.log(`- Injuries: ${injuriesCount}`);
      console.log(`- Skinfolds: ${skinfoldsCount}`);

      // List some players with salaries
      const playerSalaries = await prisma.playerSalary.findMany({
        where: { tenantId: t.id },
        include: { player: { include: { currentTeam: true } } },
        take: 5
      });
      console.log(`Sample Players with Salaries:`);
      for (const ps of playerSalaries) {
        console.log(`  * ${ps.player.name} (${ps.player.currentTeam?.name ?? 'No Team'}) - Salary: ${ps.monthlySalary} ${ps.currency}`);
      }
    }
  } catch (error) {
    console.error('Error running script:', error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
