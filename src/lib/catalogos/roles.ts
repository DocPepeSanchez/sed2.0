/**
 * Catálogo de Roles del SED 2.0 — Parte IV §30.
 *
 * Veintidós roles agrupados en 5 familias. La matriz de capacidades implementa
 * la matriz RBAC de §31, expresada como ACL declarativa.
 */

import type { Capacidad } from '@/db/schema/rbac';

export interface RolDefinicion {
  codigo: string;
  familia: 'DIRECTIVA' | 'TECNICA' | 'BANCO_APLICACION' | 'CAMPO' | 'EXTERNA';
  nombre: string;
  descripcion: string;
  capacidades: Capacidad[];
}

const cap = (
  recurso: string,
  verbos: Capacidad['verbos'],
  alcance: Capacidad['alcance'],
  condicion?: string,
): Capacidad => ({ recurso, verbos, alcance, condicion });

export const ROLES: RolDefinicion[] = [
  // ── Familia Directiva ──────────────────────────────────────────────────────
  {
    codigo: 'DIR_GENERAL_CEEEY',
    familia: 'DIRECTIVA',
    nombre: 'Director General CEEEY',
    descripcion: 'Máxima autoridad técnica; preside Consejo Técnico.',
    capacidades: [
      cap('estudiante', ['L'], 'ESTADO'),
      cap('reto', ['L', 'A'], 'ESTADO'),
      cap('instrumento', ['L', 'A'], 'ESTADO'),
      cap('aplicacion', ['L', 'A'], 'ESTADO'),
      cap('respuesta', ['L'], 'ESTADO'),
      cap('calificacion', ['L', 'A'], 'ESTADO'),
      cap('reporte', ['L'], 'ESTADO'),
      cap('decreto', ['L'], 'ESTADO'),
    ],
  },
  {
    codigo: 'COORD_BANCOS',
    familia: 'DIRECTIVA',
    nombre: 'Coordinador de Banco de Reactivos',
    descripcion: 'Lidera la operación del banco de retos.',
    capacidades: [
      cap('reto', ['C', 'L', 'U'], 'ESTADO'),
      cap('instrumento', ['L'], 'ESTADO'),
      cap('reporte', ['L'], 'ESTADO'),
    ],
  },
  {
    codigo: 'COORD_OPERACIONES',
    familia: 'DIRECTIVA',
    nombre: 'Coordinador de Operaciones',
    descripcion: 'Lidera ventanas, logística de aplicación y aplicadores.',
    capacidades: [
      cap('aplicacion', ['C', 'L', 'U', 'A'], 'ESTADO'),
      cap('estudiante', ['L'], 'ESTADO'),
      cap('respuesta', ['L'], 'ESTADO'),
      cap('reporte', ['L'], 'ESTADO'),
    ],
  },
  {
    codigo: 'COORD_TECNOLOGIA',
    familia: 'DIRECTIVA',
    nombre: 'Coordinador de Tecnología',
    descripcion: 'Arquitectura, plataforma e integraciones.',
    capacidades: [
      cap('reto', ['L'], 'ESTADO'),
      cap('instrumento', ['L'], 'ESTADO'),
      cap('aplicacion', ['L'], 'ESTADO'),
      cap('audit', ['L'], 'ESTADO'),
    ],
  },
  // ── Familia Técnica ────────────────────────────────────────────────────────
  {
    codigo: 'PSICOMETRISTA_SR',
    familia: 'TECNICA',
    nombre: 'Psicometrista Senior',
    descripcion: 'Lidera Unidad Psicométrica; aprueba calibraciones.',
    capacidades: [
      cap('estudiante', ['L'], 'ESTADO'), // anonimizado
      cap('reto', ['L', 'U'], 'ESTADO'),
      cap('instrumento', ['L', 'U'], 'ESTADO'),
      cap('respuesta', ['L'], 'ESTADO'),
      cap('parametros_tri', ['C', 'L', 'U', 'A'], 'ESTADO'),
    ],
  },
  {
    codigo: 'ANALISTA_PSI',
    familia: 'TECNICA',
    nombre: 'Analista Psicométrico',
    descripcion: 'Calibración, equating y análisis DIF.',
    capacidades: [
      cap('reto', ['L'], 'ESTADO'),
      cap('respuesta', ['L'], 'ESTADO'),
      cap('parametros_tri', ['C', 'L', 'U'], 'ESTADO'),
    ],
  },
  {
    codigo: 'ARQUITECTO_SISTEMAS',
    familia: 'TECNICA',
    nombre: 'Arquitecto de Sistemas',
    descripcion: 'Decisiones técnicas mayores y ADRs.',
    capacidades: [
      cap('audit', ['L'], 'ESTADO'),
      cap('instrumento', ['L'], 'ESTADO'),
      cap('aplicacion', ['L'], 'ESTADO'),
    ],
  },
  {
    codigo: 'DBA',
    familia: 'TECNICA',
    nombre: 'Administrador de Base de Datos',
    descripcion: 'Operación de la capa de datos.',
    capacidades: [cap('audit', ['L'], 'ESTADO')],
  },
  {
    codigo: 'OFICIAL_INFO',
    familia: 'TECNICA',
    nombre: 'Oficial de Información y Auditoría',
    descripcion: 'Vela por audit log y atiende auditorías externas.',
    capacidades: [cap('audit', ['L'], 'ESTADO'), cap('reporte', ['L'], 'ESTADO')],
  },
  {
    codigo: 'RESP_DATOS',
    familia: 'TECNICA',
    nombre: 'Responsable Formal de Datos Personales',
    descripcion: 'Designado por Director; responde solicitudes ARCO.',
    capacidades: [cap('estudiante', ['L', 'U'], 'ESTADO'), cap('audit', ['L'], 'ESTADO')],
  },
  // ── Familia Banco / Aplicación ─────────────────────────────────────────────
  {
    codigo: 'ELABORADOR',
    familia: 'BANCO_APLICACION',
    nombre: 'Elaborador',
    descripcion: 'Construye retos para PDA asignados.',
    capacidades: [cap('reto', ['C', 'L', 'U'], 'PROPIO', "estado IN ('CREADO','REVISADO_1')")],
  },
  {
    codigo: 'REVISOR_1',
    familia: 'BANCO_APLICACION',
    nombre: 'Revisor 1 (ciega)',
    descripcion: 'Primera revisión a ciegas.',
    capacidades: [cap('reto', ['L', 'U'], 'ESTADO', "estado = 'CREADO'")],
  },
  {
    codigo: 'REVISOR_2',
    familia: 'BANCO_APLICACION',
    nombre: 'Revisor 2 (ciega)',
    descripcion: 'Segunda revisión a ciegas.',
    capacidades: [cap('reto', ['L', 'U'], 'ESTADO', "estado = 'REVISADO_1'")],
  },
  {
    codigo: 'REVISOR_ARBITRO',
    familia: 'BANCO_APLICACION',
    nombre: 'Revisor 3 (Árbitro)',
    descripcion: 'Resuelve discrepancias entre Revisor 1 y 2.',
    capacidades: [cap('reto', ['L', 'U', 'A'], 'ESTADO', "estado = 'EN_ARBITRAJE'")],
  },
  {
    codigo: 'REVISOR_EDITORIAL',
    familia: 'BANCO_APLICACION',
    nombre: 'Revisor Editorial',
    descripcion: 'Revisión filológica obligatoria (RB-03).',
    capacidades: [cap('reto', ['L', 'U'], 'ESTADO', "estado = 'REVISADO_2'")],
  },
  {
    codigo: 'REVISOR_PERTINENCIA',
    familia: 'BANCO_APLICACION',
    nombre: 'Revisor de Pertinencia Cultural',
    descripcion: 'Comité de Pertinencia; hablante nativo de maya yucateco.',
    capacidades: [cap('reto', ['L', 'U'], 'ESTADO', "idioma = 'yua' OR pertinencia_revisada = false")],
  },
  {
    codigo: 'APLICADOR',
    familia: 'BANCO_APLICACION',
    nombre: 'Aplicador Certificado',
    descripcion: 'Conduce sesiones de aplicación; certificación bienal.',
    capacidades: [
      cap('estudiante', ['L'], 'CCT'),
      cap('aplicacion', ['L', 'U'], 'CCT'),
      cap('respuesta', ['L', 'U'], 'CCT'),
    ],
  },
  {
    codigo: 'ASISTENTE_TECNICO',
    familia: 'BANCO_APLICACION',
    nombre: 'Asistente Técnico de Sala',
    descripcion: 'Soporte tecnológico en sala de aplicación.',
    capacidades: [cap('aplicacion', ['L'], 'CCT')],
  },
  {
    codigo: 'CALIFICADOR',
    familia: 'BANCO_APLICACION',
    nombre: 'Calificador Humano Certificado',
    descripcion: 'Califica respuestas abiertas.',
    capacidades: [
      cap('respuesta', ['L'], 'PROPIO'), // solo asignadas
      cap('calificacion', ['C', 'U'], 'PROPIO'),
    ],
  },
  // ── Familia Campo ──────────────────────────────────────────────────────────
  {
    codigo: 'DIRECTOR_ESCUELA',
    familia: 'CAMPO',
    nombre: 'Director de Escuela',
    descripcion: 'Responsable formal de aplicación en su CCT.',
    capacidades: [
      cap('estudiante', ['L'], 'CCT'),
      cap('aplicacion', ['L'], 'CCT'),
      cap('reporte', ['L'], 'CCT'),
      cap('alerta', ['L', 'U'], 'CCT'),
    ],
  },
  {
    codigo: 'SUPERVISOR_ZONA',
    familia: 'CAMPO',
    nombre: 'Supervisor de Zona',
    descripcion: 'Supervisión muestral; vinculación con CTE.',
    capacidades: [
      cap('estudiante', ['L'], 'ZONA'),
      cap('aplicacion', ['L'], 'ZONA'),
      cap('reporte', ['L'], 'ZONA'),
      cap('alerta', ['L', 'U'], 'ZONA'),
    ],
  },
  {
    codigo: 'DOCENTE',
    familia: 'CAMPO',
    nombre: 'Docente',
    descripcion: 'Recibe reportes; ejecuta intervenciones pedagógicas.',
    capacidades: [
      cap('estudiante', ['L'], 'PROPIO'),
      cap('reporte', ['L'], 'PROPIO'),
      cap('plan_intervencion', ['C', 'L', 'U'], 'PROPIO'),
    ],
  },
  // ── Familia Externa ────────────────────────────────────────────────────────
  {
    codigo: 'ESTUDIANTE',
    familia: 'EXTERNA',
    nombre: 'Estudiante',
    descripcion: 'Responde instrumentos asignados.',
    capacidades: [
      cap('estudiante', ['L'], 'PROPIO'),
      cap('respuesta', ['C', 'L'], 'PROPIO'),
      cap('reporte', ['L'], 'PROPIO'),
    ],
  },
  {
    codigo: 'TUTOR',
    familia: 'EXTERNA',
    nombre: 'Tutor',
    descripcion: 'Padre/madre o responsable; firma consentimiento.',
    capacidades: [
      cap('estudiante', ['L'], 'PROPIO'),
      cap('reporte', ['L'], 'PROPIO'),
    ],
  },
  {
    codigo: 'AUDITOR_EXTERNO',
    familia: 'EXTERNA',
    nombre: 'Auditor externo',
    descripcion: 'INAIP, ASEY, CONADIS, organismo certificador ISO.',
    capacidades: [
      cap('reto', ['L'], 'ANONIMIZADO'),
      cap('aplicacion', ['L'], 'ANONIMIZADO'),
      cap('respuesta', ['L'], 'ANONIMIZADO'),
      cap('audit', ['L'], 'ESTADO'),
    ],
  },
  {
    codigo: 'INVESTIGADOR_EXT',
    familia: 'EXTERNA',
    nombre: 'Investigador externo',
    descripcion: 'Acceso a microdatos anonimizados publicados (Observatorio).',
    capacidades: [
      cap('reto', ['L'], 'ANONIMIZADO'),
      cap('respuesta', ['L'], 'ANONIMIZADO'),
      cap('reporte', ['L'], 'ANONIMIZADO'),
    ],
  },
];

export const ROLES_BY_CODE = Object.fromEntries(ROLES.map((r) => [r.codigo, r] as const));
