/**
 * Concordancia entre calificadores — RC-05 (kappa de Cohen ≥ 0.70).
 *
 * Se aplica entre IA y humano, y entre dos humanos en doble calificación.
 */

export interface ParCalificacion {
  a: number;
  b: number;
}

/**
 * Kappa de Cohen para datos categóricos. Para puntajes ordinales (rúbrica
 * 1-4) se trata cada nivel como categoría.
 */
export function kappaCohen(pares: ParCalificacion[]): number {
  if (pares.length === 0) return 0;

  const categorias = new Set<number>();
  for (const p of pares) {
    categorias.add(p.a);
    categorias.add(p.b);
  }
  const cats = [...categorias].sort();
  const n = pares.length;

  let acuerdos = 0;
  for (const p of pares) if (p.a === p.b) acuerdos++;
  const pObservado = acuerdos / n;

  let pEsperado = 0;
  for (const c of cats) {
    const pa = pares.filter((p) => p.a === c).length / n;
    const pb = pares.filter((p) => p.b === c).length / n;
    pEsperado += pa * pb;
  }

  if (pEsperado >= 1) return 1;
  return (pObservado - pEsperado) / (1 - pEsperado);
}

/**
 * Kappa ponderado (cuadrático) — más adecuado para rúbrica ordinal.
 */
export function kappaPonderado(pares: ParCalificacion[]): number {
  if (pares.length === 0) return 0;

  const categorias = [...new Set(pares.flatMap((p) => [p.a, p.b]))].sort((x, y) => x - y);
  const k = categorias.length;
  const n = pares.length;
  if (k < 2) return 1;

  const pesos: number[][] = [];
  for (let i = 0; i < k; i++) {
    const fila: number[] = [];
    for (let j = 0; j < k; j++) {
      const diff = categorias[i]! - categorias[j]!;
      fila.push((diff * diff) / ((categorias[k - 1]! - categorias[0]!) ** 2));
    }
    pesos.push(fila);
  }

  const observado: number[][] = Array.from({ length: k }, () => Array(k).fill(0));
  for (const p of pares) {
    const i = categorias.indexOf(p.a);
    const j = categorias.indexOf(p.b);
    observado[i]![j]! += 1;
  }
  const filas = observado.map((f) => f.reduce((a, b) => a + b, 0));
  const cols = categorias.map((_, j) => observado.reduce((acc, f) => acc + f[j]!, 0));

  let numerador = 0;
  let denominador = 0;
  for (let i = 0; i < k; i++) {
    for (let j = 0; j < k; j++) {
      const esperado = (filas[i]! * cols[j]!) / n;
      numerador += pesos[i]![j]! * (observado[i]![j]! - esperado);
      denominador += pesos[i]![j]! * esperado;
    }
  }

  if (denominador === 0) return 1;
  return 1 - numerador / denominador;
}
