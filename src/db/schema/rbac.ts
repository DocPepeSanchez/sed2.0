/**
 * Esquema RBAC — Parte IV §30–31.
 *
 * Implementa P-06 (mínimo privilegio): cada rol declara qué entidades puede
 * tocar y con qué verbos (C/L/U/D/A). La matriz se carga desde el seed.
 */

import { pgTable, varchar, text, jsonb, uuid, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

export const roles = pgTable('roles', {
  codigo: varchar('codigo', { length: 60 }).primaryKey(),
  familia: varchar('familia', { length: 40 }).notNull(),
  nombre: varchar('nombre', { length: 200 }).notNull(),
  descripcion: text('descripcion').notNull(),
  /** Capacidades — granular y declarativo. */
  capacidades: jsonb('capacidades').$type<Capacidad[]>().notNull(),
});

export type Verbo = 'C' | 'L' | 'U' | 'D' | 'A';

export interface Capacidad {
  /** Recurso: estudiante, reto, instrumento, aplicacion, respuesta, calificacion, reporte, etc. */
  recurso: string;
  /** Verbos permitidos (subset de C/L/U/D/A). */
  verbos: Verbo[];
  /** Restricción de alcance: 'PROPIO', 'CCT', 'ZONA', 'REGION', 'ESTADO', 'NINGUNO'. */
  alcance: 'PROPIO' | 'CCT' | 'ZONA' | 'REGION' | 'ESTADO' | 'ANONIMIZADO';
  /** Condiciones declarativas adicionales (e.g. solo si estado = 'CREADO'). */
  condicion?: string;
}

export const asignacionesRol = pgTable(
  'asignaciones_rol',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    /** RFC para personal, CURP para estudiantes/tutores. */
    sujeto: varchar('sujeto', { length: 18 }).notNull(),
    rolCodigo: varchar('rol_codigo', { length: 60 })
      .notNull()
      .references(() => roles.codigo),
    /** Alcance específico — CCT, zona, etc. — para el principio de menor privilegio. */
    alcance: jsonb('alcance').$type<{ tipo: string; valor?: string }>().notNull(),
    asignadoPor: varchar('asignado_por', { length: 13 }).notNull(),
    asignadoEn: timestamp('asignado_en', { withTimezone: true }).notNull().defaultNow(),
    expiraEn: timestamp('expira_en', { withTimezone: true }),
  },
  (t) => ({
    uqSujetoRol: uniqueIndex('uq_asignacion_sujeto_rol').on(t.sujeto, t.rolCodigo),
  }),
);
