/**
 * Análisis DIF — Differential Item Functioning.
 *
 * Implementa Mantel-Haenszel para detectar reactivos con funcionamiento
 * diferencial entre subgrupos (Capa 2 — Equidad). Cumple §19.2 y P-09.
 */

export interface RespuestaDif {
  /** Subgrupo: 'REFERENCIA' (mayoría) o 'FOCAL' (subgrupo a proteger). */
  grupo: 'REFERENCIA' | 'FOCAL';
  /** Puntaje total del estudiante (proxy de habilidad). */
  puntajeTotal: number;
  /** Respuesta al ítem: 1 = correcta, 0 = incorrecta. */
  acierto: 0 | 1;
}

export interface ResultadoDif {
  alpha: number;
  /** ETS classification: A (insignificante), B (moderado), C (severo). */
  clasificacion: 'A' | 'B' | 'C';
  /** Decisión sugerida — Comité Editorial decide RB-04. */
  decision: 'OK' | 'REVISAR' | 'DESCARTAR';
  nReferencia: number;
  nFocal: number;
}

/**
 * Mantel-Haenszel: estima el odds ratio del ítem entre grupo focal y de
 * referencia, controlando por habilidad (estratificación por puntaje total).
 */
export function mantelHaenszel(respuestas: RespuestaDif[]): ResultadoDif {
  // Estratificar por puntaje total.
  const estratos = new Map<number, RespuestaDif[]>();
  for (const r of respuestas) {
    const arr = estratos.get(r.puntajeTotal) ?? [];
    arr.push(r);
    estratos.set(r.puntajeTotal, arr);
  }

  let numerador = 0;
  let denominador = 0;

  for (const [, est] of estratos) {
    const aRef = est.filter((r) => r.grupo === 'REFERENCIA' && r.acierto === 1).length;
    const bRef = est.filter((r) => r.grupo === 'REFERENCIA' && r.acierto === 0).length;
    const aFoc = est.filter((r) => r.grupo === 'FOCAL' && r.acierto === 1).length;
    const bFoc = est.filter((r) => r.grupo === 'FOCAL' && r.acierto === 0).length;
    const total = aRef + bRef + aFoc + bFoc;

    if (total === 0) continue;
    numerador += (aRef * bFoc) / total;
    denominador += (bRef * aFoc) / total;
  }

  const alphaMH = denominador > 0 ? numerador / denominador : 1;
  const deltaMH = -2.35 * Math.log(alphaMH); // Holland-Thayer transformation a escala delta.
  const absDelta = Math.abs(deltaMH);

  let clasificacion: 'A' | 'B' | 'C';
  if (absDelta < 1) clasificacion = 'A';
  else if (absDelta < 1.5) clasificacion = 'B';
  else clasificacion = 'C';

  let decision: 'OK' | 'REVISAR' | 'DESCARTAR';
  if (clasificacion === 'A') decision = 'OK';
  else if (clasificacion === 'B') decision = 'REVISAR';
  else decision = 'DESCARTAR';

  return {
    alpha: alphaMH,
    clasificacion,
    decision,
    nReferencia: respuestas.filter((r) => r.grupo === 'REFERENCIA').length,
    nFocal: respuestas.filter((r) => r.grupo === 'FOCAL').length,
  };
}
