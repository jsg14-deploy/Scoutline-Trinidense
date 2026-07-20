import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// max bajo a propósito: en serverless cada instancia abre su propio pool, y
// atrás de esto está el transaction pooler de Supabase (pgbouncer) — muchas
// conexiones por instancia agotan el límite de conexiones de Postgres.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 3 });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
