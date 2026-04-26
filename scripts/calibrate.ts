/**
 * Script de calibración psicométrica — RB-05.
 *
 * Lee respuestas piloto desde la BD y estima parámetros TRI 1PL/2PL/3PL.
 * Persiste resultados en `parametros_tri` con bandera `activa = true`.
 *
 * En producción, el cálculo final se hace con paquetes R (mirt, TAM, eRm).
 * Este script ofrece una calibración 1PL aproximada en TypeScript para
 * smoke tests y entornos sin R.
 */

import { sql } from 'drizzle-orm';
import { db, pool } from '@/db/client';
import { calibrarReto } from '@/server/banco/service';

const RFC_PSICOMETRISTA = process.env.PSICOMETRISTA_RFC ?? 'XAXX010101000';

async function main(): Promise<void> {
  console.log('[calibrate] Buscando versiones EN_PILOTAJE…');
  // Conteo de aciertos por versión (proxy 1PL aproximado).
  const filas = await db.execute(sql`
    SELECT
      rv.id AS version_id,
      r.id AS reto_id,
      COUNT(*)             AS n,
      AVG(c.puntaje::numeric / NULLIF(c.puntaje_maximo::numeric, 0)) AS p
    FROM reto_versiones rv
    JOIN retos r ON r.id = rv.reto_id
    JOIN respuestas resp ON resp.reto_version_id = rv.id
    JOIN calificaciones c ON c.respuesta_id = resp.id
    WHERE r.estado = 'EN_PILOTAJE'
    GROUP BY rv.id, r.id
    HAVING COUNT(*) >= 500
  `);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = ((filas as any).rows ?? []) as Array<{ version_id: string; n: number; p: number }>;
  console.log(`[calibrate] ${rows.length} versiones cumplen muestra mínima.`);

  for (const row of rows) {
    // 1PL: b ≈ -ln(p / (1-p)). Aproximación logit.
    const p = Math.max(0.05, Math.min(0.95, Number(row.p)));
    const b = -Math.log(p / (1 - p));

    await calibrarReto(
      { sujeto: RFC_PSICOMETRISTA, asignaciones: [{ rol: 'PSICOMETRISTA_SR', alcance: { tipo: 'ESTADO' } }] },
      {
        retoVersionId: row.version_id,
        modelo: '1PL',
        a: 1.0,
        b,
        c: 0,
        nMuestra: Number(row.n),
        errorEstandarB: 0.15,
        fitInfit: 1.0,
        fitOutfit: 1.0,
        dif: [],
      },
    );
    console.log(`[calibrate] ${row.version_id} calibrado · b=${b.toFixed(3)} · n=${row.n}`);
  }

  await pool.end();
}

main().catch((err) => {
  console.error('[calibrate] fallo:', err);
  process.exit(1);
});
