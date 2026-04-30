/**
 * Prisma Client singleton (Prisma 7 + Neon Postgres).
 *
 * Prisma 7 uses the Driver Adapter pattern — the client no longer reads
 * DATABASE_URL internally; instead we pass a `@prisma/adapter-neon` instance
 * that wraps `@neondatabase/serverless`.  This keeps connections compatible
 * with Neon's HTTP-based serverless driver and works seamlessly on Vercel/edge.
 *
 * In development, Next.js hot-reloads the module graph on every file save,
 * which would create a new PrismaClient on each reload and exhaust the Neon
 * connection pool.  We cache the instance on `globalThis` so only one client
 * exists per Node.js process lifetime.
 */

import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/app/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set.");
  }
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
