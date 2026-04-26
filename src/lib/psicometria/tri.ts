/**
 * Motor de Teoría de Respuesta al Ítem — Capa 1 del SED 2.0.
 *
 * Implementa los modelos 1PL (Rasch), 2PL y 3PL declarados en ADR-02.
 *
 * Funciones:
 *  - probabilidadAcierto(theta, params)
 *  - informacionFisher(theta, params)
 *  - estimarThetaMle(respuestas)
 *  - estimarThetaEap(respuestas, prior)
 *  - errorEstandar(theta, items)
 *
 * Referencia: Standards for Educational and Psychological Testing (AERA-APA-NCME, 2014).
 */

export interface ParametrosItem {
  /** Discriminación. 1.0 fija para 1PL. */
  a: number;
  /** Dificultad en logits. */
  b: number;
  /** Pseudo-azar. 0 para 1PL/2PL. */
  c: number;
  modelo: '1PL' | '2PL' | '3PL';
}

export interface RespuestaItem {
  params: ParametrosItem;
  /** 1 = correcto, 0 = incorrecto. Para abiertos calificados con rúbrica, se transforma. */
  u: 0 | 1;
}

const MIN_THETA = -4;
const MAX_THETA = 4;
const EPSILON = 1e-9;

/**
 * P(θ) — probabilidad de respuesta correcta dado θ.
 *
 * Modelo 3PL (general):  P = c + (1 - c) / (1 + exp(-a(θ - b)))
 * Modelo 2PL: c=0
 * Modelo 1PL/Rasch: a=1, c=0
 */
export function probabilidadAcierto(theta: number, p: ParametrosItem): number {
  const a = p.modelo === '1PL' ? 1 : p.a;
  const c = p.modelo === '3PL' ? p.c : 0;
  const z = a * (theta - p.b);
  const expo = 1 / (1 + Math.exp(-z));
  return c + (1 - c) * expo;
}

/**
 * Información de Fisher I(θ) — base para la selección adaptativa (RM-03).
 *
 * Para 3PL:  I = a² · (1-P)/P · ((P-c)/(1-c))²
 * Para 1PL/2PL: I = a² · P · (1-P)
 */
export function informacionFisher(theta: number, p: ParametrosItem): number {
  const a = p.modelo === '1PL' ? 1 : p.a;
  const c = p.modelo === '3PL' ? p.c : 0;
  const P = probabilidadAcierto(theta, p);
  const Q = 1 - P;

  if (P <= EPSILON || Q <= EPSILON) return 0;

  if (c === 0) {
    return a * a * P * Q;
  }
  const num = (P - c) * (P - c);
  const den = (1 - c) * (1 - c);
  return (a * a * Q * num) / (P * den);
}

/**
 * Suma de información de un conjunto de ítems en un θ dado.
 * El error estándar de la estimación es 1 / sqrt(I_total).
 */
export function informacionTotal(theta: number, items: ParametrosItem[]): number {
  return items.reduce((acc, p) => acc + informacionFisher(theta, p), 0);
}

export function errorEstandar(theta: number, items: ParametrosItem[]): number {
  const I = informacionTotal(theta, items);
  if (I < EPSILON) return Infinity;
  return 1 / Math.sqrt(I);
}

/**
 * Estimación de θ por máxima verosimilitud (Newton-Raphson).
 *
 * No converge cuando todas las respuestas son correctas o todas incorrectas;
 * en esos casos se devuelve θ = ±MAX_THETA con bandera de advertencia.
 */
export function estimarThetaMle(respuestas: RespuestaItem[]): {
  theta: number;
  ee: number;
  iteraciones: number;
  convergio: boolean;
} {
  if (respuestas.length === 0) {
    return { theta: 0, ee: Infinity, iteraciones: 0, convergio: false };
  }

  const todasCorrectas = respuestas.every((r) => r.u === 1);
  const todasIncorrectas = respuestas.every((r) => r.u === 0);
  if (todasCorrectas) {
    const ee = errorEstandar(MAX_THETA, respuestas.map((r) => r.params));
    return { theta: MAX_THETA, ee, iteraciones: 0, convergio: false };
  }
  if (todasIncorrectas) {
    const ee = errorEstandar(MIN_THETA, respuestas.map((r) => r.params));
    return { theta: MIN_THETA, ee, iteraciones: 0, convergio: false };
  }

  let theta = 0;
  const maxIter = 50;
  const tol = 1e-4;

  for (let iter = 1; iter <= maxIter; iter++) {
    let firstDeriv = 0;
    let secondDeriv = 0;

    for (const { params, u } of respuestas) {
      const a = params.modelo === '1PL' ? 1 : params.a;
      const c = params.modelo === '3PL' ? params.c : 0;
      const P = probabilidadAcierto(theta, params);
      const Q = 1 - P;

      if (c === 0) {
        // 1PL / 2PL: ∂L/∂θ = a·(u - P);  ∂²L/∂θ² = -a²·P·Q.
        firstDeriv += a * (u - P);
        secondDeriv -= a * a * P * Q;
      } else {
        // 3PL: forma de Birnbaum (1968) — ver Hambleton & Swaminathan (1985), eq. 6.10.
        const factor = (P - c) / (P * (1 - c));
        firstDeriv += a * (u - P) * factor;
        const W = ((P - c) / (1 - c)) ** 2 * (Q / Math.max(P, EPSILON));
        secondDeriv -= a * a * W;
      }
    }

    if (Math.abs(secondDeriv) < EPSILON) break;
    const delta = firstDeriv / secondDeriv;
    theta -= delta;
    theta = Math.max(MIN_THETA, Math.min(MAX_THETA, theta));

    if (Math.abs(delta) < tol) {
      const ee = errorEstandar(theta, respuestas.map((r) => r.params));
      return { theta, ee, iteraciones: iter, convergio: true };
    }
  }

  const ee = errorEstandar(theta, respuestas.map((r) => r.params));
  return { theta, ee, iteraciones: maxIter, convergio: false };
}

/**
 * Estimación de θ por valor esperado a posteriori (EAP).
 * Usa cuadratura sobre rejilla de N puntos con prior normal estándar.
 *
 * EAP es más robusta que MLE en sesiones cortas — recomendado para CAT.
 */
export function estimarThetaEap(
  respuestas: RespuestaItem[],
  opciones: { puntos?: number; mediaPrior?: number; sdPrior?: number } = {},
): { theta: number; ee: number } {
  const N = opciones.puntos ?? 41;
  const mu = opciones.mediaPrior ?? 0;
  const sd = opciones.sdPrior ?? 1;

  const grid: number[] = [];
  const step = (MAX_THETA - MIN_THETA) / (N - 1);
  for (let i = 0; i < N; i++) grid.push(MIN_THETA + i * step);

  const pesos = grid.map((q) => {
    const z = (q - mu) / sd;
    return Math.exp(-0.5 * z * z) / (sd * Math.sqrt(2 * Math.PI));
  });

  const verosimilitudes = grid.map((q) => {
    let l = 0;
    for (const { params, u } of respuestas) {
      const P = probabilidadAcierto(q, params);
      const p = u === 1 ? Math.max(P, EPSILON) : Math.max(1 - P, EPSILON);
      l += Math.log(p);
    }
    return Math.exp(l);
  });

  const numerador = grid.reduce((acc, q, i) => acc + q * verosimilitudes[i]! * pesos[i]!, 0);
  const denominador = grid.reduce((acc, _, i) => acc + verosimilitudes[i]! * pesos[i]!, 0);

  if (denominador < EPSILON) return { theta: 0, ee: Infinity };
  const theta = numerador / denominador;

  const numeradorVar = grid.reduce(
    (acc, q, i) => acc + (q - theta) * (q - theta) * verosimilitudes[i]! * pesos[i]!,
    0,
  );
  const varianza = numeradorVar / denominador;
  const ee = Math.sqrt(Math.max(varianza, 0));
  return { theta, ee };
}

/**
 * Convierte θ (logits, escala continua) a puntaje escalado 200-800.
 * Mapeo lineal con θ=-3 → 200, θ=3 → 800.
 */
export function thetaAEscalado(theta: number): number {
  const clamped = Math.max(-3, Math.min(3, theta));
  return Math.round(500 + (clamped / 3) * 300);
}

/**
 * Banda de desempeño según cortes nominales. Los cortes definitivos los
 * fija la Unidad Psicométrica (RG-06) tras pilotaje y standard setting.
 */
export function bandaDesempeno(theta: number): 'INSUFICIENTE' | 'BASICO' | 'SATISFACTORIO' | 'SOBRESALIENTE' {
  if (theta < -1.0) return 'INSUFICIENTE';
  if (theta < 0.0) return 'BASICO';
  if (theta < 1.0) return 'SATISFACTORIO';
  return 'SOBRESALIENTE';
}
