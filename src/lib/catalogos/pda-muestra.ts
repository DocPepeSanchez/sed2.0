/**
 * Muestra del catálogo de PDA. El catálogo completo (≈ 2,000 entradas)
 * se carga desde los Programas Sintéticos del Plan 2022 publicados en DOF.
 *
 * Esta muestra cubre Fases 2 a 6 con al menos un PDA por campo y por fase,
 * suficiente para arrancar el banco piloto.
 */

import type { CampoFormativoCodigo } from './campos-formativos';

export interface PdaMuestra {
  clave: string;
  campo: CampoFormativoCodigo;
  fase: number;
  grado: number;
  contenido: string;
  descripcion: string;
  ejes: string[];
}

export const PDA_MUESTRA: PdaMuestra[] = [
  // ── Fase 2 — Preescolar ────────────────────────────────────────────────────
  {
    clave: 'L-F2-G3-001',
    campo: 'L',
    fase: 2,
    grado: 3,
    contenido: 'Lengua oral y comunicación',
    descripcion:
      'Reconoce, narra y comparte experiencias propias y de su comunidad usando recursos verbales y no verbales.',
    ejes: ['INC', 'LEE'],
  },
  {
    clave: 'C-F2-G3-001',
    campo: 'C',
    fase: 2,
    grado: 3,
    contenido: 'Patrones, formas y números',
    descripcion: 'Identifica patrones, formas y cantidades en su entorno y los representa con materiales concretos.',
    ejes: ['PCR'],
  },
  {
    clave: 'E-F2-G3-001',
    campo: 'E',
    fase: 2,
    grado: 3,
    contenido: 'Convivencia y cuidado del entorno',
    descripcion: 'Reconoce reglas, derechos y responsabilidades en la convivencia familiar y escolar.',
    ejes: ['IGN', 'INT'],
  },
  {
    clave: 'H-F2-G3-001',
    campo: 'H',
    fase: 2,
    grado: 3,
    contenido: 'Cuerpo, emociones y juego',
    descripcion: 'Identifica y nombra emociones propias y ajenas; coopera en juegos de movimiento y expresión.',
    ejes: ['VID'],
  },
  // ── Fase 3 — Primaria 1.º y 2.º ───────────────────────────────────────────
  {
    clave: 'L-F3-G1-001',
    campo: 'L',
    fase: 3,
    grado: 1,
    contenido: 'Lectura inicial y escritura',
    descripcion: 'Lee y escribe palabras y oraciones con apoyo del contexto y del docente.',
    ejes: ['LEE', 'INC'],
  },
  {
    clave: 'C-F3-G1-001',
    campo: 'C',
    fase: 3,
    grado: 1,
    contenido: 'Números hasta el 100',
    descripcion: 'Reconoce, lee, escribe, compara y ordena números hasta el 100; resuelve problemas aditivos.',
    ejes: ['PCR'],
  },
  // ── Fase 5 — Primaria 5.º y 6.º ───────────────────────────────────────────
  {
    clave: 'L-F5-G6-001',
    campo: 'L',
    fase: 5,
    grado: 6,
    contenido: 'Comprensión lectora avanzada',
    descripcion:
      'Identifica ideas principales y secundarias en textos expositivos y argumentativos; infiere significado a partir del contexto.',
    ejes: ['LEE', 'PCR'],
  },
  {
    clave: 'C-F5-G6-001',
    campo: 'C',
    fase: 5,
    grado: 6,
    contenido: 'Razonamiento proporcional y porcentaje',
    descripcion: 'Resuelve problemas que involucran razones, proporciones y porcentajes en contextos cotidianos.',
    ejes: ['PCR'],
  },
  {
    clave: 'E-F5-G6-001',
    campo: 'E',
    fase: 5,
    grado: 6,
    contenido: 'Derechos humanos e identidad',
    descripcion:
      'Analiza situaciones donde se respetan o vulneran los derechos humanos; reconoce la diversidad cultural de Yucatán.',
    ejes: ['INT', 'IGN'],
  },
  {
    clave: 'H-F5-G6-001',
    campo: 'H',
    fase: 5,
    grado: 6,
    contenido: 'Cuidado de la salud integral',
    descripcion: 'Toma decisiones informadas sobre alimentación, actividad física y bienestar emocional.',
    ejes: ['VID'],
  },
  // ── Fase 6 — Secundaria ────────────────────────────────────────────────────
  {
    clave: 'L-F6-G3-001',
    campo: 'L',
    fase: 6,
    grado: 3,
    contenido: 'Argumentación escrita',
    descripcion:
      'Construye textos argumentativos coherentes, con tesis, argumentos basados en evidencia y contraargumentos.',
    ejes: ['PCR', 'LEE'],
  },
  {
    clave: 'C-F6-G3-001',
    campo: 'C',
    fase: 6,
    grado: 3,
    contenido: 'Funciones lineales y cuadráticas',
    descripcion:
      'Modela situaciones del mundo real mediante funciones lineales y cuadráticas; interpreta gráficas.',
    ejes: ['PCR'],
  },
  {
    clave: 'E-F6-G3-001',
    campo: 'E',
    fase: 6,
    grado: 3,
    contenido: 'Participación democrática',
    descripcion:
      'Analiza problemas de su comunidad y propone soluciones desde un marco de participación democrática.',
    ejes: ['IGN', 'INT', 'INC'],
  },
  {
    clave: 'H-F6-G3-001',
    campo: 'H',
    fase: 6,
    grado: 3,
    contenido: 'Proyecto de vida',
    descripcion: 'Reflexiona sobre su trayectoria y construye un proyecto de vida con metas a corto y mediano plazo.',
    ejes: ['VID', 'AST'],
  },
];
