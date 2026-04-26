/**
 * Aplicación efectiva del RBAC — Parte IV §31.
 *
 * Resuelve, para una sesión dada (sujeto + roles asignados + alcance),
 * si una acción concreta sobre un recurso está autorizada.
 *
 * Este módulo es la única superficie de autorización del SED. Toda llamada
 * a un endpoint o server action debe pasar por `authorize()`.
 */

import type { Verbo, Capacidad } from '@/db/schema/rbac';
import { ROLES_BY_CODE, type RolDefinicion } from '@/lib/catalogos/roles';

export interface SesionUsuario {
  /** RFC para personal, CURP para estudiantes/tutores. */
  sujeto: string;
  /** Roles asignados con su alcance específico. */
  asignaciones: Array<{
    rol: string;
    alcance: { tipo: string; valor?: string };
  }>;
}

export interface SolicitudAutorizacion {
  recurso: string;
  verbo: Verbo;
  /**
   * Contexto del recurso solicitado — necesario para evaluar reglas de alcance.
   * Por ejemplo, para 'aplicacion' incluye claveCct, zona, region.
   */
  contexto?: {
    cct?: string;
    zona?: string | number;
    region?: string;
    estudianteCurp?: string;
    docenteRfc?: string;
    tutorCurp?: string;
    estado?: string;
    [key: string]: unknown;
  };
}

export interface ResultadoAutorizacion {
  permitido: boolean;
  rolMatch?: string;
  motivo: string;
  /** Si la autorización es ANONIMIZADO, las consultas deben quitar PII. */
  anonimizar: boolean;
}

export function authorize(sesion: SesionUsuario, req: SolicitudAutorizacion): ResultadoAutorizacion {
  if (sesion.asignaciones.length === 0) {
    return { permitido: false, motivo: 'sin_roles', anonimizar: false };
  }

  for (const asig of sesion.asignaciones) {
    const rol: RolDefinicion | undefined = ROLES_BY_CODE[asig.rol];
    if (!rol) continue;

    for (const cap of rol.capacidades) {
      if (cap.recurso !== req.recurso) continue;
      if (!cap.verbos.includes(req.verbo)) continue;

      if (!verificaAlcance(cap, asig.alcance, sesion.sujeto, req.contexto)) continue;
      if (cap.condicion && req.contexto?.estado) {
        if (!evaluaCondicionEstado(cap.condicion, req.contexto.estado)) continue;
      }

      return {
        permitido: true,
        rolMatch: rol.codigo,
        motivo: 'autorizado',
        anonimizar: cap.alcance === 'ANONIMIZADO',
      };
    }
  }

  return { permitido: false, motivo: 'rol_o_alcance_insuficiente', anonimizar: false };
}

function verificaAlcance(
  cap: Capacidad,
  alcanceAsignado: { tipo: string; valor?: string },
  sujeto: string,
  contexto: SolicitudAutorizacion['contexto'],
): boolean {
  switch (cap.alcance) {
    case 'ESTADO':
      return true;
    case 'ANONIMIZADO':
      return true;
    case 'PROPIO': {
      // El recurso corresponde directamente al sujeto.
      const propios = [
        contexto?.estudianteCurp,
        contexto?.docenteRfc,
        contexto?.tutorCurp,
      ].filter(Boolean);
      return propios.includes(sujeto);
    }
    case 'CCT':
      return alcanceAsignado.tipo === 'CCT' && alcanceAsignado.valor === contexto?.cct;
    case 'ZONA':
      return alcanceAsignado.tipo === 'ZONA' && String(alcanceAsignado.valor) === String(contexto?.zona);
    case 'REGION':
      return alcanceAsignado.tipo === 'REGION' && alcanceAsignado.valor === contexto?.region;
    default:
      return false;
  }
}

/**
 * Evaluador minimalista de condiciones declarativas como
 * "estado = 'CREADO'" o "estado IN ('CREADO','REVISADO_1')".
 *
 * No es una expresión SQL — es la única forma soportada y se usa solo para
 * validar transiciones de estado (RB-02..RB-04). Cualquier extensión debe
 * pasar por revisión de seguridad.
 */
function evaluaCondicionEstado(condicion: string, estadoActual: string): boolean {
  const eqMatch = condicion.match(/estado\s*=\s*'([^']+)'/);
  if (eqMatch) return estadoActual === eqMatch[1];

  const inMatch = condicion.match(/estado\s+IN\s+\(([^)]+)\)/i);
  if (inMatch) {
    const valores = inMatch[1]!
      .split(',')
      .map((s) => s.trim().replace(/^'|'$/g, ''));
    return valores.includes(estadoActual);
  }

  // Condiciones no reconocidas son denegadas por defecto (P-06).
  return false;
}
