/**
 * Catálogo oficial — 6 Fases del Plan 2022 (DOF 19/08/2022).
 */

export const FASES = [
  {
    numero: 1,
    nombre: 'Educación Inicial',
    nivel: 'INICIAL' as const,
    gradoInicio: 0,
    gradoFin: 0,
  },
  {
    numero: 2,
    nombre: 'Preescolar',
    nivel: 'PREESCOLAR' as const,
    gradoInicio: 1,
    gradoFin: 3,
  },
  {
    numero: 3,
    nombre: 'Primaria 1.º y 2.º',
    nivel: 'PRIMARIA' as const,
    gradoInicio: 1,
    gradoFin: 2,
  },
  {
    numero: 4,
    nombre: 'Primaria 3.º y 4.º',
    nivel: 'PRIMARIA' as const,
    gradoInicio: 3,
    gradoFin: 4,
  },
  {
    numero: 5,
    nombre: 'Primaria 5.º y 6.º',
    nivel: 'PRIMARIA' as const,
    gradoInicio: 5,
    gradoFin: 6,
  },
  {
    numero: 6,
    nombre: 'Secundaria',
    nivel: 'SECUNDARIA' as const,
    gradoInicio: 1,
    gradoFin: 3,
  },
] as const;
