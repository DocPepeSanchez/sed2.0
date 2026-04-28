/**
 * Mapeo de rol asignado → "perfil" para vistas role-based.
 *
 * Las cuatro familias visibles en la UI son simplificaciones de las
 * 22 capacidades RBAC: directivo, académico, docente, estudiante. El
 * resto de roles (aplicador, externo, etc.) caen en "otro".
 */

export type Perfil = 'directivo' | 'academico' | 'docente' | 'estudiante' | 'otro';

const PERFIL_POR_ROL: Record<string, Perfil> = {
  // Directivos
  DIR_GENERAL_CEEEY: 'directivo',
  COORD_BANCOS: 'directivo',
  COORD_OPERACIONES: 'directivo',
  COORD_TECNOLOGIA: 'directivo',
  DIRECTOR_ESCUELA: 'directivo',
  SUPERVISOR_ZONA: 'directivo',

  // Académicos / Técnicos
  PSICOMETRISTA_SR: 'academico',
  ANALISTA_PSI: 'academico',
  ARQUITECTO_SISTEMAS: 'academico',
  DBA: 'academico',
  OFICIAL_INFO: 'academico',
  RESP_DATOS: 'academico',
  ELABORADOR: 'academico',
  REVISOR_1: 'academico',
  REVISOR_2: 'academico',
  REVISOR_ARBITRO: 'academico',
  REVISOR_EDITORIAL: 'academico',
  REVISOR_PERTINENCIA: 'academico',
  CALIFICADOR: 'academico',

  // Docentes / Aplicadores en aula
  DOCENTE: 'docente',
  APLICADOR: 'docente',
  ASISTENTE_TECNICO: 'docente',

  // Estudiantes / Tutores
  ESTUDIANTE: 'estudiante',
  TUTOR: 'estudiante',

  // Externos
  AUDITOR_EXTERNO: 'otro',
  INVESTIGADOR_EXT: 'otro',
};

export function perfilDeRoles(roles: string[]): Perfil {
  for (const r of roles) {
    const p = PERFIL_POR_ROL[r];
    if (p && p !== 'otro') return p;
  }
  return roles.length > 0 ? 'otro' : 'otro';
}
