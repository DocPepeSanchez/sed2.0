/**
 * Catálogo oficial — 4 Campos Formativos del Plan 2022.
 */

export const CAMPOS_FORMATIVOS = [
  {
    codigo: 'L' as const,
    nombre: 'Lenguajes',
    descripcion:
      'Comprende el desarrollo de capacidades comunicativas, lingüísticas, literarias, ' +
      'estéticas y artísticas en lengua materna y otras lenguas.',
  },
  {
    codigo: 'C' as const,
    nombre: 'Saberes y Pensamiento Científico',
    descripcion:
      'Articula matemáticas y ciencias para la comprensión de fenómenos naturales y sociales ' +
      'desde la indagación, la modelación y la argumentación.',
  },
  {
    codigo: 'E' as const,
    nombre: 'Ética, Naturaleza y Sociedades',
    descripcion:
      'Integra estudios sociales, formación cívica, geografía e historia desde la relación ' +
      'persona–comunidad–naturaleza.',
  },
  {
    codigo: 'H' as const,
    nombre: 'De lo Humano y lo Comunitario',
    descripcion:
      'Promueve el desarrollo personal, socioemocional, corporal y artístico en clave ' +
      'comunitaria.',
  },
] as const;

export type CampoFormativoCodigo = (typeof CAMPOS_FORMATIVOS)[number]['codigo'];
