import { PrismaClient } from './src/generated/prisma/client.js';
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
dotenv.config();

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:localdev@localhost:5433/scoutline";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function run() {
  try {
    const tenants = await prisma.tenant.findMany({
      include: {
        users: true
      }
    });
    console.log(`Total tenants: ${tenants.length}`);
    for (const t of tenants) {
      console.log(`Tenant: "${t.name}" (ID: ${t.id}, Slug: ${t.slug})`);
      console.log(`Users in this tenant:`);
      for (const u of t.users) {
        console.log(`  - ${u.fullName} (${u.email}) - Role: ${u.role}`);
      }
    }
  } catch (error) {
    console.error('Error running script:', error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
