/**
 * Motor CAT (Computerized Adaptive Testing) — implementa RM-01..RM-09.
 *
 * Selección por información de Fisher con restricciones de blueprint y
 * exposición. Basado en 1EdTech CAT (estándar adoptado en §23).
 */

import {
  type ParametrosItem,
  type RespuestaItem,
  estimarThetaEap,
  informacionFisher,
} from './tri';

export interface RetoDisponible {
  retoId: string;
  versionId: string;
  pdaId: string | null;
  campo: string;
  bandaDificultad: 'baja' | 'media' | 'alta';
  parametros: ParametrosItem;
  esAnclaje: boolean;
  /** Métricas de exposición acumulada (RB-08). */
  exposicionAcumulada: number;
}

export interface BlueprintObjetivo {
  pda: Array<{ pdaId: string; minimo: number; maximo: number }>;
  dificultad: { baja: number; media: number; alta: number };
  proporcionAnclaje: number;
  longitudObjetivo: number;
  longitudMinima: number;
  longitudMaxima: number;
  errorEstandarObjetivo: number;
}

export interface EstadoCat {
  thetaActual: number;
  ee: number;
  respuestas: RespuestaItem[];
  retosPresentados: Set<string>;
  conteoPorPda: Map<string, number>;
  conteoPorBanda: { baja: number; media: number; alta: number };
  conteoAnclaje: number;
}

export const estadoInicial = (): EstadoCat => ({
  thetaActual: 0,
  ee: Infinity,
  respuestas: [],
  retosPresentados: new Set(),
  conteoPorPda: new Map(),
  conteoPorBanda: { baja: 0, media: 0, alta: 0 },
  conteoAnclaje: 0,
});

/**
 * Decide si la sesión debe terminar (RM-08).
 * Termina cuando:
 *  (a) se alcanza la longitud objetivo, o
 *  (b) EE < umbral y se cumple longitud mínima, o
 *  (c) se alcanza la longitud máxima.
 */
export function debeTerminar(estado: EstadoCat, blueprint: BlueprintObjetivo): boolean {
  const n = estado.respuestas.length;
  if (n >= blueprint.longitudMaxima) return true;
  if (n >= blueprint.longitudObjetivo) return true;
  if (n >= blueprint.longitudMinima && estado.ee < blueprint.errorEstandarObjetivo) return true;
  return false;
}

/**
 * Selecciona el siguiente reto (RM-03).
 *
 * Estrategia:
 *  1. Filtra retos no presentados (RM-05).
 *  2. Si quedan anclajes obligatorios pendientes y aún hay cupo, prioriza anclaje.
 *  3. Aplica restricciones de blueprint duras (PDA mínimos no cumplidos).
 *  4. Maximiza información de Fisher en θ provisional.
 *  5. Penaliza exposición alta (RB-08).
 */
export function seleccionarSiguienteReto(
  estado: EstadoCat,
  candidatos: RetoDisponible[],
  blueprint: BlueprintObjetivo,
): RetoDisponible | null {
  const disponibles = candidatos.filter((c) => !estado.retosPresentados.has(c.retoId));
  if (disponibles.length === 0) return null;

  const longitudObj = blueprint.longitudObjetivo;
  const anclajeObj = Math.round(blueprint.proporcionAnclaje * longitudObj);
  const requiereAnclaje = estado.conteoAnclaje < anclajeObj;

  // PDA con mínimos no cumplidos.
  const pdaPendientes = new Set(
    blueprint.pda
      .filter((p) => (estado.conteoPorPda.get(p.pdaId) ?? 0) < p.minimo)
      .map((p) => p.pdaId),
  );

  const pool = disponibles.filter((c) => {
    if (requiereAnclaje && !c.esAnclaje) return false;
    if (pdaPendientes.size > 0 && (!c.pdaId || !pdaPendientes.has(c.pdaId))) return false;
    // Bloquea PDA por encima del máximo.
    const lim = blueprint.pda.find((p) => p.pdaId === c.pdaId);
    if (lim && (estado.conteoPorPda.get(lim.pdaId) ?? 0) >= lim.maximo) return false;
    return true;
  });

  const candidatosFinales = pool.length > 0 ? pool : disponibles;

  let mejor: RetoDisponible | null = null;
  let mejorPuntuacion = -Infinity;

  for (const c of candidatosFinales) {
    const info = informacionFisher(estado.thetaActual, c.parametros);
    const penalExposicion = 1 / (1 + c.exposicionAcumulada * 0.1);
    const puntuacion = info * penalExposicion;
    if (puntuacion > mejorPuntuacion) {
      mejorPuntuacion = puntuacion;
      mejor = c;
    }
  }

  return mejor;
}

/**
 * Aplica una respuesta y actualiza θ (RM-02).
 */
export function aplicarRespuesta(
  estado: EstadoCat,
  reto: RetoDisponible,
  respuesta: 0 | 1,
): EstadoCat {
  const respuestas = [...estado.respuestas, { params: reto.parametros, u: respuesta }];
  const { theta, ee } = estimarThetaEap(respuestas);
  const conteoPorPda = new Map(estado.conteoPorPda);
  if (reto.pdaId) conteoPorPda.set(reto.pdaId, (conteoPorPda.get(reto.pdaId) ?? 0) + 1);
  const conteoPorBanda = { ...estado.conteoPorBanda };
  conteoPorBanda[reto.bandaDificultad] += 1;

  return {
    thetaActual: theta,
    ee,
    respuestas,
    retosPresentados: new Set([...estado.retosPresentados, reto.retoId]),
    conteoPorPda,
    conteoPorBanda,
    conteoAnclaje: estado.conteoAnclaje + (reto.esAnclaje ? 1 : 0),
  };
}
