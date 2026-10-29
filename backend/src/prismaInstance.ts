import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

// DATABASE_URL points at Neon's *pooled* (-pooler) endpoint, i.e. PgBouncer
// already pools connections server-side. The `pg` pool created by PrismaPg
// therefore stays small — stacking a large client pool on top of PgBouncer
// only makes a connection checkout slower, it does not add capacity.
// (Note: a `connection_pool=50` query param in DATABASE_URL is not a
// `pg`/PrismaPg setting and is ignored here — pool size is `max` below.)
//
// connectionTimeoutMillis must comfortably exceed Neon cold-start latency:
// waking a suspended Neon compute + TLS + pooler took ~3.9s in testing,
// while Prisma's interactive-transaction `maxWait` defaults to only 2s.
// Without this, the first request after idle fails with P2028
// ("Unable to start a transaction in the given time").
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  max: 5,
  connectionTimeoutMillis: 15_000,
  idleTimeoutMillis: 30_000,
});

export const prisma = new PrismaClient({ adapter });
