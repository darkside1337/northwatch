import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "@/config/env";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  pool: Pool | undefined;
};

export const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: env.DATABASE_URL,
    max: env.NODE_ENV === "production" ? 3 : 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
  });

globalForDb.pool = pool;

export const db = drizzle(pool, { schema });
export type Database = typeof db;

