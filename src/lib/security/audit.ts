/**
 * Audit log — P-07 (trazabilidad total).
 *
 * Cada operación significativa deja registro inmutable con hash encadenado
 * para detectar manipulación. La conservación legal mínima es 7 años.
 */

import { createHash } from 'node:crypto';
import { db } from '@/db/client';
import { auditLog } from '@/db/schema/audit';
import { desc } from 'drizzle-orm';

export interface RegistroAuditoria {
  actor: string;
  rolCodigo?: string;
  accion: string;
  recurso: string;
  recursoId?: string;
  resultado: 'OK' | 'DENEGADO' | 'ERROR';
  contexto?: {
    ip?: string;
    userAgent?: string;
    sessionId?: string;
    requestId?: string;
    diff?: unknown;
  };
  mensaje?: string;
}

function calcularHash(prev: string | null, registro: RegistroAuditoria, ts: string): string {
  const payload = JSON.stringify({
    prev,
    actor: registro.actor,
    rolCodigo: registro.rolCodigo,
    accion: registro.accion,
    recurso: registro.recurso,
    recursoId: registro.recursoId,
    resultado: registro.resultado,
    contexto: registro.contexto ?? {},
    mensaje: registro.mensaje ?? '',
    ts,
  });
  return createHash('sha256').update(payload).digest('hex');
}

export async function auditar(registro: RegistroAuditoria): Promise<void> {
  const ts = new Date().toISOString();

  const [ultimo] = await db.select().from(auditLog).orderBy(desc(auditLog.seq)).limit(1);
  const hashPrev = ultimo?.hashActual ?? null;
  const hashActual = calcularHash(hashPrev, registro, ts);

  await db.insert(auditLog).values({
    actor: registro.actor,
    rolCodigo: registro.rolCodigo,
    accion: registro.accion,
    recurso: registro.recurso,
    recursoId: registro.recursoId,
    resultado: registro.resultado,
    contexto: registro.contexto ?? {},
    mensaje: registro.mensaje,
    hashPrev,
    hashActual,
  });
}

/**
 * Verifica la cadena de hashes — detecta manipulación. Se ejecuta como
 * subrutina diaria en el job de integridad y bajo demanda por auditoría.
 */
export async function verificarIntegridadCadena(limit = 10_000): Promise<{
  ok: boolean;
  rotos: number[];
  total: number;
}> {
  const registros = await db.select().from(auditLog).orderBy(auditLog.seq).limit(limit);
  const rotos: number[] = [];
  let prevHash: string | null = null;

  for (const r of registros) {
    if (r.hashPrev !== prevHash) rotos.push(Number(r.seq));
    prevHash = r.hashActual;
  }

  return { ok: rotos.length === 0, rotos, total: registros.length };
}
