/**
 * Configuración de next-intl. P-09 — bilingüismo por diseño (es / yua).
 */

import { getRequestConfig } from 'next-intl/server';

const locales = ['es', 'yua'] as const;

export default getRequestConfig(async ({ locale }) => {
  const safe = locales.includes(locale as (typeof locales)[number]) ? locale : 'es';
  return {
    locale: safe,
    messages: (await import(`../../messages/${safe}.json`)).default,
    timeZone: 'America/Merida',
    now: new Date(),
  };
});
