/**
 * Catálogo de BAP — Barreras para el Aprendizaje y la Participación.
 *
 * Tipología armonizada con DGEI/SEP y Educación Especial. La condición BAP
 * de cada estudiante se almacena cifrada (ADR-10) y dispara acomodaciones
 * automáticas (RA-05).
 */

export const TIPOS_BAP = [
  // Discapacidad
  { codigo: 'D-VIS', categoria: 'DISCAPACIDAD', nombre: 'Discapacidad visual' },
  { codigo: 'D-AUD', categoria: 'DISCAPACIDAD', nombre: 'Discapacidad auditiva' },
  { codigo: 'D-MOT', categoria: 'DISCAPACIDAD', nombre: 'Discapacidad motriz' },
  { codigo: 'D-INT', categoria: 'DISCAPACIDAD', nombre: 'Discapacidad intelectual' },
  { codigo: 'D-PSI', categoria: 'DISCAPACIDAD', nombre: 'Discapacidad psicosocial' },
  { codigo: 'D-MUL', categoria: 'DISCAPACIDAD', nombre: 'Discapacidad múltiple' },
  // Trastornos del desarrollo
  { codigo: 'T-TEA', categoria: 'TRASTORNO', nombre: 'Trastorno del espectro autista' },
  { codigo: 'T-TDA', categoria: 'TRASTORNO', nombre: 'Trastorno por déficit de atención' },
  { codigo: 'T-DIS', categoria: 'TRASTORNO', nombre: 'Dislexia' },
  { codigo: 'T-DIG', categoria: 'TRASTORNO', nombre: 'Disgrafía' },
  { codigo: 'T-DIC', categoria: 'TRASTORNO', nombre: 'Discalculia' },
  // Aptitudes sobresalientes
  { codigo: 'A-INT', categoria: 'APTITUDES', nombre: 'Aptitud sobresaliente intelectual' },
  { codigo: 'A-CRE', categoria: 'APTITUDES', nombre: 'Aptitud sobresaliente creativa' },
  { codigo: 'A-SOC', categoria: 'APTITUDES', nombre: 'Aptitud sobresaliente socioafectiva' },
  { codigo: 'A-PSI', categoria: 'APTITUDES', nombre: 'Aptitud sobresaliente psicomotriz' },
  { codigo: 'A-ART', categoria: 'APTITUDES', nombre: 'Aptitud sobresaliente artística' },
  // Contexto
  { codigo: 'C-LIN', categoria: 'CONTEXTO', nombre: 'Barrera lingüística (no hablante de español)' },
  { codigo: 'C-MIG', categoria: 'CONTEXTO', nombre: 'Migración / interrupción escolar' },
  { codigo: 'C-VUL', categoria: 'CONTEXTO', nombre: 'Vulnerabilidad social' },
  { codigo: 'C-ENF', categoria: 'CONTEXTO', nombre: 'Enfermedad crónica' },
  { codigo: 'C-PRA', categoria: 'CONTEXTO', nombre: 'Prácticas culturales restrictivas' },
] as const;

/**
 * Catálogo de acomodaciones — Parte III §28.
 * Cada acomodación tiene una clave técnica, un nombre legible y parámetros.
 */
export const ACOMODACIONES = [
  { codigo: 'TIME-1.5X', nombre: 'Tiempo extendido 1.5x', factor: 1.5 },
  { codigo: 'TIME-2X', nombre: 'Tiempo extendido 2x', factor: 2.0 },
  { codigo: 'TIME-3X', nombre: 'Tiempo extendido 3x', factor: 3.0 },
  { codigo: 'AUDIO', nombre: 'Reproducción de audio del enunciado' },
  { codigo: 'MAGNI', nombre: 'Magnificación de pantalla', factor: 2.0 },
  { codigo: 'CONTRA', nombre: 'Contraste alto' },
  { codigo: 'CALC', nombre: 'Calculadora' },
  { codigo: 'ESCRIBA', nombre: 'Escriba (responde a través de un asistente)' },
  { codigo: 'LECTOR', nombre: 'Lector' },
  { codigo: 'DESCANSOS', nombre: 'Descansos programados' },
  { codigo: 'SALA-RED', nombre: 'Ambiente con estímulo reducido' },
] as const;
