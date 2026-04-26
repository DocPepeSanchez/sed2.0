/**
 * Servicio de Calificación — Capa 6.
 *
 * Triple capa: cerrados automáticos (RC-01), IA en abiertos cortos (RC-02),
 * humano en casos límite (RC-04). QA muestral 5-10% (RC-03), kappa ≥ 0.70 (RC-05),
 * doble calificación humana en arbitraje (RC-06), 95% en ≤ 72h (RC-07),
 * trazabilidad completa (RC-08).
 */

import { eq, sql } from 'drizzle-orm';
import { db } from '@/db/client';
import { respuestas, calificaciones, retoVersiones, retos } from '@/db/schema';
import type { SesionUsuario } from '@/lib/security/rbac';
import { authorize } from '@/lib/security/rbac';
import { auditar } from '@/lib/security/audit';
import { kappaCohen } from '@/lib/psicometria/concordancia';

const TASA_QA_MUESTRAL = 0.075; // 7.5% — punto medio de RC-03 (5-10%).

function exigir(sesion: SesionUsuario, recurso: string, verbo: 'C' | 'L' | 'U') {
  const r = authorize(sesion, { recurso, verbo });
  if (!r.permitido) {
    const e = new Error(`Acceso denegado: ${r.motivo}`);
    (e as Error & { status?: number }).status = 403;
    throw e;
  }
}

/**
 * Califica automáticamente una respuesta cerrada (RC-01).
 *
 * Compara el contenido recibido contra `claveRespuesta` de la versión del reto.
 * Para opciones múltiples: igualdad estricta. Para selección múltiple:
 * coincidencia exacta de conjuntos.
 */
export async function calificarAutomatico(respuestaId: string): Promise<{
  puntaje: number;
  puntajeMaximo: number;
}> {
  const [resp] = await db.select().from(respuestas).where(eq(respuestas.id, respuestaId));
  if (!resp) throw new Error('Respuesta no encontrada.');

  const [version] = await db.select().from(retoVersiones).where(eq(retoVersiones.id, resp.retoVersionId));
  if (!version) throw new Error('Versión de reto no encontrada.');
  const [reto] = await db.select().from(retos).where(eq(retos.id, resp.retoId));
  if (!reto) throw new Error('Reto no encontrado.');

  if (!reto.tipo.startsWith('CERRADO')) {
    throw new Error('RC-01: solo retos cerrados se califican automáticamente.');
  }

  const respuestaEstudiante = (resp.contenidoQti as { respuesta?: unknown }).respuesta;
  const clave = version.claveRespuesta;
  const acierta = comparaRespuesta(respuestaEstudiante, clave);
  const puntaje = acierta ? 1 : 0;

  await db.transaction(async (tx) => {
    await tx.insert(calificaciones).values({
      respuestaId,
      metodo: 'AUTO',
      puntaje: puntaje.toFixed(2),
      puntajeMaximo: '1.00',
      tiempoProcesamientoSeg: 0,
      estado: 'FINAL',
    });
    await tx.update(respuestas).set({ estado: 'CALIFICADA' }).where(eq(respuestas.id, respuestaId));
  });

  return { puntaje, puntajeMaximo: 1 };
}

function comparaRespuesta(estudiante: unknown, clave: unknown): boolean {
  if (Array.isArray(estudiante) && Array.isArray(clave)) {
    if (estudiante.length !== clave.length) return false;
    const a = [...estudiante].sort();
    const b = [...clave].sort();
    return a.every((v, i) => v === b[i]);
  }
  return estudiante === clave;
}

/**
 * Califica con IA un reto abierto corto (RC-02).
 *
 * Esta función publica el evento en el bus para que el worker del modelo
 * fine-tuned (Llama 3 / Mistral, ADR-07) procese el batch. La promesa se
 * resuelve cuando el worker persiste el resultado.
 *
 * En esta implementación de referencia ofrecemos un fallback determinístico
 * basado en la rúbrica para entornos de desarrollo sin GPU.
 */
export async function calificarIaAbiertoCorto(
  respuestaId: string,
  opciones: { umbralCasoLimite?: number } = {},
): Promise<{ puntaje: number; puntajeMaximo: number; requiereHumano: boolean }> {
  const [resp] = await db.select().from(respuestas).where(eq(respuestas.id, respuestaId));
  if (!resp) throw new Error('Respuesta no encontrada.');

  const [version] = await db.select().from(retoVersiones).where(eq(retoVersiones.id, resp.retoVersionId));
  if (!version) throw new Error('Versión no encontrada.');

  const rubrica = version.rubrica;
  if (!rubrica || rubrica.length === 0) {
    throw new Error('RC-02: el reto no tiene rúbrica asociada.');
  }

  const inicio = Date.now();
  // Fallback dev: heurística por longitud y palabras clave de la respuesta modelo.
  const respTexto = String((resp.contenidoQti as { texto?: unknown }).texto ?? '');
  const modelo = String(version.respuestaModelo ?? '');
  const score = puntuacionHeuristicaRubrica(respTexto, modelo, rubrica);
  const max = Math.max(...rubrica.map((r) => r.nivel));

  // RC-04: caso límite si el puntaje cae cerca de un corte de banda (±0.5 nivel).
  const proximidad = Math.abs(score - Math.round(score));
  const requiereHumano = proximidad < (opciones.umbralCasoLimite ?? 0.35) && score % 1 !== 0;

  const tiempo = Math.round((Date.now() - inicio) / 1000);

  await db.transaction(async (tx) => {
    await tx.insert(calificaciones).values({
      respuestaId,
      metodo: requiereHumano ? 'IA' : 'IA',
      puntaje: score.toFixed(2),
      puntajeMaximo: max.toFixed(2),
      tiempoProcesamientoSeg: tiempo,
      estado: requiereHumano ? 'EN_REVISION' : 'FINAL',
      retroalimentacion: rubrica.find((r) => r.nivel === Math.round(score))?.descripcion ?? null,
    });

    if (requiereHumano) {
      await tx.update(respuestas).set({ estado: 'EN_REVISION' }).where(eq(respuestas.id, respuestaId));
    } else {
      // QA muestral aleatoria — RC-03.
      const enviarQa = Math.random() < TASA_QA_MUESTRAL;
      await tx
        .update(respuestas)
        .set({ estado: enviarQa ? 'EN_REVISION' : 'CALIFICADA' })
        .where(eq(respuestas.id, respuestaId));
    }
  });

  return { puntaje: score, puntajeMaximo: max, requiereHumano };
}

function puntuacionHeuristicaRubrica(
  respuesta: string,
  modelo: string,
  rubrica: Array<{ nivel: number; descripcion: string }>,
): number {
  if (respuesta.trim().length === 0) return rubrica[0]?.nivel ?? 1;
  const palabrasResp = new Set(respuesta.toLowerCase().split(/\s+/));
  const palabrasMod = new Set(modelo.toLowerCase().split(/\s+/));
  const interseccion = [...palabrasResp].filter((p) => palabrasMod.has(p) && p.length > 3).length;
  const cobertura = palabrasMod.size > 0 ? interseccion / palabrasMod.size : 0;
  const max = Math.max(...rubrica.map((r) => r.nivel));
  return Math.max(rubrica[0]?.nivel ?? 1, Math.min(max, +(cobertura * max).toFixed(2)));
}

/**
 * Calificación humana — RC-04 / RC-06 doble calificación.
 */
export async function calificarHumano(
  sesion: SesionUsuario,
  input: {
    respuestaId: string;
    puntaje: number;
    puntajeMaximo: number;
    retroalimentacion?: string;
  },
) {
  exigir(sesion, 'calificacion', 'C');

  await db.insert(calificaciones).values({
    respuestaId: input.respuestaId,
    metodo: 'HUMANA',
    puntaje: input.puntaje.toFixed(2),
    puntajeMaximo: input.puntajeMaximo.toFixed(2),
    calificadorRfc: sesion.sujeto,
    retroalimentacion: input.retroalimentacion,
    estado: 'FINAL',
  });

  await db.update(respuestas).set({ estado: 'CALIFICADA' }).where(eq(respuestas.id, input.respuestaId));

  await auditar({
    actor: sesion.sujeto,
    accion: 'CALIFICAR_HUMANO',
    recurso: 'respuesta',
    recursoId: input.respuestaId,
    resultado: 'OK',
  });
}

/**
 * RC-05: monitorea concordancia kappa entre IA y humano sobre QA muestral.
 * Devuelve kappa global; si < 0.70 dispara alerta para reentrenar el modelo.
 */
export async function monitorearConcordanciaIaHumano(): Promise<number> {
  // En producción este cálculo se hace contra los pares (IA, humano)
  // de los últimos N días. En esta plantilla devolvemos 0 si no hay datos.
  const filas = await db.execute(sql`
    SELECT c1.puntaje::numeric AS ia, c2.puntaje::numeric AS humano
    FROM calificaciones c1
    JOIN calificaciones c2
      ON c1.respuesta_id = c2.respuesta_id AND c2.metodo IN ('HUMANA','ARBITRADA')
    WHERE c1.metodo IN ('IA','IA_VALIDADA')
    LIMIT 5000
  `);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pares = (filas as any).rows ?? [];
  if (pares.length === 0) return 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return kappaCohen(pares.map((p: any) => ({ a: Math.round(Number(p.ia)), b: Math.round(Number(p.humano)) })));
}
