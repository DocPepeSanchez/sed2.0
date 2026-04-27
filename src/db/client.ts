/**
 * Cliente Drizzle compartido.
 *
 * Una sola instancia de pool por proceso. La inicialización es perezosa para
 * que `next build` (que importa rutas sin DATABASE_URL) no falle: el pool
 * solo se construye al primer uso real.
 */

import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

declare global {
  // eslint-disable-next-line no-var
  var __sedPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __sedDb: NodePgDatabase<typeof schema> | undefined;
}

function buildPool(): Pool {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL no está configurada — revise .env');
  }
  return new Pool({
    connectionString: url,
    max: 20,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    // P-05: en producción se inyecta SSL desde la cadena de conexión.
  });
}

function getPool(): Pool {
  if (!global.__sedPool) {
    global.__sedPool = buildPool();
  }
  return global.__sedPool;
}

function getDb(): NodePgDatabase<typeof schema> {
  if (!global.__sedDb) {
    global.__sedDb = drizzle(getPool(), { schema });
  }
  return global.__sedDb;
}

// Proxies que difieren la creación del pool hasta el primer acceso real,
// evitando que `next build` falle al importar rutas sin DATABASE_URL.
export const pool = new Proxy({} as Pool, {
  get(_t, prop) {
    return Reflect.get(getPool(), prop, getPool());
  },
});

export const db = new Proxy({} as NodePgDatabase<typeof schema>, {
  get(_t, prop) {
    const real = getDb() as unknown as Record<string | symbol, unknown>;
    return real[prop as string];
  },
}) as NodePgDatabase<typeof schema>;

export { schema };
