import { describe, it, expect } from 'vitest';
import { kappaCohen, kappaPonderado } from '@/lib/psicometria/concordancia';

describe('Concordancia', () => {
  it('kappa = 1 cuando todos los pares concuerdan', () => {
    const pares = [
      { a: 1, b: 1 },
      { a: 2, b: 2 },
      { a: 3, b: 3 },
      { a: 4, b: 4 },
    ];
    expect(kappaCohen(pares)).toBe(1);
  });

  it('kappa cercano a 0 con asignación aleatoria', () => {
    const pares = [
      { a: 1, b: 4 },
      { a: 2, b: 3 },
      { a: 3, b: 2 },
      { a: 4, b: 1 },
    ];
    const k = kappaCohen(pares);
    expect(Math.abs(k)).toBeLessThan(0.5);
  });

  it('kappa ponderado penaliza más las distancias grandes', () => {
    const cercano = [{ a: 1, b: 2 }, { a: 2, b: 3 }, { a: 3, b: 4 }];
    const lejano = [{ a: 1, b: 4 }, { a: 2, b: 4 }, { a: 3, b: 1 }];
    expect(kappaPonderado(cercano)).toBeGreaterThan(kappaPonderado(lejano));
  });
});
