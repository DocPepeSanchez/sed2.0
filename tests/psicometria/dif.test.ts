import { describe, it, expect } from 'vitest';
import { mantelHaenszel } from '@/lib/psicometria/dif';

describe('DIF — Mantel-Haenszel', () => {
  it('devuelve clasificación A cuando los grupos rinden similar', () => {
    const respuestas = Array.from({ length: 200 }, (_, i) => {
      const grupo = i < 100 ? 'REFERENCIA' : 'FOCAL';
      const puntaje = (i % 10) + 1;
      const acierto = puntaje > 5 ? 1 : 0;
      return { grupo: grupo as 'REFERENCIA' | 'FOCAL', puntajeTotal: puntaje, acierto: acierto as 0 | 1 };
    });
    const r = mantelHaenszel(respuestas);
    expect(r.clasificacion).toBe('A');
    expect(r.decision).toBe('OK');
  });

  it('detecta DIF severo cuando focal acierta menos a igual habilidad', () => {
    const respuestas: Array<{ grupo: 'REFERENCIA' | 'FOCAL'; puntajeTotal: number; acierto: 0 | 1 }> = [];
    for (let i = 0; i < 200; i++) {
      const puntaje = 5;
      respuestas.push({ grupo: 'REFERENCIA', puntajeTotal: puntaje, acierto: 1 });
    }
    for (let i = 0; i < 200; i++) {
      const puntaje = 5;
      respuestas.push({ grupo: 'FOCAL', puntajeTotal: puntaje, acierto: 0 });
    }
    const r = mantelHaenszel(respuestas);
    expect(['B', 'C']).toContain(r.clasificacion);
  });
});
