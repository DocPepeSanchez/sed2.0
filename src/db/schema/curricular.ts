/**
 * Dominio Curricular — Plan 2022 + MCCEMS 2023.
 *
 * Cumple Parte III §26.2 y §28 (catálogos):
 *  - 4 Campos Formativos
 *  - 6 Fases (1 Inicial → 6 Secundaria)
 *  - 7 Ejes Articuladores
 *  - ≈ 2,000 PDA del Plan 2022
 *  - Categorías de Progresión MCCEMS 2023
 */

import {
  pgTable,
  text,
  smallint,
  varchar,
  uuid,
  timestamp,
  pgEnum,
  uniqueIndex,
  jsonb,
} from 'drizzle-orm/pg-core';

export const campoFormativoEnum = pgEnum('campo_formativo', [
  'L', // Lenguajes
  'C', // Saberes y Pensamiento Científico
  'E', // Ética, Naturaleza y Sociedades
  'H', // De lo Humano y lo Comunitario
]);

export const nivelEducativoEnum = pgEnum('nivel_educativo', [
  'INICIAL',
  'PREESCOLAR',
  'PRIMARIA',
  'SECUNDARIA',
  'BACHILLERATO',
]);

export const camposFormativos = pgTable('campos_formativos', {
  codigo: campoFormativoEnum('codigo').primaryKey(),
  nombre: varchar('nombre', { length: 120 }).notNull(),
  descripcion: text('descripcion'),
});

export const fases = pgTable('fases', {
  numero: smallint('numero').primaryKey(),
  nombre: varchar('nombre', { length: 120 }).notNull(),
  nivel: nivelEducativoEnum('nivel').notNull(),
  gradoInicio: smallint('grado_inicio').notNull(),
  gradoFin: smallint('grado_fin').notNull(),
});

export const ejesArticuladores = pgTable('ejes_articuladores', {
  codigo: varchar('codigo', { length: 8 }).primaryKey(),
  nombre: varchar('nombre', { length: 200 }).notNull(),
  descripcion: text('descripcion'),
});

/**
 * Procesos de Desarrollo de Aprendizaje (PDA).
 * Catálogo principal — referenciado por cada Reto. Aproximadamente 2,000 entradas.
 */
export const pda = pgTable(
  'pda',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clave: varchar('clave', { length: 40 }).notNull(),
    campo: campoFormativoEnum('campo').notNull(),
    fase: smallint('fase').notNull().references(() => fases.numero),
    grado: smallint('grado').notNull(),
    contenido: text('contenido').notNull(),
    descripcion: text('descripcion').notNull(),
    ejes: jsonb('ejes').$type<string[]>().notNull().default([]),
    fuente: varchar('fuente', { length: 200 }).notNull().default('Plan 2022'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    uqClave: uniqueIndex('uq_pda_clave').on(t.clave),
  }),
);

/**
 * Categorías de progresión del MCCEMS 2023 (bachillerato).
 */
export const categoriasProgresionEms = pgTable('categorias_progresion_ems', {
  id: uuid('id').primaryKey().defaultRandom(),
  clave: varchar('clave', { length: 40 }).notNull().unique(),
  recurso: varchar('recurso', { length: 200 }).notNull(), // p. ej. "Pensamiento Matemático"
  categoria: varchar('categoria', { length: 200 }).notNull(),
  subcategoria: varchar('subcategoria', { length: 200 }),
  metaAprendizaje: text('meta_aprendizaje').notNull(),
  semestre: smallint('semestre').notNull(),
});
