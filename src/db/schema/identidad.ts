/**
 * Dominio Identidad — Parte III §26.1 y §29.1–29.2.
 *
 * Cumple P-03 (identidad federada única): CURP para estudiantes y tutores;
 * RFC para personal. Las CURP/RFC nunca se duplican.
 *
 * Cumple P-05 (cifrado por defecto): los campos sensibles (BAP, condición
 * socioemocional, género declarado) se almacenan como `jsonb` para permitir
 * cifrado a nivel campo (ADR-10) gestionado en `src/lib/security/field-encryption.ts`.
 */

import {
  pgTable,
  pgEnum,
  varchar,
  char,
  text,
  smallint,
  date,
  timestamp,
  boolean,
  uuid,
  jsonb,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { nivelEducativoEnum } from './curricular';

export const sexoRegistralEnum = pgEnum('sexo_registral', ['M', 'F', 'X']);

export const modalidadEducativaEnum = pgEnum('modalidad_educativa', [
  'GENERAL',
  'TECNICA',
  'TELESECUNDARIA',
  'INDIGENA',
  'COMUNITARIA',
  'MULTIGRADO',
]);

export const sostenimientoEnum = pgEnum('sostenimiento', [
  'FEDERAL',
  'ESTATAL',
  'AUTONOMO',
  'PARTICULAR',
]);

export const turnoEnum = pgEnum('turno', ['MATUTINO', 'VESPERTINO', 'DISCONTINUO', 'NOCTURNO']);

export const escuelas = pgTable(
  'escuelas',
  {
    claveCct: char('clave_cct', { length: 10 }).primaryKey(),
    nombre: varchar('nombre', { length: 255 }).notNull(),
    modalidad: modalidadEducativaEnum('modalidad').notNull(),
    sostenimiento: sostenimientoEnum('sostenimiento').notNull(),
    nivel: nivelEducativoEnum('nivel').notNull(),
    turno: turnoEnum('turno').notNull().default('MATUTINO'),
    zonaEscolar: smallint('zona_escolar').notNull(),
    regionEscolar: varchar('region_escolar', { length: 60 }).notNull(),
    municipio: char('municipio', { length: 5 }).notNull(), // INEGI
    localidad: varchar('localidad', { length: 120 }),
    latitud: varchar('latitud', { length: 32 }), // se almacena como texto; la migración crea columna PostGIS opcional
    longitud: varchar('longitud', { length: 32 }),
    censoInfraestructura: jsonb('censo_infraestructura')
      .$type<{
        equipos: number;
        conectividad: 'NINGUNA' | 'BAJA' | 'MEDIA' | 'ALTA';
        modalidadAplicacion: '1A1' | 'ROTACION' | 'GRUPAL' | 'OMR';
        actualizadoEn: string;
      }>()
      .notNull()
      .default({
        equipos: 0,
        conectividad: 'NINGUNA',
        modalidadAplicacion: 'OMR',
        actualizadoEn: new Date().toISOString(),
      }),
    estadoOperativo: varchar('estado_operativo', { length: 20 }).notNull().default('ACTIVO'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    idxMunicipio: index('idx_escuelas_municipio').on(t.municipio),
    idxZona: index('idx_escuelas_zona').on(t.zonaEscolar),
  }),
);

export const estudiantes = pgTable(
  'estudiantes',
  {
    curp: char('curp', { length: 18 }).primaryKey(),
    primerApellido: varchar('primer_apellido', { length: 60 }).notNull(),
    segundoApellido: varchar('segundo_apellido', { length: 60 }),
    nombre: varchar('nombre', { length: 120 }).notNull(),
    fechaNacimiento: date('fecha_nacimiento').notNull(),
    sexoRegistral: sexoRegistralEnum('sexo_registral').notNull(),
    /** Cifrado a nivel campo cuando se persiste con valor distinto de null. */
    generoDeclaradoEnc: text('genero_declarado_enc'),
    /** ISO 639-3; default 'spa' (español). */
    lenguaMaterna: char('lengua_materna', { length: 3 }).notNull().default('spa'),
    nivelDominioEspanol: smallint('nivel_dominio_espanol'), // 1-5
    /** Array cifrado de códigos BAP (ADR-10). */
    condicionBapEnc: text('condicion_bap_enc'),
    condicionSocioemocionalEnc: text('condicion_socioemocional_enc'),
    claveEscuela: char('clave_escuela', { length: 10 })
      .notNull()
      .references(() => escuelas.claveCct),
    grado: smallint('grado').notNull(),
    grupo: varchar('grupo', { length: 2 }).notNull(),
    cicloEscolar: char('ciclo_escolar', { length: 9 }).notNull(), // 2026-2027
    fechaAltaSed: timestamp('fecha_alta_sed', { withTimezone: true }).notNull().defaultNow(),
    fechaBajaSed: timestamp('fecha_baja_sed', { withTimezone: true }),
    consentimientoTutor: boolean('consentimiento_tutor').notNull().default(false),
    consentimientoDetalle: jsonb('consentimiento_detalle').$type<{
      firmadoPor?: string;
      fechaFirma?: string;
      versionAviso?: string;
      idiomaAviso?: 'es' | 'yua';
    }>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    idxEscuela: index('idx_estudiantes_escuela').on(t.claveEscuela),
    idxCiclo: index('idx_estudiantes_ciclo').on(t.cicloEscolar),
  }),
);

export const personal = pgTable(
  'personal',
  {
    rfc: varchar('rfc', { length: 13 }).primaryKey(),
    curp: char('curp', { length: 18 }).notNull(),
    nombre: varchar('nombre', { length: 120 }).notNull(),
    primerApellido: varchar('primer_apellido', { length: 60 }).notNull(),
    segundoApellido: varchar('segundo_apellido', { length: 60 }),
    correo: varchar('correo', { length: 200 }).notNull(),
    telefono: varchar('telefono', { length: 20 }),
    claveEscuela: char('clave_escuela', { length: 10 }).references(() => escuelas.claveCct),
    estado: varchar('estado', { length: 20 }).notNull().default('ACTIVO'),
    /** Roles asignados — referencia al catálogo RBAC. */
    roles: jsonb('roles').$type<string[]>().notNull().default([]),
    /** Hash argon2id de la contraseña. */
    passwordHash: text('password_hash').notNull(),
    mfaSecret: text('mfa_secret_enc'),
    ultimoAcceso: timestamp('ultimo_acceso', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    uqCorreo: uniqueIndex('uq_personal_correo').on(t.correo),
    idxEscuela: index('idx_personal_escuela').on(t.claveEscuela),
  }),
);

export const tutores = pgTable(
  'tutores',
  {
    curp: char('curp', { length: 18 }).primaryKey(),
    nombre: varchar('nombre', { length: 120 }).notNull(),
    primerApellido: varchar('primer_apellido', { length: 60 }).notNull(),
    segundoApellido: varchar('segundo_apellido', { length: 60 }),
    correo: varchar('correo', { length: 200 }),
    telefono: varchar('telefono', { length: 20 }),
    idiomaPreferido: char('idioma_preferido', { length: 3 }).notNull().default('spa'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
);

/**
 * Relación N:M entre tutores y estudiantes (un tutor puede tener varios hijos
 * y un estudiante puede tener más de un tutor responsable).
 */
export const tutorEstudiante = pgTable(
  'tutor_estudiante',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tutorCurp: char('tutor_curp', { length: 18 })
      .notNull()
      .references(() => tutores.curp),
    estudianteCurp: char('estudiante_curp', { length: 18 })
      .notNull()
      .references(() => estudiantes.curp),
    parentesco: varchar('parentesco', { length: 40 }).notNull(),
    esResponsableLegal: boolean('es_responsable_legal').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    uqPar: uniqueIndex('uq_tutor_estudiante').on(t.tutorCurp, t.estudianteCurp),
  }),
);

/**
 * Acomodaciones registradas por estudiante. Se aplican automáticamente al
 * iniciar la aplicación (RA-05).
 */
export const acomodaciones = pgTable('acomodaciones', {
  id: uuid('id').primaryKey().defaultRandom(),
  estudianteCurp: char('estudiante_curp', { length: 18 })
    .notNull()
    .references(() => estudiantes.curp),
  tipo: varchar('tipo', { length: 40 }).notNull(),
  parametros: jsonb('parametros').$type<Record<string, unknown>>().notNull().default({}),
  vigenteDesde: date('vigente_desde').notNull(),
  vigenteHasta: date('vigente_hasta'),
  documentoSoporte: text('documento_soporte'),
  registradoPor: varchar('registrado_por', { length: 13 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
