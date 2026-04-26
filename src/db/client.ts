/**
 * Cliente Drizzle compartido.
 *
 * Una sola instancia de pool por proceso. En desarrollo se reutiliza tras HMR
 * para evitar fugas de conexiones.
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

export const pool = global.__sedPool ?? buildPool();
export const db: NodePgDatabase<typeof schema> = global.__sedDb ?? drizzle(pool, { schema });

if (process.env.NODE_ENV !== 'production') {
  global.__sedPool = pool;
  global.__sedDb = db;
}

export { schema };
