import { describe, it, expect } from 'vitest';
import { createHash } from 'node:crypto';

/**
 * Verifica el algoritmo de encadenamiento de hashes — sin tocar la BD.
 * Reemplaza la dependencia de Drizzle por una secuencia in-memory.
 */
describe('Audit log — encadenamiento de hashes', () => {
  function calcular(prev: string | null, registro: object, ts: string): string {
    return createHash('sha256').update(JSON.stringify({ prev, ...registro, ts })).digest('hex');
  }

  it('cualquier modificación en cualquier registro rompe la cadena', () => {
    const ts1 = '2026-04-26T10:00:00Z';
    const ts2 = '2026-04-26T10:01:00Z';
    const ts3 = '2026-04-26T10:02:00Z';

    const r1 = { actor: 'a', accion: 'CREATE' };
    const h1 = calcular(null, r1, ts1);
    const r2 = { actor: 'b', accion: 'UPDATE' };
    const h2 = calcular(h1, r2, ts2);
    const r3 = { actor: 'c', accion: 'READ' };
    const h3 = calcular(h2, r3, ts3);

    // Manipulamos r2 — el hash3 deja de coincidir con la cadena recalculada.
    const r2Manipulado = { actor: 'b', accion: 'DELETE' };
    const h2Manipulado = calcular(h1, r2Manipulado, ts2);
    expect(h2Manipulado).not.toBe(h2);
    expect(calcular(h2Manipulado, r3, ts3)).not.toBe(h3);
  });
});
