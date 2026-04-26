import { describe, it, expect } from 'vitest';
import { authorize, type SesionUsuario } from '@/lib/security/rbac';

describe('RBAC — matriz §31', () => {
  it('Director CEEEY puede leer cualquier reto', () => {
    const sesion: SesionUsuario = {
      sujeto: 'XAXX010101000',
      asignaciones: [{ rol: 'DIR_GENERAL_CEEEY', alcance: { tipo: 'ESTADO' } }],
    };
    const r = authorize(sesion, { recurso: 'reto', verbo: 'L' });
    expect(r.permitido).toBe(true);
  });

  it('Elaborador no puede aprobar retos', () => {
    const sesion: SesionUsuario = {
      sujeto: 'XAXX010101001',
      asignaciones: [{ rol: 'ELABORADOR', alcance: { tipo: 'ESTADO' } }],
    };
    const r = authorize(sesion, { recurso: 'reto', verbo: 'A' });
    expect(r.permitido).toBe(false);
  });

  it('Aplicador solo accede a su CCT', () => {
    const sesion: SesionUsuario = {
      sujeto: 'XAXX010101002',
      asignaciones: [{ rol: 'APLICADOR', alcance: { tipo: 'CCT', valor: '31DPB0001A' } }],
    };
    expect(
      authorize(sesion, { recurso: 'aplicacion', verbo: 'L', contexto: { cct: '31DPB0001A' } })
        .permitido,
    ).toBe(true);
    expect(
      authorize(sesion, { recurso: 'aplicacion', verbo: 'L', contexto: { cct: 'OTRA' } })
        .permitido,
    ).toBe(false);
  });

  it('Auditor externo recibe permitido con bandera anonimizar', () => {
    const sesion: SesionUsuario = {
      sujeto: 'AUDX010101000',
      asignaciones: [{ rol: 'AUDITOR_EXTERNO', alcance: { tipo: 'ESTADO' } }],
    };
    const r = authorize(sesion, { recurso: 'respuesta', verbo: 'L' });
    expect(r.permitido).toBe(true);
    expect(r.anonimizar).toBe(true);
  });

  it('Revisor 1 solo cuando estado = CREADO (RB-02)', () => {
    const sesion: SesionUsuario = {
      sujeto: 'REVX010101000',
      asignaciones: [{ rol: 'REVISOR_1', alcance: { tipo: 'ESTADO' } }],
    };
    expect(
      authorize(sesion, { recurso: 'reto', verbo: 'U', contexto: { estado: 'CREADO' } })
        .permitido,
    ).toBe(true);
    expect(
      authorize(sesion, { recurso: 'reto', verbo: 'U', contexto: { estado: 'OPERATIVO' } })
        .permitido,
    ).toBe(false);
  });
});
