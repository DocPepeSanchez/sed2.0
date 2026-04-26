/**
 * Dominio Resultados — Parte III §26.5.
 *
 * Implementa:
 *  - Calificación (RC-01..RC-08): triple capa auto / IA / humano
 *  - Estimación θ por estudiante y aplicación
 *  - Bandas de desempeño
 *  - Reportes en cinco niveles (RR-01)
 *  - Alertas tempranas (RR-04, RR-05)
 *  - Planes de intervención
 */

import {
  pgTable,
  pgEnum,
  varchar,
  text,
  smallint,
  timestamp,
  uuid,
  jsonb,
  index,
  decimal,
  char,
  date,
} from 'drizzle-orm/pg-core';
import { respuestas, sesiones } from './aplicacion';
import { estudiantes, escuelas } from './identidad';

export const metodoCalificacionEnum = pgEnum('metodo_calificacion', [
  'AUTO',
  'IA',
  'IA_VALIDADA',
  'HUMANA',
  'ARBITRADA',
]);

export const bandaDesempenoEnum = pgEnum('banda_desempeno', [
  'INSUFICIENTE',
  'BASICO',
  'SATISFACTORIO',
  'SOBRESALIENTE',
]);

export const nivelReporteEnum = pgEnum('nivel_reporte', [
  'ESTUDIANTE',
  'ESCUELA',
  'ZONA',
  'REGION',
  'ESTADO',
]);

export const severidadAlertaEnum = pgEnum('severidad_alerta', ['BAJA', 'MEDIA', 'ALTA', 'CRITICA']);

export const calificaciones = pgTable(
  'calificaciones',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    respuestaId: uuid('respuesta_id')
      .notNull()
      .references(() => respuestas.id),
    metodo: metodoCalificacionEnum('metodo').notNull(),
    /** Puntaje normalizado 0.00 – 1.00 para cerrados; 0.00 – 4.00 para rúbrica. */
    puntaje: decimal('puntaje', { precision: 5, scale: 2 }).notNull(),
    puntajeMaximo: decimal('puntaje_maximo', { precision: 5, scale: 2 }).notNull(),
    calificadorRfc: varchar('calificador_rfc', { length: 13 }),
    /** Cuando aplica dual-scoring IA + humano, kappa de Cohen (RC-05). */
    concordanciaKappa: decimal('concordancia_kappa', { precision: 4, scale: 3 }),
    /** Diagnóstico cualitativo de la respuesta (devolución pedagógica). */
    retroalimentacion: text('retroalimentacion'),
    tiempoProcesamientoSeg: smallint('tiempo_procesamiento_seg'),
    estado: varchar('estado', { length: 20 }).notNull().default('FINAL'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    idxRespuesta: index('idx_calif_respuesta').on(t.respuestaId),
  }),
);

/**
 * Resultado consolidado por sesión: estimación final de θ, banda y agregados.
 */
export const resultadosSesion = pgTable(
  'resultados_sesion',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sesionId: uuid('sesion_id')
      .notNull()
      .references(() => sesiones.id),
    thetaFinal: decimal('theta_final', { precision: 6, scale: 4 }).notNull(),
    errorEstandar: decimal('error_estandar', { precision: 6, scale: 4 }).notNull(),
    /** Confiabilidad de la estimación (1 - EE²). */
    confiabilidad: decimal('confiabilidad', { precision: 4, scale: 3 }).notNull(),
    banda: bandaDesempenoEnum('banda').notNull(),
    /** Puntaje en escala 200-800 (lineal a partir de θ). */
    puntajeEscalado: smallint('puntaje_escalado').notNull(),
    /** Resultados desagregados por PDA y por atributo. */
    desagregados: jsonb('desagregados').$type<Array<{
      tipo: 'PDA' | 'ATRIBUTO' | 'CAMPO';
      clave: string;
      n: number;
      aciertos: number;
      proporcion: number;
    }>>().notNull().default([]),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    idxSesion: index('idx_resultado_sesion').on(t.sesionId),
  }),
);

export const reportes = pgTable(
  'reportes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    nivel: nivelReporteEnum('nivel').notNull(),
    /** Identificador del agregado: CURP / CCT / zona / región / estado. */
    referenciaId: varchar('referencia_id', { length: 60 }).notNull(),
    instrumentoId: uuid('instrumento_id'),
    cicloEscolar: char('ciclo_escolar', { length: 9 }).notNull(),
    idioma: char('idioma', { length: 3 }).notNull().default('spa'),
    /** Documento estructurado (JSON canónico). El render PDF/HTML se hace bajo demanda. */
    cuerpo: jsonb('cuerpo').$type<Record<string, unknown>>().notNull(),
    /** URL al PDF/HTML almacenado tras render. */
    pdfUrl: text('pdf_url'),
    publicadoEn: timestamp('publicado_en', { withTimezone: true }).notNull().defaultNow(),
    /** Para reportes públicos y datos abiertos: hash de integridad y umbral mínimo (RR-07). */
    integridadHash: char('integridad_hash', { length: 64 }),
    cumpleUmbralAnonimato: smallint('cumple_umbral_anonimato').notNull().default(1),
  },
  (t) => ({
    idxNivelRef: index('idx_reporte_nivel_ref').on(t.nivel, t.referenciaId),
    idxCiclo: index('idx_reporte_ciclo').on(t.cicloEscolar),
  }),
);

/**
 * Alertas tempranas — disparadas por reglas RR-04, RR-05 y por modelo predictivo.
 */
export const alertas = pgTable(
  'alertas',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    estudianteCurp: char('estudiante_curp', { length: 18 })
      .references(() => estudiantes.curp),
    claveEscuela: char('clave_escuela', { length: 10 })
      .references(() => escuelas.claveCct),
    tipo: varchar('tipo', { length: 40 }).notNull(),
    severidad: severidadAlertaEnum('severidad').notNull(),
    titulo: varchar('titulo', { length: 200 }).notNull(),
    descripcion: text('descripcion').notNull(),
    evidencia: jsonb('evidencia').$type<Record<string, unknown>>().notNull().default({}),
    destinatarios: jsonb('destinatarios').$type<string[]>().notNull(), // RFC de Director / Supervisor / USAER
    estado: varchar('estado', { length: 20 }).notNull().default('ABIERTA'),
    cerradaEn: timestamp('cerrada_en', { withTimezone: true }),
    cerradaPor: varchar('cerrada_por', { length: 13 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    idxEstudiante: index('idx_alerta_estudiante').on(t.estudianteCurp),
    idxEscuela: index('idx_alerta_escuela').on(t.claveEscuela),
    idxEstado: index('idx_alerta_estado').on(t.estado),
  }),
);

export const planesIntervencion = pgTable('planes_intervencion', {
  id: uuid('id').primaryKey().defaultRandom(),
  alertaId: uuid('alerta_id').references(() => alertas.id),
  estudianteCurp: char('estudiante_curp', { length: 18 })
    .notNull()
    .references(() => estudiantes.curp),
  responsableRfc: varchar('responsable_rfc', { length: 13 }).notNull(),
  objetivos: jsonb('objetivos').$type<string[]>().notNull(),
  acciones: jsonb('acciones').$type<Array<{ accion: string; fecha: string; estado: string }>>().notNull(),
  inicio: date('inicio').notNull(),
  fin: date('fin'),
  estado: varchar('estado', { length: 20 }).notNull().default('VIGENTE'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
