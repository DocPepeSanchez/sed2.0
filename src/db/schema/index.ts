/**
 * Esquema completo del SED 2.0.
 *
 * Estructura por dominios (Parte III, sección 26):
 *  - Identidad        — estudiantes, personal, escuelas, tutores
 *  - Curricular       — campos formativos, fases, ejes, PDA
 *  - Banco de retos   — retos, versiones, parámetros TRI, multimedia
 *  - Aplicación       — instrumentos, formas, aplicaciones, sesiones, respuestas
 *  - Resultados       — calificaciones, theta, bandas, reportes, alertas
 *
 * Cada tabla cumple los principios P-04 (inmutabilidad), P-05 (cifrado),
 * P-07 (trazabilidad) y P-11 (modular y desacoplado).
 */

export * from './identidad';
export * from './curricular';
export * from './banco';
export * from './aplicacion';
export * from './resultados';
export * from './rbac';
export * from './audit';
