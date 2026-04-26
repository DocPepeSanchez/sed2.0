/**
 * Dominio Aplicación — Parte III §26.4 y §29.4–29.5.
 *
 * Implementa:
 *  - Tres tipos de instrumento: Pilotaje, Diagnóstico, Seguimiento (modelo Through-Year)
 *  - Cuatro modalidades de aplicación: 1A1, ROTACION, GRUPAL, OMR
 *  - Sesión por estudiante con respuestas inmutables (P-04)
 *  - Acta firmada como prerrequisito de publicación (RA-06)
 */

import {
  pgTable,
  pgEnum,
  varchar,
  text,
  smallint,
  integer,
  timestamp,
  uuid,
  jsonb,
  index,
  decimal,
  char,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { escuelas, estudiantes } from './identidad';
import { retos, retoVersiones } from './banco';

export const tipoInstrumentoEnum = pgEnum('tipo_instrumento', [
  'PILOTAJE',
  'DIAGNOSTICO',
  'SEGUIMIENTO_1',
  'SEGUIMIENTO_2',
  'SEGUIMIENTO_3',
]);

export const modalidadAplicacionEnum = pgEnum('modalidad_aplicacion', [
  '1A1',
  'ROTACION',
  'GRUPAL',
  'OMR',
]);

export const estadoSesionEnum = pgEnum('estado_sesion', [
  'PROGRAMADA',
  'EN_CURSO',
  'PAUSADA',
  'FINALIZADA',
  'INCOMPLETA',
  'CANCELADA',
]);

/**
 * Plantilla / blueprint del instrumento (catálogo curricular: cuántos retos
 * por PDA, por dificultad, longitud objetivo, restricciones de exposición).
 */
export const instrumentos = pgTable('instrumentos', {
  id: uuid('id').primaryKey().defaultRandom(),
  clave: varchar('clave', { length: 60 }).notNull().unique(),
  tipo: tipoInstrumentoEnum('tipo').notNull(),
  cicloEscolar: char('ciclo_escolar', { length: 9 }).notNull(),
  fase: smallint('fase').notNull(),
  grado: smallint('grado').notNull(),
  longitudObjetivo: smallint('longitud_objetivo').notNull(), // ej. 35 reactivos
  longitudMaxima: smallint('longitud_maxima').notNull(),
  longitudMinima: smallint('longitud_minima').notNull(),
  errorEstandarObjetivo: decimal('ee_objetivo', { precision: 4, scale: 3 }).notNull().default('0.300'),
  /** Distribución mínima por PDA y por banda de dificultad. */
  blueprint: jsonb('blueprint').$type<{
    pda: Array<{ pdaId: string; minimo: number; maximo: number }>;
    dificultad: { baja: number; media: number; alta: number };
    tiempoMaxMin: number;
    proporcionAnclaje: number; // 0.10 - 0.20 (RM-06)
  }>().notNull(),
  estado: varchar('estado', { length: 20 }).notNull().default('BORRADOR'),
  publicadoPor: varchar('publicado_por', { length: 13 }),
  publicadoEn: timestamp('publicado_en', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Forma paralela del instrumento. Permite formas equivalentes (es/yua,
 * variantes para evitar exposición — RB-08).
 */
export const formas = pgTable(
  'formas',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    instrumentoId: uuid('instrumento_id')
      .notNull()
      .references(() => instrumentos.id),
    codigo: varchar('codigo', { length: 20 }).notNull(),
    idioma: char('idioma', { length: 3 }).notNull().default('spa'),
    /** Pool de retos disponibles para esta forma; el motor CAT selecciona dentro. */
    retosPool: jsonb('retos_pool').$type<string[]>().notNull(), // array de retos.id
    /** Anclajes obligatorios — siempre presentados (no adaptativos). */
    retosAnclaje: jsonb('retos_anclaje').$type<string[]>().notNull().default([]),
    estado: varchar('estado', { length: 20 }).notNull().default('ACTIVA'),
  },
  (t) => ({
    uqCodigo: uniqueIndex('uq_forma_codigo').on(t.instrumentoId, t.codigo),
  }),
);

/**
 * Aplicación = ventana operativa por escuela. Una aplicación contiene N sesiones
 * (una por estudiante).
 */
export const aplicaciones = pgTable(
  'aplicaciones',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    instrumentoId: uuid('instrumento_id')
      .notNull()
      .references(() => instrumentos.id),
    formaId: uuid('forma_id')
      .notNull()
      .references(() => formas.id),
    claveEscuela: char('clave_escuela', { length: 10 })
      .notNull()
      .references(() => escuelas.claveCct),
    ventanaInicio: timestamp('ventana_inicio', { withTimezone: true }).notNull(),
    ventanaFin: timestamp('ventana_fin', { withTimezone: true }).notNull(),
    modalidad: modalidadAplicacionEnum('modalidad').notNull(),
    responsableRfc: varchar('responsable_rfc', { length: 13 }).notNull(),
    aplicadorRfc: varchar('aplicador_rfc', { length: 13 }).notNull(),
    estado: varchar('estado', { length: 20 }).notNull().default('PROGRAMADA'),
    /** URL al acta firmada en almacenamiento objeto. */
    actaUrl: text('acta_url'),
    actaHash: char('acta_hash', { length: 64 }),
    incidentes: jsonb('incidentes').$type<Array<{
      timestamp: string;
      severidad: 'CRITICO' | 'ALTO' | 'MEDIO' | 'BAJO';
      descripcion: string;
      reportadoPor: string;
    }>>().notNull().default([]),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    idxEscuela: index('idx_apl_escuela').on(t.claveEscuela),
    idxVentana: index('idx_apl_ventana').on(t.ventanaInicio, t.ventanaFin),
  }),
);

/**
 * Sesión por estudiante. Cada sesión genera respuestas inmutables.
 */
export const sesiones = pgTable(
  'sesiones',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    aplicacionId: uuid('aplicacion_id')
      .notNull()
      .references(() => aplicaciones.id),
    estudianteCurp: char('estudiante_curp', { length: 18 })
      .notNull()
      .references(() => estudiantes.curp),
    estado: estadoSesionEnum('estado').notNull().default('PROGRAMADA'),
    inicioReal: timestamp('inicio_real', { withTimezone: true }),
    finReal: timestamp('fin_real', { withTimezone: true }),
    /** Estimación final de θ (logits) tras la sesión. */
    thetaFinal: decimal('theta_final', { precision: 6, scale: 4 }),
    errorEstandarTheta: decimal('ee_theta', { precision: 6, scale: 4 }),
    /** Trayectoria de θ tras cada respuesta — array ordenado de [n, θ, EE]. */
    thetaTrayectoria: jsonb('theta_trayectoria').$type<Array<{ n: number; theta: number; ee: number; retoId: string }>>()
      .notNull()
      .default([]),
    acomodacionesAplicadas: jsonb('acomodaciones_aplicadas').$type<string[]>().notNull().default([]),
    /** Bandera de modo offline para reconciliación posterior. */
    offlineSync: jsonb('offline_sync').$type<{ originDeviceId?: string; syncedAt?: string }>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    uqAplCurp: uniqueIndex('uq_sesion_apl_curp').on(t.aplicacionId, t.estudianteCurp),
    idxEstudiante: index('idx_sesion_estudiante').on(t.estudianteCurp),
  }),
);

/**
 * Respuesta del estudiante a un reto concreto en una versión concreta.
 * Tabla append-only — nunca se actualiza el contenido (P-04).
 */
export const respuestas = pgTable(
  'respuestas',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sesionId: uuid('sesion_id')
      .notNull()
      .references(() => sesiones.id),
    retoId: uuid('reto_id')
      .notNull()
      .references(() => retos.id),
    retoVersionId: uuid('reto_version_id')
      .notNull()
      .references(() => retoVersiones.id),
    /** Posición en la sesión (1, 2, 3, ...). */
    orden: smallint('orden').notNull(),
    contenidoQti: jsonb('contenido_qti').$type<unknown>().notNull(),
    tiempoRespuestaSeg: integer('tiempo_respuesta_seg').notNull(),
    timestampRespuesta: timestamp('timestamp_respuesta', { withTimezone: true }).notNull(),
    /** Acomodaciones activas durante la respuesta. */
    acomodacionesActivas: jsonb('acomodaciones_activas').$type<string[]>().notNull().default([]),
    estado: varchar('estado', { length: 20 }).notNull().default('RECIBIDA'),
  },
  (t) => ({
    idxSesion: index('idx_resp_sesion').on(t.sesionId),
    idxReto: index('idx_resp_reto').on(t.retoId),
  }),
);
