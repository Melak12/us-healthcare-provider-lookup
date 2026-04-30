// Prisma configuration file (Prisma 7+).
// See https://pris.ly/d/prisma-config for full reference.
//
// Prisma 7 uses the Driver Adapter pattern at runtime (see lib/prisma.ts).
// The `datasource.url` here is used ONLY by the Prisma CLI for migrations
// and introspection — it should point to the Neon DIRECT (non-pooled)
// connection string so that DDL statements work reliably with Prisma Migrate.
//
// Environment variables:
//   DATABASE_URL  — Neon pooled connection, used by the app at runtime.
//   DIRECT_URL    — Neon direct connection, used by Prisma CLI for migrations.
import { config as loadEnv } from 'dotenv';
import { defineConfig } from "prisma/config";

loadEnv();

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl
  },
});
