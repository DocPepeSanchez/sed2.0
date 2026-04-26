/**
 * Catálogo INALI — lenguas indígenas habladas en México (subset relevante para Yucatán)
 * más español. ISO 639-3.
 *
 * Fuente: Instituto Nacional de Lenguas Indígenas (INALI). Catálogo de las
 * Lenguas Indígenas Nacionales.
 */

export const LENGUAS = [
  { iso: 'spa', nombre: 'Español', familia: 'Indoeuropea' },
  { iso: 'yua', nombre: 'Maya yucateco', familia: 'Maya', endonimo: 'Maaya t’aan' },
  { iso: 'zoc', nombre: 'Zoque', familia: 'Mixe-zoque' },
  { iso: 'mam', nombre: 'Mam', familia: 'Maya' },
  { iso: 'qvm', nombre: "Q'eqchi'", familia: 'Maya' },
  { iso: 'chf', nombre: 'Chontal de Tabasco', familia: 'Maya' },
  { iso: 'cak', nombre: "Kaqchikel", familia: 'Maya' },
  { iso: 'tzh', nombre: 'Tzeltal', familia: 'Maya' },
  { iso: 'tzo', nombre: 'Tsotsil', familia: 'Maya' },
  { iso: 'nah', nombre: 'Náhuatl', familia: 'Yuto-nahua' },
  { iso: 'mix', nombre: 'Mixteco', familia: 'Otomangue' },
  { iso: 'zap', nombre: 'Zapoteco', familia: 'Otomangue' },
  { iso: 'oto', nombre: 'Otomí', familia: 'Otomangue' },
  { iso: 'tar', nombre: 'Tarahumara', familia: 'Yuto-nahua' },
  { iso: 'pur', nombre: 'Purépecha', familia: 'Aislada' },
] as const;

export const IDIOMAS_PLATAFORMA = ['spa', 'yua'] as const;
export type IdiomaPlataforma = (typeof IDIOMAS_PLATAFORMA)[number];
