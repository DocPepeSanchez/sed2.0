import { describe, it, expect } from 'vitest';
import {
  probabilidadAcierto,
  informacionFisher,
  estimarThetaMle,
  estimarThetaEap,
  thetaAEscalado,
  bandaDesempeno,
} from '@/lib/psicometria/tri';

describe('TRI — modelos 1PL/2PL/3PL', () => {
  it('1PL: P(θ=b) = 0.5', () => {
    const p = probabilidadAcierto(0, { a: 1, b: 0, c: 0, modelo: '1PL' });
    expect(p).toBeCloseTo(0.5, 4);
  });

  it('2PL: discriminación más alta produce curva más empinada', () => {
    const baja = informacionFisher(0, { a: 0.5, b: 0, c: 0, modelo: '2PL' });
    const alta = informacionFisher(0, { a: 2.0, b: 0, c: 0, modelo: '2PL' });
    expect(alta).toBeGreaterThan(baja);
  });

  it('3PL: con c > 0, P(θ→-∞) tiende a c, no a 0', () => {
    const p = probabilidadAcierto(-3, { a: 1, b: 0, c: 0.25, modelo: '3PL' });
    expect(p).toBeGreaterThan(0.24);
    expect(p).toBeLessThan(0.5);
  });

  it('Fisher es máxima cerca de θ=b en 1PL', () => {
    const i0 = informacionFisher(0, { a: 1, b: 0, c: 0, modelo: '1PL' });
    const i1 = informacionFisher(1.5, { a: 1, b: 0, c: 0, modelo: '1PL' });
    expect(i0).toBeGreaterThan(i1);
  });
});

describe('Estimación de θ', () => {
  const items = [
    { params: { a: 1, b: -1, c: 0, modelo: '1PL' as const }, u: 1 as const },
    { params: { a: 1, b: 0, c: 0, modelo: '1PL' as const }, u: 1 as const },
    { params: { a: 1, b: 1, c: 0, modelo: '1PL' as const }, u: 0 as const },
    { params: { a: 1, b: 2, c: 0, modelo: '1PL' as const }, u: 0 as const },
  ];

  it('MLE converge a θ entre 0 y 1 con patrón coherente', () => {
    const r = estimarThetaMle(items);
    expect(r.convergio).toBe(true);
    expect(r.theta).toBeGreaterThan(0);
    expect(r.theta).toBeLessThan(1);
  });

  it('EAP ofrece estimación finita aun con todas correctas', () => {
    const todas = items.map((i) => ({ ...i, u: 1 as const }));
    const r = estimarThetaEap(todas);
    expect(Number.isFinite(r.theta)).toBe(true);
    expect(r.theta).toBeGreaterThan(0);
  });

  it('MLE en patrón degenerado todas correctas devuelve θ máx con convergio=false', () => {
    const todas = items.map((i) => ({ ...i, u: 1 as const }));
    const r = estimarThetaMle(todas);
    expect(r.convergio).toBe(false);
    expect(r.theta).toBe(4);
  });
});

describe('Mapeo θ → puntaje escalado y banda', () => {
  it('θ=0 → 500', () => {
    expect(thetaAEscalado(0)).toBe(500);
  });
  it('θ=3 → 800', () => {
    expect(thetaAEscalado(3)).toBe(800);
  });
  it('θ < -1 es INSUFICIENTE', () => {
    expect(bandaDesempeno(-1.5)).toBe('INSUFICIENTE');
  });
  it('θ ≥ 1 es SOBRESALIENTE', () => {
    expect(bandaDesempeno(1.2)).toBe('SOBRESALIENTE');
  });
});
