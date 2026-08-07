import { randomInt } from "node:crypto";

// Fisher-Yates con fuente criptografica — usado para el orden del paso 1B
export function fisherYates<T>(input: readonly T[]): T[] {
  const arr = input.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(0, i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
