/**
 * Ejecuta migraciones generadas por drizzle-kit.
 * Uso: npm run db:migrate
 */

import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, pool } from './client';

async function main(): Promise<void> {
  await migrate(db, { migrationsFolder: './drizzle' });
  await pool.end();
}

main().catch((err) => {
  console.error('[db:migrate] fallo:', err);
  process.exit(1);
});
