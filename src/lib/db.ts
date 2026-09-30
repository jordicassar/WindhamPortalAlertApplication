import 'server-only';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';

/**
 * One Prisma client per server instance. Each serverless instance keeps a small
 * pool; under load the host adds instances, so DATABASE_URL should point at a
 * pooled endpoint (Neon's "-pooler" host, or PgBouncer) to protect Postgres
 * from running out of connections.
 */
function createClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    max: Number(process.env.DATABASE_POOL_MAX ?? 5),
  });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Reuse the client across hot reloads in development.
export const db = globalForPrisma.prisma ?? createClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
