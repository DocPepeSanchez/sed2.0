/**
 * Audit log inmutable — P-07 (trazabilidad total).
 *
 * Tabla append-only: ningún UPDATE ni DELETE permitido por política de la BD.
 * Conservación 7 años (P-07). Hash encadenado para detección de manipulación.
 */

import { pgTable, varchar, text, jsonb, uuid, timestamp, char, bigserial } from 'drizzle-orm/pg-core';

export const auditLog = pgTable('audit_log', {
  /** Secuencia monotónica para detección de huecos. */
  seq: bigserial('seq', { mode: 'bigint' }).primaryKey(),
  id: uuid('id').notNull().defaultRandom(),
  /** Quién: RFC del personal, CURP del estudiante/tutor, "system" para procesos. */
  actor: varchar('actor', { length: 32 }).notNull(),
  rolCodigo: varchar('rol_codigo', { length: 60 }),
  /** Qué: verbo (CREATE, READ, UPDATE, DELETE, APPROVE, LOGIN, etc.). */
  accion: varchar('accion', { length: 40 }).notNull(),
  /** Sobre qué: tipo de recurso. */
  recurso: varchar('recurso', { length: 60 }).notNull(),
  /** Identificador del recurso afectado. */
  recursoId: varchar('recurso_id', { length: 64 }),
  /** Resultado: OK | DENEGADO | ERROR. */
  resultado: varchar('resultado', { length: 20 }).notNull(),
  /** Datos de contexto: IP, user-agent, payload limpio (sin PII innecesaria). */
  contexto: jsonb('contexto').$type<{
    ip?: string;
    userAgent?: string;
    sessionId?: string;
    requestId?: string;
    diff?: unknown;
  }>().notNull().default({}),
  mensaje: text('mensaje'),
  /** Hash SHA-256 del registro previo encadenado — detecta manipulación. */
  hashPrev: char('hash_prev', { length: 64 }),
  hashActual: char('hash_actual', { length: 64 }).notNull(),
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow(),
});
