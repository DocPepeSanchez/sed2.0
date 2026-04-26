/**
 * Dominio Banco de Retos — Parte III §26.3 y §29.3.
 *
 * Implementa:
 *  - Versionamiento inmutable (RB-06, P-04)
 *  - Estados workflow (RB-01..RB-07)
 *  - Doble revisión ciega (RB-02)
 *  - Calibración TRI 1PL/2PL/3PL (ADR-02)
 *  - Bilingüización es/yua (RB-10, P-09)
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
  uniqueIndex,
  index,
  decimal,
  char,
  boolean,
} from 'drizzle-orm/pg-core';
import { campoFormativoEnum } from './curricular';
import { pda } from './curricular';

export const tipoRetoEnum = pgEnum('tipo_reto', [
  'CERRADO_OPCION_MULTIPLE',
  'CERRADO_SELECCION',
  'CERRADO_TEI', // technically enhanced item (drag-drop, hotspot, etc.)
  'ABIERTO_CORTO',
  'ABIERTO_CONSTRUIDO',
]);

export const estadoRetoEnum = pgEnum('estado_reto', [
  'CREADO',
  'REVISADO_1',
  'REVISADO_2',
  'EN_ARBITRAJE',
  'REVISADO_FILOLOGICO',
  'EN_PILOTAJE',
  'PILOTEADO',
  'CALIBRADO',
  'OPERATIVO',
  'RETIRADO',
]);

export const idiomaEnum = pgEnum('idioma', ['spa', 'yua']);
export const modeloTriEnum = pgEnum('modelo_tri', ['1PL', '2PL', '3PL']);

export const retos = pgTable(
  'retos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    /**
     * Clave del reto — formato establecido por el Comité Curricular (RB-09).
     * Ejemplo: L_F3_G1_E1_001
     */
    clave: varchar('clave', { length: 40 }).notNull(),
    pdaId: uuid('pda_id').references(() => pda.id),
    categoriaEmsId: uuid('categoria_ems_id'),
    campo: campoFormativoEnum('campo').notNull(),
    fase: smallint('fase').notNull(),
    grado: smallint('grado').notNull(),
    tipo: tipoRetoEnum('tipo').notNull(),
    idioma: idiomaEnum('idioma').notNull().default('spa'),
    /**
     * Identificador del cluster bilingüe — los pares es/yua del mismo reto
     * comparten `pareId` para ofrecer formas paralelas equating-comparables.
     */
    pareId: uuid('pare_id'),
    elaboradorRfc: varchar('elaborador_rfc', { length: 13 }).notNull(),
    estado: estadoRetoEnum('estado').notNull().default('CREADO'),
    tiempoEstimadoSeg: integer('tiempo_estimado_seg').notNull().default(60),
    esItemAnclaje: boolean('es_item_anclaje').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    uqClave: uniqueIndex('uq_retos_clave').on(t.clave),
    idxEstado: index('idx_retos_estado').on(t.estado),
    idxPda: index('idx_retos_pda').on(t.pdaId),
    idxCampoFase: index('idx_retos_campo_fase').on(t.campo, t.fase, t.grado),
  }),
);

/**
 * Versión inmutable del reto. Cualquier modificación material crea una nueva
 * versión (RB-06). Las versiones anteriores nunca se eliminan ni sobrescriben.
 */
export const retoVersiones = pgTable(
  'reto_versiones',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    retoId: uuid('reto_id')
      .notNull()
      .references(() => retos.id),
    /** Semver: 1.0.0 */
    version: varchar('version', { length: 16 }).notNull(),
    /** Cuerpo QTI 3.0 serializado (XML/JSON canónico). */
    enunciadoQti: text('enunciado_qti').notNull(),
    /** Multimedia asociado: array de URIs en CDN. */
    multimedia: jsonb('multimedia').$type<Array<{ uri: string; mime: string; alt: string }>>()
      .notNull()
      .default([]),
    procedimientoEsperado: text('procedimiento_esperado'),
    atributos: jsonb('atributos').$type<string[]>().notNull().default([]),
    respuestaModelo: text('respuesta_modelo'),
    rubrica: jsonb('rubrica').$type<Array<{ nivel: 1 | 2 | 3 | 4; descripcion: string }>>(),
    afirmaciones: jsonb('afirmaciones').$type<string[]>().notNull().default([]),
    /** Solo para cerrados: clave correcta normalizada. */
    claveRespuesta: jsonb('clave_respuesta').$type<unknown>(),
    /** Hash sha-256 del contenido — ancla la inmutabilidad (P-04). */
    contenidoHash: char('contenido_hash', { length: 64 }).notNull(),
    creadaPor: varchar('creada_por', { length: 13 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    uqRetoVersion: uniqueIndex('uq_reto_version').on(t.retoId, t.version),
  }),
);

/**
 * Parámetros TRI por reto y por versión. Un reto puede tener varias
 * calibraciones (recalibraciones por nuevo pilotaje).
 */
export const parametrosTri = pgTable(
  'parametros_tri',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    retoVersionId: uuid('reto_version_id')
      .notNull()
      .references(() => retoVersiones.id),
    modelo: modeloTriEnum('modelo').notNull(),
    /** Discriminación (1.0 fija en 1PL). */
    a: decimal('a', { precision: 6, scale: 4 }).notNull(),
    /** Dificultad en logits. */
    b: decimal('b', { precision: 6, scale: 4 }).notNull(),
    /** Pseudo-azar (0 en 1PL/2PL). */
    c: decimal('c', { precision: 6, scale: 4 }).notNull().default('0.0000'),
    nMuestra: integer('n_muestra').notNull(),
    errorEstandarB: decimal('error_estandar_b', { precision: 6, scale: 4 }),
    fitInfit: decimal('fit_infit', { precision: 6, scale: 4 }),
    fitOutfit: decimal('fit_outfit', { precision: 6, scale: 4 }),
    /** DIF detectado: [{subgrupo, valor, p, decision}]. */
    dif: jsonb('dif')
      .$type<Array<{ subgrupo: string; estadistico: number; pValor: number; decision: 'OK' | 'REVISAR' | 'DESCARTAR' }>>()
      .notNull()
      .default([]),
    calibradoPor: varchar('calibrado_por', { length: 13 }).notNull(),
    calibradoEn: timestamp('calibrado_en', { withTimezone: true }).notNull().defaultNow(),
    /** Calibración vigente para uso en CAT (solo una activa por reto-versión). */
    activa: boolean('activa').notNull().default(true),
  },
  (t) => ({
    idxVersion: index('idx_param_tri_version').on(t.retoVersionId),
  }),
);

/**
 * Trazabilidad del flujo de revisión (RB-02, RB-03, RB-04).
 * Doble revisión ciega: ningún revisor conoce identidad del otro ni del elaborador.
 */
export const revisiones = pgTable('revisiones', {
  id: uuid('id').primaryKey().defaultRandom(),
  retoVersionId: uuid('reto_version_id')
    .notNull()
    .references(() => retoVersiones.id),
  tipo: varchar('tipo', { length: 30 }).notNull(), // CIEGA_1, CIEGA_2, ARBITRAJE, FILOLOGICA, PERTINENCIA
  revisorRfc: varchar('revisor_rfc', { length: 13 }).notNull(),
  /** Token opaco que oculta la identidad del revisor a otros revisores. */
  tokenCiego: char('token_ciego', { length: 32 }).notNull(),
  decision: varchar('decision', { length: 20 }).notNull(), // ACEPTAR, RECHAZAR, MODIFICAR
  comentarios: text('comentarios'),
  hallazgos: jsonb('hallazgos').$type<Array<{ severidad: 'BAJA' | 'MEDIA' | 'ALTA'; descripcion: string }>>()
    .notNull()
    .default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
