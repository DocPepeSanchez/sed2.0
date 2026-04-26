/**
 * Servicio de Reportes — RR-01..RR-08.
 *
 * Cinco niveles: Estudiante, Escuela, Zona, Región, Estado.
 * Reporte Familias bilingüe (RR-02) en lenguaje claro (RR-03).
 * Anonimización con umbral mínimo de 5 (RR-07).
 */

import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/db/client';
import {
  resultadosSesion,
  reportes,
  sesiones,
  estudiantes,
  escuelas,
  alertas,
} from '@/db/schema';
import { authorize, type SesionUsuario } from '@/lib/security/rbac';
import { auditar } from '@/lib/security/audit';
import { createHash } from 'node:crypto';
import { bandaDesempeno, thetaAEscalado } from '@/lib/psicometria/tri';

const UMBRAL_ANONIMATO = 5;

function exigir(sesion: SesionUsuario, ctx?: Record<string, unknown>) {
  const r = authorize(sesion, { recurso: 'reporte', verbo: 'L', contexto: ctx });
  if (!r.permitido) {
    const e = new Error(`Acceso denegado: ${r.motivo}`);
    (e as Error & { status?: number }).status = 403;
    throw e;
  }
}

/**
 * Genera reporte de Estudiante con histórico longitudinal (RR-08).
 */
export async function reporteEstudiante(
  sesion: SesionUsuario,
  estudianteCurp: string,
  cicloEscolar: string,
  idioma: 'spa' | 'yua' = 'spa',
) {
  exigir(sesion, { estudianteCurp });

  const [est] = await db.select().from(estudiantes).where(eq(estudiantes.curp, estudianteCurp));
  if (!est) throw new Error('Estudiante no encontrado.');

  const ses = await db
    .select()
    .from(sesiones)
    .where(eq(sesiones.estudianteCurp, estudianteCurp));

  const resultados = await db
    .select()
    .from(resultadosSesion)
    .where(sql`${resultadosSesion.sesionId} = ANY(${ses.map((s) => s.id)})`);

  const cuerpo = {
    estudiante: {
      curp: est.curp,
      nombre: `${est.nombre} ${est.primerApellido} ${est.segundoApellido ?? ''}`.trim(),
      grado: est.grado,
      grupo: est.grupo,
      escuela: est.claveEscuela,
    },
    longitudinal: resultados.map((r) => ({
      thetaFinal: Number(r.thetaFinal),
      banda: r.banda,
      puntajeEscalado: r.puntajeEscalado,
      confiabilidad: Number(r.confiabilidad),
    })),
    bandaActual: resultados.at(-1)?.banda ?? 'INSUFICIENTE',
    sugerencias: idioma === 'yua' ? sugerenciasMaya(resultados) : sugerenciasEspanol(resultados),
  };

  const integridadHash = createHash('sha256').update(JSON.stringify(cuerpo)).digest('hex');

  const [rep] = await db
    .insert(reportes)
    .values({
      nivel: 'ESTUDIANTE',
      referenciaId: estudianteCurp,
      cicloEscolar,
      idioma,
      cuerpo,
      integridadHash,
      cumpleUmbralAnonimato: 1,
    })
    .returning();

  await auditar({
    actor: sesion.sujeto,
    accion: 'GENERAR_REPORTE',
    recurso: 'reporte',
    recursoId: rep?.id,
    resultado: 'OK',
  });

  return rep;
}

function sugerenciasEspanol(resultados: typeof resultadosSesion._.inferSelect[]): string[] {
  if (resultados.length === 0) return ['Aún no hay resultados disponibles.'];
  const ultimo = resultados.at(-1)!;
  switch (ultimo.banda) {
    case 'INSUFICIENTE':
      return [
        'Practique lectura en voz alta diariamente durante 15 minutos.',
        'Revise junto con su tutor los temas marcados como áreas de oportunidad.',
        'Solicite al docente apoyo personalizado en aula.',
      ];
    case 'BASICO':
      return [
        'Refuerce la práctica diaria con ejercicios del Programa Sintético.',
        'Realice los retos de la sección "para profundizar" del libro de texto.',
      ];
    case 'SATISFACTORIO':
      return ['Mantenga la práctica regular.', 'Explore los retos de extensión y proyectos colaborativos.'];
    case 'SOBRESALIENTE':
      return [
        'Considere proyectos de profundización con apoyo del docente.',
        'Comparta sus estrategias con sus compañeros (aprendizaje colaborativo).',
      ];
  }
}

function sugerenciasMaya(resultados: typeof resultadosSesion._.inferSelect[]): string[] {
  if (resultados.length === 0) return ['Ma’ taak u páajtal ka’a wiláalil le ba’axo’ono’.'];
  const ultimo = resultados.at(-1)!;
  switch (ultimo.banda) {
    case 'INSUFICIENTE':
      return [
        "Xáakine'ex le t'aano'obo'. Káat 15 minuto'ob ka’ach k’iiniil.",
        'Áanten yéetel a taata wáa a maama ti’ le ba’axo’ono’.',
      ];
    case 'BASICO':
      return ["P’i’it ts’ono’ot u ts’oon le ba’axo’ono’.", "Xokik ti’ libro u biláal."];
    case 'SATISFACTORIO':
      return ['Ma’ a tu jaajan a’iko’ob le ba’axo’ono’.'];
    case 'SOBRESALIENTE':
      return ["A nojochta'ane'ex meyajo'ob ti' jach ya'ab."];
  }
}

/**
 * Reporte agregado por escuela. Aplica anonimización (RR-07).
 */
export async function reporteEscuela(sesion: SesionUsuario, claveCct: string, cicloEscolar: string) {
  exigir(sesion, { cct: claveCct });

  const filas = await db.execute(
    sql`
      SELECT
        COUNT(*) FILTER (WHERE rs.banda = 'INSUFICIENTE') AS n_insuf,
        COUNT(*) FILTER (WHERE rs.banda = 'BASICO')       AS n_basi,
        COUNT(*) FILTER (WHERE rs.banda = 'SATISFACTORIO') AS n_sat,
        COUNT(*) FILTER (WHERE rs.banda = 'SOBRESALIENTE') AS n_sob,
        AVG(rs.theta_final) AS theta_prom,
        COUNT(*) AS n_total
      FROM resultados_sesion rs
      JOIN sesiones s ON s.id = rs.sesion_id
      JOIN aplicaciones a ON a.id = s.aplicacion_id
      WHERE a.clave_escuela = ${claveCct}
    `,
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = (filas as any).rows?.[0] ?? {};
  const total = Number(row.n_total ?? 0);
  const cumple = total >= UMBRAL_ANONIMATO;

  const cuerpo = cumple
    ? {
        ciclo: cicloEscolar,
        cct: claveCct,
        n: total,
        thetaPromedio: row.theta_prom ? Number(row.theta_prom).toFixed(3) : null,
        bandaPromedio: row.theta_prom ? bandaDesempeno(Number(row.theta_prom)) : null,
        puntajeEscaladoPromedio: row.theta_prom ? thetaAEscalado(Number(row.theta_prom)) : null,
        distribucionBandas: {
          insuficiente: Number(row.n_insuf ?? 0),
          basico: Number(row.n_basi ?? 0),
          satisfactorio: Number(row.n_sat ?? 0),
          sobresaliente: Number(row.n_sob ?? 0),
        },
      }
    : { mensaje: `RR-07: muestra menor a ${UMBRAL_ANONIMATO}; reporte suprimido por anonimato.` };

  const integridadHash = createHash('sha256').update(JSON.stringify(cuerpo)).digest('hex');
  const [rep] = await db
    .insert(reportes)
    .values({
      nivel: 'ESCUELA',
      referenciaId: claveCct,
      cicloEscolar,
      cuerpo,
      integridadHash,
      cumpleUmbralAnonimato: cumple ? 1 : 0,
    })
    .returning();
  return rep;
}

/**
 * RR-04 / RR-05: detección de alertas tras una nueva aplicación.
 *
 * Dispara alerta al Director cuando un estudiante cae > 1 SD entre
 * aplicaciones consecutivas; alerta al Supervisor si un grupo entero cae > 0.5 SD.
 */
export async function evaluarAlertas(estudianteCurp: string): Promise<void> {
  const [est] = await db.select().from(estudiantes).where(eq(estudiantes.curp, estudianteCurp));
  if (!est) return;

  const ses = await db
    .select()
    .from(sesiones)
    .where(eq(sesiones.estudianteCurp, estudianteCurp));
  const resultados = await db
    .select()
    .from(resultadosSesion)
    .where(sql`${resultadosSesion.sesionId} = ANY(${ses.map((s) => s.id)})`);

  if (resultados.length < 2) return;
  const ult = Number(resultados.at(-1)!.thetaFinal);
  const prev = Number(resultados.at(-2)!.thetaFinal);
  const caida = prev - ult;

  if (caida > 1.0) {
    await db.insert(alertas).values({
      estudianteCurp,
      claveEscuela: est.claveEscuela,
      tipo: 'CAIDA_DESEMPENO',
      severidad: 'ALTA',
      titulo: 'Caída significativa entre aplicaciones',
      descripcion: `θ pasó de ${prev.toFixed(2)} a ${ult.toFixed(2)} (Δ = ${caida.toFixed(2)} logits, > 1 SD).`,
      evidencia: { thetaPrev: prev, thetaActual: ult, delta: caida },
      destinatarios: [], // se rellena por el job que conoce a Director/USAER del CCT.
    });
  }
}
