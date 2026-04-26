import { describe, it, expect } from 'vitest';
import {
  estadoInicial,
  seleccionarSiguienteReto,
  aplicarRespuesta,
  debeTerminar,
  type RetoDisponible,
  type BlueprintObjetivo,
} from '@/lib/psicometria/cat';

const BLUEPRINT: BlueprintObjetivo = {
  pda: [],
  dificultad: { baja: 5, media: 10, alta: 5 },
  proporcionAnclaje: 0.0,
  longitudObjetivo: 5,
  longitudMinima: 3,
  longitudMaxima: 10,
  errorEstandarObjetivo: 0.3,
};

function reto(retoId: string, b: number, esAnclaje = false): RetoDisponible {
  const banda: RetoDisponible['bandaDificultad'] = b < -0.5 ? 'baja' : b < 0.5 ? 'media' : 'alta';
  return {
    retoId,
    versionId: `v-${retoId}`,
    pdaId: null,
    campo: 'L',
    bandaDificultad: banda,
    parametros: { a: 1, b, c: 0, modelo: '1PL' },
    esAnclaje,
    exposicionAcumulada: 0,
  };
}

describe('CAT — selección por información de Fisher', () => {
  const candidatos = [reto('r1', -1.5), reto('r2', 0), reto('r3', 1.5), reto('r4', 0.2)];

  it('en θ=0, prefiere ítem cercano a 0 (máxima información)', () => {
    const estado = estadoInicial();
    const sel = seleccionarSiguienteReto(estado, candidatos, BLUEPRINT);
    expect(sel?.retoId === 'r2' || sel?.retoId === 'r4').toBe(true);
  });

  it('no presenta dos veces el mismo reto (RM-05)', () => {
    let estado = estadoInicial();
    estado = aplicarRespuesta(estado, candidatos[0]!, 1);
    const sel = seleccionarSiguienteReto(estado, candidatos, BLUEPRINT);
    expect(sel?.retoId).not.toBe(candidatos[0]!.retoId);
  });

  it('termina al alcanzar longitud objetivo (RM-08)', () => {
    let estado = estadoInicial();
    for (let i = 0; i < 5; i++) {
      const sel = seleccionarSiguienteReto(estado, candidatos, BLUEPRINT);
      if (sel) estado = aplicarRespuesta(estado, sel, i % 2 === 0 ? 1 : 0);
    }
    expect(debeTerminar(estado, BLUEPRINT)).toBe(true);
  });
});
